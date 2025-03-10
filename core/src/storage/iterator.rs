use rocksdb::{DBIterator, IteratorMode as RocksIteratorMode};
use std::sync::Arc;

/// Mode for iterating over keys
#[derive(Debug, Clone)]
pub enum IteratorMode {
    /// Start from the beginning
    Start,
    /// Start from the end
    End,
    /// Start from a specific key
    From(Vec<u8>),
}

/// Iterator over keys and values in the database
pub struct StorageIterator {
    /// RocksDB iterator
    iter: DBIterator<Arc<rocksdb::DB>>,
    /// Prefix to filter by
    prefix: Vec<u8>,
}

impl StorageIterator {
    /// Create a new storage iterator
    pub fn new(iter: DBIterator<Arc<rocksdb::DB>>, prefix: Vec<u8>) -> Self {
        StorageIterator {
            iter,
            prefix,
        }
    }
    
    /// Get the next key-value pair
    pub fn next(&mut self) -> Option<(Vec<u8>, Vec<u8>)> {
        if let Some((key, value)) = self.iter.next() {
            // Check if key has the correct prefix
            if key.starts_with(&self.prefix) {
                return Some((key.to_vec(), value.to_vec()));
            }
        }
        
        None
    }
    
    /// Get the next key
    pub fn next_key(&mut self) -> Option<Vec<u8>> {
        self.next().map(|(key, _)| key)
    }
    
    /// Get the next value
    pub fn next_value(&mut self) -> Option<Vec<u8>> {
        self.next().map(|(_, value)| value)
    }
    
    /// Collect all key-value pairs
    pub fn collect(&mut self) -> Vec<(Vec<u8>, Vec<u8>)> {
        let mut result = Vec::new();
        
        while let Some((key, value)) = self.next() {
            result.push((key, value));
        }
        
        result
    }
    
    /// Collect all keys
    pub fn collect_keys(&mut self) -> Vec<Vec<u8>> {
        let mut result = Vec::new();
        
        while let Some((key, _)) = self.next() {
            result.push(key);
        }
        
        result
    }
    
    /// Collect all values
    pub fn collect_values(&mut self) -> Vec<Vec<u8>> {
        let mut result = Vec::new();
        
        while let Some((_, value)) = self.next() {
            result.push(value);
        }
        
        result
    }
    
    /// Count the number of items
    pub fn count(&mut self) -> usize {
        let mut count = 0;
        
        while let Some(_) = self.next() {
            count += 1;
        }
        
        count
    }
}
