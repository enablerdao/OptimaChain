use serde::{Serialize, Deserialize};
use std::fs::File;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use crate::utils::errors::{Result, Error};

/// Configuration for the blockchain
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    /// Network configuration
    pub network: NetworkConfig,
    /// Consensus configuration
    pub consensus: ConsensusConfig,
    /// Storage configuration
    pub storage: StorageConfig,
    /// Sharding configuration
    pub sharding: ShardingConfig,
    /// WASM configuration
    pub wasm: WasmConfig,
    /// Node configuration
    pub node: NodeConfig,
}

/// Network configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkConfig {
    /// Listen address
    pub listen_address: String,
    /// External address
    pub external_address: Option<String>,
    /// Bootstrap nodes
    pub bootstrap_nodes: Vec<String>,
    /// Maximum number of peers
    pub max_peers: usize,
    /// Connection timeout in seconds
    pub connection_timeout: u64,
    /// Enable NAT traversal
    pub enable_nat_traversal: bool,
}

/// Consensus configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsensusConfig {
    /// Consensus algorithm
    pub algorithm: String,
    /// Block time in milliseconds
    pub block_time_ms: u64,
    /// Minimum stake amount
    pub min_stake_amount: u64,
    /// Maximum validators
    pub max_validators: usize,
    /// Validator performance threshold
    pub validator_performance_threshold: f64,
}

/// Storage configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorageConfig {
    /// Database path
    pub db_path: PathBuf,
    /// Cache size in bytes
    pub cache_size: usize,
    /// Maximum open files
    pub max_open_files: i32,
    /// Enable compression
    pub enable_compression: bool,
}

/// Sharding configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShardingConfig {
    /// Enable sharding
    pub enable_sharding: bool,
    /// Number of shards
    pub shard_count: usize,
    /// Resharding threshold
    pub resharding_threshold: f64,
    /// Allocation strategy
    pub allocation_strategy: String,
}

/// WASM configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WasmConfig {
    /// WASM runtime type
    pub runtime_type: String,
    /// Maximum memory pages
    pub max_memory_pages: u32,
    /// Enable SIMD
    pub enable_simd: bool,
    /// Maximum execution time in milliseconds
    pub max_execution_time_ms: u64,
}

/// Node configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeConfig {
    /// Node name
    pub name: String,
    /// Node role
    pub role: String,
    /// Data directory
    pub data_dir: PathBuf,
    /// Log level
    pub log_level: String,
    /// Log file
    pub log_file: Option<PathBuf>,
    /// Enable metrics
    pub enable_metrics: bool,
    /// Metrics address
    pub metrics_address: Option<String>,
    /// Enable API
    pub enable_api: bool,
    /// API address
    pub api_address: Option<String>,
}

impl Default for Config {
    fn default() -> Self {
        Config {
            network: NetworkConfig {
                listen_address: "0.0.0.0:30333".to_string(),
                external_address: None,
                bootstrap_nodes: Vec::new(),
                max_peers: 50,
                connection_timeout: 30,
                enable_nat_traversal: true,
            },
            consensus: ConsensusConfig {
                algorithm: "apos".to_string(),
                block_time_ms: 1000,
                min_stake_amount: 1000,
                max_validators: 100,
                validator_performance_threshold: 0.8,
            },
            storage: StorageConfig {
                db_path: PathBuf::from("./data/db"),
                cache_size: 512 * 1024 * 1024, // 512 MB
                max_open_files: 1000,
                enable_compression: true,
            },
            sharding: ShardingConfig {
                enable_sharding: true,
                shard_count: 4,
                resharding_threshold: 0.8,
                allocation_strategy: "hash".to_string(),
            },
            wasm: WasmConfig {
                runtime_type: "wasmer".to_string(),
                max_memory_pages: 100,
                enable_simd: false,
                max_execution_time_ms: 1000,
            },
            node: NodeConfig {
                name: "optimachain-node".to_string(),
                role: "full".to_string(),
                data_dir: PathBuf::from("./data"),
                log_level: "info".to_string(),
                log_file: None,
                enable_metrics: false,
                metrics_address: None,
                enable_api: true,
                api_address: Some("127.0.0.1:9944".to_string()),
            },
        }
    }
}

/// Builder for configuration
#[derive(Debug, Default)]
pub struct ConfigBuilder {
    /// Configuration being built
    config: Config,
}

impl ConfigBuilder {
    /// Create a new config builder
    pub fn new() -> Self {
        ConfigBuilder {
            config: Config::default(),
        }
    }
    
    /// Set the network configuration
    pub fn with_network(mut self, network: NetworkConfig) -> Self {
        self.config.network = network;
        self
    }
    
    /// Set the consensus configuration
    pub fn with_consensus(mut self, consensus: ConsensusConfig) -> Self {
        self.config.consensus = consensus;
        self
    }
    
    /// Set the storage configuration
    pub fn with_storage(mut self, storage: StorageConfig) -> Self {
        self.config.storage = storage;
        self
    }
    
    /// Set the sharding configuration
    pub fn with_sharding(mut self, sharding: ShardingConfig) -> Self {
        self.config.sharding = sharding;
        self
    }
    
    /// Set the WASM configuration
    pub fn with_wasm(mut self, wasm: WasmConfig) -> Self {
        self.config.wasm = wasm;
        self
    }
    
    /// Set the node configuration
    pub fn with_node(mut self, node: NodeConfig) -> Self {
        self.config.node = node;
        self
    }
    
    /// Build the configuration
    pub fn build(self) -> Config {
        self.config
    }
}

/// Load configuration from a file
pub fn load_config<P: AsRef<Path>>(path: P) -> Result<Config> {
    let mut file = File::open(path)
        .map_err(|e| Error::config(format!("Failed to open config file: {}", e)))?;
    
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|e| Error::config(format!("Failed to read config file: {}", e)))?;
    
    let config = serde_json::from_str(&contents)
        .map_err(|e| Error::config(format!("Failed to parse config file: {}", e)))?;
    
    Ok(config)
}

/// Save configuration to a file
pub fn save_config<P: AsRef<Path>>(config: &Config, path: P) -> Result<()> {
    let contents = serde_json::to_string_pretty(config)
        .map_err(|e| Error::config(format!("Failed to serialize config: {}", e)))?;
    
    let mut file = File::create(path)
        .map_err(|e| Error::config(format!("Failed to create config file: {}", e)))?;
    
    file.write_all(contents.as_bytes())
        .map_err(|e| Error::config(format!("Failed to write config file: {}", e)))?;
    
    Ok(())
}
