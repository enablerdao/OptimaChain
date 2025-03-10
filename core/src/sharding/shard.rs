use crate::types::{Block, BlockId, Transaction, TransactionId, State, StateRoot};
use serde::{Serialize, Deserialize};
use std::collections::{HashMap, HashSet};

/// Unique identifier for a shard
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ShardId(pub u32);

/// Configuration for a shard
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShardConfig {
    /// Maximum number of transactions per block
    pub max_transactions_per_block: usize,
    /// Maximum block size in bytes
    pub max_block_size: usize,
    /// Target block time in milliseconds
    pub target_block_time_ms: u64,
    /// Maximum number of accounts in the shard
    pub max_accounts: usize,
    /// Threshold for resharding (load percentage)
    pub resharding_threshold: f64,
}

impl Default for ShardConfig {
    fn default() -> Self {
        ShardConfig {
            max_transactions_per_block: 10000,
            max_block_size: 5 * 1024 * 1024, // 5 MB
            target_block_time_ms: 1000, // 1 second
            max_accounts: 1000000, // 1 million accounts
            resharding_threshold: 0.8, // 80% load
        }
    }
}

/// State of a shard
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ShardState {
    /// Shard is active and processing transactions
    Active,
    /// Shard is being created
    Creating,
    /// Shard is being split
    Splitting,
    /// Shard is being merged
    Merging,
    /// Shard is being deactivated
    Deactivating,
    /// Shard is inactive
    Inactive,
}

/// A shard in the blockchain
pub struct Shard {
    /// Shard ID
    id: ShardId,
    /// Shard configuration
    config: ShardConfig,
    /// Shard state
    state: ShardState,
    /// Accounts in this shard
    accounts: HashSet<[u8; 32]>,
    /// Blocks in this shard
    blocks: HashMap<BlockId, Block>,
    /// Latest block ID
    latest_block_id: Option<BlockId>,
    /// Latest block height
    latest_block_height: u64,
    /// State of the shard
    shard_state: State,
    /// Load metrics
    load_metrics: ShardLoadMetrics,
}

/// Metrics for shard load
#[derive(Debug, Clone, Default)]
pub struct ShardLoadMetrics {
    /// Number of transactions processed per second
    pub tps: f64,
    /// Average block time in milliseconds
    pub avg_block_time_ms: f64,
    /// Number of accounts in the shard
    pub account_count: usize,
    /// Storage usage in bytes
    pub storage_usage: u64,
    /// CPU usage percentage
    pub cpu_usage: f64,
    /// Memory usage in bytes
    pub memory_usage: u64,
}

impl Shard {
    /// Create a new shard
    pub fn new(id: ShardId, config: ShardConfig) -> Self {
        Shard {
            id,
            config,
            state: ShardState::Creating,
            accounts: HashSet::new(),
            blocks: HashMap::new(),
            latest_block_id: None,
            latest_block_height: 0,
            shard_state: State::new(),
            load_metrics: ShardLoadMetrics::default(),
        }
    }
    
    /// Get the shard ID
    pub fn id(&self) -> ShardId {
        self.id
    }
    
    /// Get the shard configuration
    pub fn config(&self) -> &ShardConfig {
        &self.config
    }
    
    /// Get the shard state
    pub fn state(&self) -> &ShardState {
        &self.state
    }
    
    /// Set the shard state
    pub fn set_state(&mut self, state: ShardState) {
        self.state = state;
    }
    
    /// Check if the shard is active
    pub fn is_active(&self) -> bool {
        self.state == ShardState::Active
    }
    
    /// Add an account to the shard
    pub fn add_account(&mut self, account_id: [u8; 32]) -> Result<(), String> {
        if self.accounts.len() >= self.config.max_accounts {
            return Err("Shard is full".to_string());
        }
        
        self.accounts.insert(account_id);
        self.load_metrics.account_count = self.accounts.len();
        
        Ok(())
    }
    
    /// Remove an account from the shard
    pub fn remove_account(&mut self, account_id: &[u8; 32]) -> bool {
        let removed = self.accounts.remove(account_id);
        if removed {
            self.load_metrics.account_count = self.accounts.len();
        }
        removed
    }
    
