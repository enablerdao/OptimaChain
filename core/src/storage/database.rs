use crate::storage::{Batch, BatchOperation, StorageIterator, IteratorMode, KeyPrefix, StorageKey};
use rocksdb::{DB, Options, ColumnFamilyDescriptor, ReadOptions, WriteOptions, IteratorMode as RocksIteratorMode};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use thiserror::Error;

/// Errors that can occur during storage operations
#[derive(Error, Debug)]
pub enum StorageError {
    /// Error from RocksDB
    #[error("RocksDB error: {0}")]
    RocksDB(#[from] rocksdb::Error),
    
    /// Error serializing data
    #[error("Serialization error: {0}")]
    Serialization(String),
    
    /// Error deserializing data
    #[error("Deserialization error: {0}")]
    Deserialization(String),
    
    /// Key not found
    #[error("Key not found: {0}")]
    KeyNotFound(String),
    
    /// Column family not found
    #[error("Column family not found: {0}")]
    ColumnFamilyNotFound(String),
    
    /// Database already open
    #[error("Database already open")]
    DatabaseAlreadyOpen,
    
    /// Database not open
    #[error("Database not open")]
    DatabaseNotOpen,
    
    /// Other error
    #[error("Storage error: {0}")]
    Other(String),
}

/// Configuration for the database
#[derive(Debug, Clone)]
pub struct DatabaseConfig {
    /// Path to the database
    pub path: PathBuf,
    /// Column families to create
    pub column_families: Vec<String>,
    /// Create if missing
    pub create_if_missing: bool,
    /// Create missing column families
    pub create_missing_column_families: bool,
    /// Parallelism for background jobs
    pub increase_parallelism: Option<i32>,
    /// Memory budget in bytes
    pub memory_budget: Option<usize>,
}

impl Default for DatabaseConfig {
    fn default() -> Self {
        DatabaseConfig {
            path: PathBuf::from("./data/db"),
            column_families: vec!["default".to_string()],
            create_if_missing: true,
            create_missing_column_families: true,
            increase_parallelism: Some(4),
            memory_budget: Some(512 * 1024 * 1024), // 512 MB
        }
    }
}

/// Database for storing blockchain data
pub struct Database {
    /// RocksDB instance
    db: Option<Arc<DB>>,
    /// Configuration
    config: DatabaseConfig,
}

impl Database {
    /// Create a new database
    pub fn new(config: DatabaseConfig) -> Self {
        Database {
            db: None,
            config,
        }
    }
    
    /// Open the database
    pub fn open(&mut self) -> Result<(), StorageError> {
        if self.db.is_some() {
            return Err(StorageError::DatabaseAlreadyOpen);
        }
        
        let mut options = Options::default();
        options.create_if_missing(self.config.create_if_missing);
        options.create_missing_column_families(self.config.create_missing_column_families);
        
        if let Some(parallelism) = self.config.increase_parallelism {
            options.increase_parallelism(parallelism);
        }
        
        if let Some(memory_budget) = self.config.memory_budget {
            options.optimize_for_point_lookup(memory_budget);
        }
        
        // Create column family descriptors
        let cf_descriptors: Vec<_> = self.config.column_families
            .iter()
            .map(|name| ColumnFamilyDescriptor::new(name, Options::default()))
            .collect();
        
        // Open the database
        let db = DB::open_cf_descriptors(&options, &self.config.path, cf_descriptors)
            .map_err(StorageError::RocksDB)?;
        
        self.db = Some(Arc::new(db));
        
        Ok(())
    }
    
    /// Close the database
    pub fn close(&mut self) {
        self.db = None;
    }
    
    /// Check if the database is open
    pub fn is_open(&self) -> bool {
        self.db.is_some()
    }
    
    /// Get the database configuration
    pub fn config(&self) -> &DatabaseConfig {
        &self.config
    }
    
    /// Get a value from the database
    pub fn get<K: StorageKey>(&self, key: &K) -> Result<Option<Vec<u8>>, StorageError> {
        let db = self.db.as_ref().ok_or(StorageError::DatabaseNotOpen)?;
        
        let cf_name = K::column_family();
        let cf = db.cf_handle(&cf_name)
            .ok_or_else(|| StorageError::ColumnFamilyNotFound(cf_name))?;
        
        let key_bytes = key.encode();
        
        db.get_cf(cf, key_bytes).map_err(StorageError::RocksDB)
    }
    
