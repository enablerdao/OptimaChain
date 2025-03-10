use crate::sharding::{Shard, ShardId, ShardConfig, ShardState};
use crate::types::{Block, BlockId, Account, AccountId};
use serde::{Serialize, Deserialize};
use std::collections::{HashMap, HashSet};
use std::time::{Duration, Instant};

/// Strategy for resharding
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ReshardingStrategy {
    /// Split a shard into two
    Split,
    /// Merge two shards into one
    Merge,
    /// Rebalance accounts across shards
    Rebalance,
    /// Adaptive resharding based on load
    Adaptive,
}

/// Event emitted during resharding
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReshardingEvent {
    /// Resharding started
    Started {
        /// Strategy being used
        strategy: ReshardingStrategy,
        /// Shards involved
        shards: Vec<ShardId>,
        /// Timestamp when resharding started
        timestamp: u64,
    },
    /// Resharding completed
    Completed {
        /// Strategy that was used
        strategy: ReshardingStrategy,
        /// Original shards
        original_shards: Vec<ShardId>,
        /// Resulting shards
        resulting_shards: Vec<ShardId>,
        /// Timestamp when resharding completed
        timestamp: u64,
        /// Duration of the resharding process in seconds
        duration_seconds: u64,
    },
    /// Resharding failed
    Failed {
        /// Strategy that was being used
        strategy: ReshardingStrategy,
        /// Shards involved
        shards: Vec<ShardId>,
        /// Timestamp when resharding failed
        timestamp: u64,
        /// Reason for failure
        reason: String,
    },
    /// Account moved between shards
    AccountMoved {
        /// Account ID
        account_id: AccountId,
        /// Source shard
        source_shard: ShardId,
        /// Destination shard
        destination_shard: ShardId,
    },
}

/// Manager for resharding operations
pub struct ReshardingManager {
    /// Active resharding operations
    active_operations: HashMap<String, ReshardingOperation>,
    /// Completed resharding operations
    completed_operations: Vec<ReshardingOperation>,
    /// Shard configurations
    shard_configs: HashMap<ShardId, ShardConfig>,
    /// Callback for resharding events
    event_callback: Option<Box<dyn Fn(ReshardingEvent) + Send + Sync>>,
}

/// A resharding operation
#[derive(Debug, Clone)]
struct ReshardingOperation {
    /// Unique ID for the operation
    id: String,
    /// Strategy being used
    strategy: ReshardingStrategy,
    /// Shards involved
    shards: Vec<ShardId>,
    /// Start time
    start_time: Instant,
    /// Status of the operation
    status: ReshardingStatus,
    /// Events emitted during the operation
    events: Vec<ReshardingEvent>,
}

/// Status of a resharding operation
#[derive(Debug, Clone, PartialEq, Eq)]
enum ReshardingStatus {
    /// Operation is in progress
    InProgress,
    /// Operation has completed successfully
    Completed,
    /// Operation has failed
    Failed(String),
}

impl ReshardingManager {
    /// Create a new resharding manager
    pub fn new() -> Self {
        ReshardingManager {
            active_operations: HashMap::new(),
            completed_operations: Vec::new(),
            shard_configs: HashMap::new(),
            event_callback: None,
        }
    }
    
    /// Add a shard configuration
    pub fn add_shard_config(&mut self, shard_id: ShardId, config: ShardConfig) {
        self.shard_configs.insert(shard_id, config);
    }
    
    /// Start a resharding operation
    pub fn start_resharding(
        &mut self,
        strategy: ReshardingStrategy,
        shards: Vec<ShardId>,
    ) -> Result<String, String> {
        // Validate shards
        for shard_id in &shards {
            if !self.shard_configs.contains_key(shard_id) {
                return Err(format!("Shard {:?} does not exist", shard_id));
            }
        }
        
        // Validate strategy
        match strategy {
            ReshardingStrategy::Split => {
                if shards.len() != 1 {
                    return Err("Split strategy requires exactly one shard".to_string());
                }
            }
            ReshardingStrategy::Merge => {
                if shards.len() != 2 {
                    return Err("Merge strategy requires exactly two shards".to_string());
                }
            }
            ReshardingStrategy::Rebalance | ReshardingStrategy::Adaptive => {
                if shards.len() < 2 {
                    return Err("Rebalance and Adaptive strategies require at least two shards".to_string());
                }
            }
        }
        
        // Check if any of the shards are already being resharded
        for shard_id in &shards {
            for operation in self.active_operations.values() {
                if operation.shards.contains(shard_id) {
                    return Err(format!("Shard {:?} is already being resharded", shard_id));
                }
            }
        }
        
        // Create operation ID
        let operation_id = format!("{:x}", rand::random::<u64>());
        
        // Create operation
        let operation = ReshardingOperation {
            id: operation_id.clone(),
            strategy,
            shards: shards.clone(),
            start_time: Instant::now(),
            status: ReshardingStatus::InProgress,
            events: Vec::new(),
        };
        
        // Add to active operations
        self.active_operations.insert(operation_id.clone(), operation);
        
        // Emit started event
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs();
        
        let event = ReshardingEvent::Started {
            strategy,
            shards: shards.clone(),
            timestamp,
        };
        
        self.emit_event(operation_id.clone(), event);
        
        Ok(operation_id)
    }
    