    /// Check if an account is in the shard
    pub fn has_account(&self, account_id: &[u8; 32]) -> bool {
        self.accounts.contains(account_id)
    }
    
    /// Get the number of accounts in the shard
    pub fn account_count(&self) -> usize {
        self.accounts.len()
    }
    
    /// Add a block to the shard
    pub fn add_block(&mut self, block: Block) -> Result<(), String> {
        let block_id = block.id();
        
        // Check if block already exists
        if self.blocks.contains_key(&block_id) {
            return Err("Block already exists".to_string());
        }
        
        // Update latest block if this is a new highest block
        if block.header.height > self.latest_block_height {
            self.latest_block_id = Some(block_id.clone());
            self.latest_block_height = block.header.height;
        }
        
        // Add block to the shard
        self.blocks.insert(block_id, block);
        
        // Update load metrics
        self.update_load_metrics();
        
        Ok(())
    }
    
    /// Get a block by ID
    pub fn get_block(&self, block_id: &BlockId) -> Option<&Block> {
        self.blocks.get(block_id)
    }
    
    /// Get the latest block
    pub fn latest_block(&self) -> Option<&Block> {
        self.latest_block_id.as_ref().and_then(|id| self.blocks.get(id))
    }
    
    /// Get the latest block ID
    pub fn latest_block_id(&self) -> Option<&BlockId> {
        self.latest_block_id.as_ref()
    }
    
    /// Get the latest block height
    pub fn latest_block_height(&self) -> u64 {
        self.latest_block_height
    }
    
    /// Get the state root
    pub fn state_root(&self) -> &StateRoot {
        &self.shard_state.root
    }
    
    /// Get the load metrics
    pub fn load_metrics(&self) -> &ShardLoadMetrics {
        &self.load_metrics
    }
    
    /// Check if the shard needs resharding
    pub fn needs_resharding(&self) -> bool {
        // Check if account count is above threshold
        let account_ratio = self.accounts.len() as f64 / self.config.max_accounts as f64;
        if account_ratio >= self.config.resharding_threshold {
            return true;
        }
        
        // Check if TPS is above threshold
        let tps_capacity = 1000.0 / self.config.target_block_time_ms as f64 * self.config.max_transactions_per_block as f64;
        let tps_ratio = self.load_metrics.tps / tps_capacity;
        if tps_ratio >= self.config.resharding_threshold {
            return true;
        }
        
        // Check if CPU usage is above threshold
        if self.load_metrics.cpu_usage >= self.config.resharding_threshold * 100.0 {
            return true;
        }
        
        false
    }
    
    /// Update the load metrics
    fn update_load_metrics(&mut self) {
        // In a real implementation, we would calculate these metrics based on actual performance
        // For now, just use simple calculations based on the number of accounts and blocks
        
        // Calculate TPS based on recent blocks
        if let Some(latest_block) = self.latest_block() {
            // Assume 1 block per second for simplicity
            self.load_metrics.tps = latest_block.transactions.len() as f64;
        }
        
        // Update account count
        self.load_metrics.account_count = self.accounts.len();
        
        // Estimate storage usage (1 KB per account, 10 KB per block)
        self.load_metrics.storage_usage = (self.accounts.len() * 1024 + self.blocks.len() * 10 * 1024) as u64;
        
        // Estimate CPU usage based on account count and TPS
        let max_accounts = self.config.max_accounts;
        let max_tps = 1000.0 / self.config.target_block_time_ms as f64 * self.config.max_transactions_per_block as f64;
        
        let account_ratio = self.accounts.len() as f64 / max_accounts as f64;
        let tps_ratio = self.load_metrics.tps / max_tps;
        
        // CPU usage is a combination of account ratio and TPS ratio
        self.load_metrics.cpu_usage = (account_ratio * 0.3 + tps_ratio * 0.7) * 100.0;
        
        // Estimate memory usage (10 KB per account, 1 KB per block)
        self.load_metrics.memory_usage = (self.accounts.len() * 10 * 1024 + self.blocks.len() * 1024) as u64;
    }
}