    /// Put a value in the database
    pub fn put<K: StorageKey>(&self, key: &K, value: &[u8]) -> Result<(), StorageError> {
        let db = self.db.as_ref().ok_or(StorageError::DatabaseNotOpen)?;
        
        let cf_name = K::column_family();
        let cf = db.cf_handle(&cf_name)
            .ok_or_else(|| StorageError::ColumnFamilyNotFound(cf_name))?;
        
        let key_bytes = key.encode();
        
        db.put_cf(cf, key_bytes, value).map_err(StorageError::RocksDB)
    }
    
    /// Delete a value from the database
    pub fn delete<K: StorageKey>(&self, key: &K) -> Result<(), StorageError> {
        let db = self.db.as_ref().ok_or(StorageError::DatabaseNotOpen)?;
        
        let cf_name = K::column_family();
        let cf = db.cf_handle(&cf_name)
            .ok_or_else(|| StorageError::ColumnFamilyNotFound(cf_name))?;
        
        let key_bytes = key.encode();
        
        db.delete_cf(cf, key_bytes).map_err(StorageError::RocksDB)
    }
    
    /// Check if a key exists in the database
    pub fn exists<K: StorageKey>(&self, key: &K) -> Result<bool, StorageError> {
        let result = self.get(key)?;
        Ok(result.is_some())
    }
    
    /// Apply a batch of operations to the database
    pub fn apply_batch(&self, batch: &Batch) -> Result<(), StorageError> {
        let db = self.db.as_ref().ok_or(StorageError::DatabaseNotOpen)?;
        
        let mut rocks_batch = rocksdb::WriteBatch::default();
        
        for operation in &batch.operations {
            match operation {
                BatchOperation::Put { cf, key, value } => {
                    let cf_handle = db.cf_handle(cf)
                        .ok_or_else(|| StorageError::ColumnFamilyNotFound(cf.clone()))?;
                    rocks_batch.put_cf(cf_handle, key, value);
                }
                BatchOperation::Delete { cf, key } => {
                    let cf_handle = db.cf_handle(cf)
                        .ok_or_else(|| StorageError::ColumnFamilyNotFound(cf.clone()))?;
                    rocks_batch.delete_cf(cf_handle, key);
                }
            }
        }
        
        let write_options = WriteOptions::default();
        db.write_opt(rocks_batch, &write_options).map_err(StorageError::RocksDB)
    }
    
    /// Create an iterator over a range of keys with a common prefix
    pub fn iter_prefix<P: KeyPrefix>(&self, prefix: &P, mode: IteratorMode) -> Result<StorageIterator, StorageError> {
        let db = self.db.as_ref().ok_or(StorageError::DatabaseNotOpen)?;
        
        let cf_name = P::column_family();
        let cf = db.cf_handle(&cf_name)
            .ok_or_else(|| StorageError::ColumnFamilyNotFound(cf_name))?;
        
        let prefix_bytes = prefix.encode();
        
        let mut read_options = ReadOptions::default();
        read_options.set_prefix_same_as_start(true);
        
        let rocks_mode = match mode {
            IteratorMode::Start => RocksIteratorMode::From(prefix_bytes.clone(), rocksdb::Direction::Forward),
            IteratorMode::End => RocksIteratorMode::From(prefix_bytes.clone(), rocksdb::Direction::Reverse),
            IteratorMode::From(ref key) => RocksIteratorMode::From(key.clone(), rocksdb::Direction::Forward),
        };
        
        let iter = db.iterator_cf_opt(cf, read_options, rocks_mode);
        
        Ok(StorageIterator::new(iter, prefix_bytes))
    }
    
    /// Compact the database
    pub fn compact(&self) -> Result<(), StorageError> {
        let db = self.db.as_ref().ok_or(StorageError::DatabaseNotOpen)?;
        
        for cf_name in &self.config.column_families {
            if let Some(cf) = db.cf_handle(cf_name) {
                db.compact_range_cf(cf, None::<&[u8]>, None::<&[u8]>);
            }
        }
        
        Ok(())
    }
    
    /// Get the approximate size of the database
    pub fn approximate_size(&self) -> Result<u64, StorageError> {
        let db = self.db.as_ref().ok_or(StorageError::DatabaseNotOpen)?;
        
        let mut total_size = 0;
        
        for cf_name in &self.config.column_families {
            if let Some(cf) = db.cf_handle(cf_name) {
                let size = db.property_int_value_cf(cf, "rocksdb.estimate-live-data-size")
                    .map_err(StorageError::RocksDB)?
                    .unwrap_or(0);
                
                total_size += size;
            }
        }
        
        Ok(total_size)
    }
}
