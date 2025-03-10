use crate::types::{Block, BlockId};
use crate::consensus::{Validator, ValidatorSet, BlockProducer, FinalityProvider};
use ed25519_dalek::VerifyingKey;
use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

/// Configuration for the Adaptive Proof-of-Stake consensus
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct APoSConfig {
    /// Minimum stake required to become a validator
    pub min_stake: u64,
    /// Maximum number of validators
    pub max_validators: usize,
    /// Block time target in milliseconds
    pub block_time_target_ms: u64,
    /// Epoch length in blocks
    pub epoch_length: u64,
    /// Reward per block in smallest token unit
    pub block_reward: u64,
    /// Percentage of transaction fees that go to the validator
    pub validator_fee_percentage: u8,
}

impl Default for APoSConfig {
    fn default() -> Self {
        APoSConfig {
            min_stake: 1_000_000, // 1M tokens
            max_validators: 100,
            block_time_target_ms: 1000, // 1 second
            epoch_length: 10_000, // ~3 hours with 1s blocks
            block_reward: 100_000_000, // 100 tokens
            validator_fee_percentage: 70, // 70%
        }
    }
}

/// Adaptive Proof-of-Stake consensus implementation
pub struct APoS {
    /// Configuration
    config: APoSConfig,
    /// Current validator set
    validators: ValidatorSet,
    /// Current epoch
    current_epoch: u64,
    /// Block producer
    block_producer: BlockProducer,
    /// Finality provider
    finality_provider: FinalityProvider,
    /// Performance metrics for validators
    validator_performance: HashMap<VerifyingKey, ValidatorPerformance>,
}

/// Performance metrics for a validator
#[derive(Debug, Clone, Default)]
struct ValidatorPerformance {
    /// Blocks produced
    blocks_produced: u64,
    /// Blocks missed
    blocks_missed: u64,
    /// Average block time
    avg_block_time_ms: u64,
    /// Uptime percentage
    uptime_percentage: f64,
}

impl APoS {
    /// Create a new APoS instance
    pub fn new(config: APoSConfig) -> Self {
        let validators = ValidatorSet::new();
        let block_producer = BlockProducer::new();
        let finality_provider = FinalityProvider::new();
        
        APoS {
            config,
            validators,
            current_epoch: 0,
            block_producer,
            finality_provider,
            validator_performance: HashMap::new(),
        }
    }
    
    /// Get the current validator set
    pub fn validator_set(&self) -> &ValidatorSet {
        &self.validators
    }
    
    /// Add a validator to the set
    pub fn add_validator(&mut self, validator: Validator) -> Result<(), String> {
        if validator.stake() < self.config.min_stake {
            return Err(format!("Stake too low, minimum is {}", self.config.min_stake));
        }
        
        if self.validators.len() >= self.config.max_validators {
            // Find the validator with the lowest stake
            if let Some(lowest) = self.validators.validators().iter()
                .min_by_key(|v| v.stake()) {
                if lowest.stake() >= validator.stake() {
                    return Err("Validator set is full and new validator has lower stake than existing validators".to_string());
                }
                
                // Remove the lowest stake validator
                self.validators.remove_validator(&lowest.public_key());
            }
        }
        
        // Add the new validator
        self.validators.add_validator(validator);
        self.validator_performance.insert(validator.public_key(), ValidatorPerformance::default());
        
        Ok(())
    }
    
    /// Remove a validator from the set
    pub fn remove_validator(&mut self, public_key: &VerifyingKey) {
        self.validators.remove_validator(public_key);
        self.validator_performance.remove(public_key);
    }
    
    /// Get the next validator to produce a block
    pub fn next_block_producer(&self, parent_block: &Block) -> Option<&Validator> {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_millis() as u64;
        
        self.block_producer.get_producer(&self.validators, parent_block, timestamp)
    }
    
    /// Process a new block
    pub fn process_block(&mut self, block: &Block) -> Result<(), String> {
        // Verify the block
        self.verify_block(block)?;
        
        // Update validator performance
        if let Some(perf) = self.validator_performance.get_mut(&block.header.validator) {
            perf.blocks_produced += 1;
            
            // Calculate block time
            if block.header.height > 0 {
                // In a real implementation, we would look up the previous block
                // For now, just use a simple calculation
                let prev_timestamp = block.header.timestamp - (self.config.block_time_target_ms / 1000);
                let block_time = block.header.timestamp - prev_timestamp;
                perf.avg_block_time_ms = (perf.avg_block_time_ms + (block_time * 1000)) / 2;
            }
        }
        
        // Check if we need to start a new epoch
        if block.header.height % self.config.epoch_length == 0 {
            self.start_new_epoch();
        }
        
        Ok(())
    }
    
    /// Verify a block
    fn verify_block(&self, block: &Block) -> Result<(), String> {
        // Verify the validator is in the set
        if !self.validators.contains(&block.header.validator) {
            return Err("Block producer is not in the validator set".to_string());
        }
        
        // Verify the signature
        // In a real implementation, we would verify the signature here
        
        // Verify the block is produced at the right time
        // In a real implementation, we would check the block production schedule
        
        Ok(())
    }
    
    /// Start a new epoch
    fn start_new_epoch(&mut self) {
        self.current_epoch += 1;
        
        // Recalculate validator weights based on performance
        for (public_key, performance) in &self.validator_performance {
            if let Some(validator) = self.validators.get_mut(public_key) {
                // Calculate performance score (0.0 - 1.0)
                let block_production_score = if performance.blocks_produced + performance.blocks_missed > 0 {
                    performance.blocks_produced as f64 / (performance.blocks_produced + performance.blocks_missed) as f64
                } else {
                    0.0
                };
                
                let block_time_score = if performance.avg_block_time_ms > 0 {
                    (self.config.block_time_target_ms as f64 / performance.avg_block_time_ms as f64).min(1.0)
                } else {
                    0.0
                };
                
                let uptime_score = performance.uptime_percentage / 100.0;
                
                // Combined score with weights
                let score = block_production_score * 0.4 + block_time_score * 0.3 + uptime_score * 0.3;
                
                // Adjust validator weight
                validator.set_weight((score * 100.0) as u32);
            }
        }
        
        // Reset performance metrics
        for performance in self.validator_performance.values_mut() {
            performance.blocks_produced = 0;
            performance.blocks_missed = 0;
            // Keep the average block time and uptime for continuity
        }
    }
}