    /// Complete a resharding operation
    pub fn complete_resharding(
        &mut self,
        operation_id: &str,
        resulting_shards: Vec<ShardId>,
    ) -> Result<(), String> {
        if let Some(mut operation) = self.active_operations.remove(operation_id) {
            // Update status
            operation.status = ReshardingStatus::Completed;
            
            // Emit completed event
            let timestamp = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("Time went backwards")
                .as_secs();
            
            let duration_seconds = operation.start_time.elapsed().as_secs();
            
            let event = ReshardingEvent::Completed {
                strategy: operation.strategy,
                original_shards: operation.shards.clone(),
                resulting_shards,
                timestamp,
                duration_seconds,
            };
            
            self.emit_event(operation_id.to_string(), event);
            
            // Add to completed operations
            self.completed_operations.push(operation);
            
            Ok(())
        } else {
            Err(format!("Operation {} not found", operation_id))
        }
    }
    
    /// Fail a resharding operation
    pub fn fail_resharding(
        &mut self,
        operation_id: &str,
        reason: String,
    ) -> Result<(), String> {
        if let Some(mut operation) = self.active_operations.remove(operation_id) {
            // Update status
            operation.status = ReshardingStatus::Failed(reason.clone());
            
            // Emit failed event
            let timestamp = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("Time went backwards")
                .as_secs();
            
            let event = ReshardingEvent::Failed {
                strategy: operation.strategy,
                shards: operation.shards.clone(),
                timestamp,
                reason,
            };
            
            self.emit_event(operation_id.to_string(), event);
            
            // Add to completed operations
            self.completed_operations.push(operation);
            
            Ok(())
        } else {
            Err(format!("Operation {} not found", operation_id))
        }
    }
    
    /// Record an account move
    pub fn record_account_move(
        &mut self,
        operation_id: &str,
        account_id: AccountId,
        source_shard: ShardId,
        destination_shard: ShardId,
    ) -> Result<(), String> {
        if let Some(operation) = self.active_operations.get_mut(operation_id) {
            // Emit account moved event
            let event = ReshardingEvent::AccountMoved {
                account_id,
                source_shard,
                destination_shard,
            };
            
            self.emit_event(operation_id.to_string(), event);
            
            Ok(())
        } else {
            Err(format!("Operation {} not found", operation_id))
        }
    }
    
    /// Get an active resharding operation
    pub fn get_active_operation(&self, operation_id: &str) -> Option<&ReshardingOperation> {
        self.active_operations.get(operation_id)
    }
    
    /// Get all active resharding operations
    pub fn get_active_operations(&self) -> &HashMap<String, ReshardingOperation> {
        &self.active_operations
    }
    
    /// Get all completed resharding operations
    pub fn get_completed_operations(&self) -> &[ReshardingOperation] {
        &self.completed_operations
    }
    
    /// Set the event callback
    pub fn set_event_callback<F>(&mut self, callback: F)
    where
        F: Fn(ReshardingEvent) + Send + Sync + 'static,
    {
        self.event_callback = Some(Box::new(callback));
    }
    
    /// Emit a resharding event
    fn emit_event(&mut self, operation_id: String, event: ReshardingEvent) {
        // Add event to operation
        if let Some(operation) = self.active_operations.get_mut(&operation_id) {
            operation.events.push(event.clone());
        } else if let Some(operation) = self.completed_operations.iter_mut().find(|op| op.id == operation_id) {
            operation.events.push(event.clone());
        }
        
        // Call the callback if set
        if let Some(callback) = &self.event_callback {
            callback(event);
        }
    }
    
    /// Recommend a resharding strategy for a shard
    pub fn recommend_strategy(&self, shard_id: &ShardId) -> Option<ReshardingStrategy> {
        // Get shard config
        let config = self.shard_configs.get(shard_id)?;
        
        // In a real implementation, we would analyze the shard's load metrics
        // and recommend a strategy based on that
        
        // For now, just return a simple recommendation
        Some(ReshardingStrategy::Split)
    }
}
