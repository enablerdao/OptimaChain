//! OptimaChain blockchain core library
//! 
//! This library provides the core functionality for the OptimaChain blockchain.
//! It includes modules for consensus, networking, sharding, storage, and WASM execution.

// Re-export modules
pub mod types;
pub mod consensus;
pub mod network;
pub mod sharding;
pub mod storage;
pub mod wasm;
pub mod utils;

// Re-export commonly used types
pub use types::{Block, BlockHeader, BlockId, Transaction, TransactionType, TransactionId, Account, AccountId, Balance, State};
pub use consensus::{APoS, APoSConfig, Validator, ValidatorSet};
pub use network::{Protocol, ProtocolConfig, Message, MessageType};
pub use sharding::{Shard, ShardId, ShardConfig, ShardAllocation};
pub use storage::{Database, DatabaseConfig, StorageError};
pub use wasm::{WasmRuntime, RuntimeConfig, Contract, ContractInstance};
pub use utils::{Result, Error, Config, KeyPair, Signature};

/// Version of the OptimaChain blockchain
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// Initialize the blockchain with the given configuration
pub fn init(config: utils::Config) -> utils::Result<Blockchain> {
    // Initialize logger
    utils::init_logger(parse_log_level(&config.node.log_level))
        .map_err(|e| utils::Error::config(format!("Failed to initialize logger: {}", e)))?;
    
    log::info!("Initializing OptimaChain blockchain v{}", VERSION);
    
    // Create blockchain instance
    let blockchain = Blockchain::new(config)?;
    
    log::info!("OptimaChain blockchain initialized");
    
    Ok(blockchain)
}

/// Parse log level from string
fn parse_log_level(level: &str) -> utils::LogLevel {
    match level.to_lowercase().as_str() {
        "error" => utils::LogLevel::Error,
        "warn" => utils::LogLevel::Warn,
        "info" => utils::LogLevel::Info,
        "debug" => utils::LogLevel::Debug,
        "trace" => utils::LogLevel::Trace,
        _ => utils::LogLevel::Info,
    }
}

/// Main blockchain struct
pub struct Blockchain {
    /// Configuration
    config: utils::Config,
    /// Database
    database: storage::Database,
    /// Network protocol
    protocol: network::Protocol,
    /// Consensus engine
    consensus: consensus::APoS,
    /// Shards
    shards: Vec<sharding::Shard>,
    /// WASM runtime
    wasm_runtime: wasm::WasmRuntime,
}

impl Blockchain {
    /// Create a new blockchain instance
    pub fn new(config: utils::Config) -> utils::Result<Self> {
        // Initialize database
        let database_config = storage::DatabaseConfig {
            path: config.storage.db_path.clone(),
            column_families: vec![
                "blocks".to_string(),
                "transactions".to_string(),
                "accounts".to_string(),
                "state".to_string(),
                "metadata".to_string(),
            ],
            create_if_missing: true,
            create_missing_column_families: true,
            increase_parallelism: Some(4),
            memory_budget: Some(config.storage.cache_size),
        };
        
        let mut database = storage::Database::new(database_config);
        database.open().map_err(|e| utils::Error::database(e.to_string()))?;
        
        // Initialize network protocol
        let protocol_config = network::ProtocolConfig {
            protocol_name: "/optimachain/1.0.0".to_string(),
            protocol_version: "1.0.0".to_string(),
            request_timeout: config.network.connection_timeout,
            max_message_size: 10 * 1024 * 1024, // 10 MB
            max_concurrent_requests: 100,
        };
        
        let protocol = network::Protocol::new(protocol_config);
        
        // Initialize consensus
        let consensus_config = consensus::APoSConfig {
            min_stake: config.consensus.min_stake_amount,
            max_validators: config.consensus.max_validators,
            block_time_target_ms: config.consensus.block_time_ms,
            epoch_length: 10_000, // ~3 hours with 1s blocks
            block_reward: 100_000_000, // 100 tokens
            validator_fee_percentage: 70, // 70%
        };
        
        let consensus = consensus::APoS::new(consensus_config);
        
        // Initialize shards
        let mut shards = Vec::new();
        
        if config.sharding.enable_sharding {
            for i in 0..config.sharding.shard_count {
                let shard_config = sharding::ShardConfig::default();
                let shard = sharding::Shard::new(sharding::ShardId(i as u32), shard_config);
                shards.push(shard);
            }
        }
        
        // Initialize WASM runtime
        let runtime_type = match config.wasm.runtime_type.as_str() {
            "wasmer" => wasm::RuntimeType::Wasmer,
            "wasmtime" => wasm::RuntimeType::Wasmtime,
            _ => wasm::RuntimeType::Wasmer,
        };
        
        let runtime_config = wasm::RuntimeConfig {
            runtime_type,
            max_memory_pages: config.wasm.max_memory_pages,
            enable_reference_types: true,
            enable_simd: config.wasm.enable_simd,
            enable_bulk_memory: true,
            enable_threads: false,
            enable_multi_value: true,
            max_execution_time_ms: config.wasm.max_execution_time_ms,
        };
        
        let wasm_runtime = wasm::WasmRuntime::new(runtime_config);
        
        Ok(Blockchain {
            config,
            database,
            protocol,
            consensus,
            shards,
            wasm_runtime,
        })
    }
    
    /// Start the blockchain
    pub fn start(&mut self) -> utils::Result<()> {
        log::info!("Starting OptimaChain blockchain");
        
        // Start network protocol
        self.protocol.start().map_err(|e| utils::Error::from(e))?;
        
        // Start consensus
        self.consensus.start().map_err(|e| utils::Error::from(e))?;
        
        log::info!("OptimaChain blockchain started");
        
        Ok(())
    }
    
    /// Stop the blockchain
    pub fn stop(&mut self) -> utils::Result<()> {
        log::info!("Stopping OptimaChain blockchain");
        
        // Stop consensus
        self.consensus.stop().map_err(|e| utils::Error::from(e))?;
        
        // Stop network protocol
        self.protocol.stop().map_err(|e| utils::Error::from(e))?;
        
        // Close database
        self.database.close();
        
        log::info!("OptimaChain blockchain stopped");
        
        Ok(())
    }
    
    /// Get the blockchain configuration
    pub fn config(&self) -> &utils::Config {
        &self.config
    }
    
    /// Get the database
    pub fn database(&self) -> &storage::Database {
        &self.database
    }
    
    /// Get the network protocol
    pub fn protocol(&self) -> &network::Protocol {
        &self.protocol
    }
    
    /// Get the consensus engine
    pub fn consensus(&self) -> &consensus::APoS {
        &self.consensus
    }
    
    /// Get the shards
    pub fn shards(&self) -> &[sharding::Shard] {
        &self.shards
    }
    
    /// Get the WASM runtime
    pub fn wasm_runtime(&self) -> &wasm::WasmRuntime {
        &self.wasm_runtime
    }
}
