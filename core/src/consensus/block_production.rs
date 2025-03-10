use crate::types::{Block, BlockId};
use crate::consensus::{Validator, ValidatorSet};
use ed25519_dalek::VerifyingKey;
use rand::{Rng, SeedableRng};
use rand::rngs::StdRng;
use std::collections::HashMap;

/// Schedule for block production
#[derive(Debug, Clone)]
pub struct BlockProductionSchedule {
    /// Mapping of time slots to validators
    slots: HashMap<u64, VerifyingKey>,
    /// Duration of each slot in milliseconds
    slot_duration_ms: u64,
    /// Start time of the schedule
    start_time: u64,
    /// End time of the schedule
    end_time: u64,
}

impl BlockProductionSchedule {
    /// Create a new block production schedule
    pub fn new(
        validators: &ValidatorSet,
        start_time: u64,
        end_time: u64,
        slot_duration_ms: u64,
    ) -> Self {
        let mut schedule = BlockProductionSchedule {
            slots: HashMap::new(),
            slot_duration_ms,
            start_time,
            end_time,
        };
        
        schedule.generate_schedule(validators);
        schedule
    }
    
    /// Generate the block production schedule
    fn generate_schedule(&mut self, validators: &ValidatorSet) {
        if validators.is_empty() {
            return;
        }
        
        // Calculate the number of slots
        let num_slots = (self.end_time - self.start_time) / self.slot_duration_ms;
        
        // Get all validators with their weights
        let validators_vec: Vec<_> = validators.validators().iter().collect();
        let total_weight: u32 = validators_vec.iter().map(|v| v.weight()).sum();
        
        if total_weight == 0 {
            return;
        }
        
        // Create a deterministic random number generator
        // In a real implementation, this would use a seed derived from the previous block
        let seed = self.start_time as u64;
        let mut rng = StdRng::seed_from_u64(seed);
        
        // Assign slots to validators based on their weight
        for i in 0..num_slots {
            let slot_time = self.start_time + i * self.slot_duration_ms;
            
            // Select a validator based on weight
            let mut cumulative_weight = 0;
            let target_weight = rng.gen_range(0..total_weight);
            
            for validator in &validators_vec {
                cumulative_weight += validator.weight();
                if cumulative_weight > target_weight {
                    self.slots.insert(slot_time, validator.public_key());
                    break;
                }
            }
        }
    }
    
    /// Get the validator for a specific time
    pub fn get_validator_for_time(&self, time: u64) -> Option<VerifyingKey> {
        // Find the slot for the given time
        let slot_time = time - (time % self.slot_duration_ms);
        self.slots.get(&slot_time).copied()
    }
    
    /// Check if a validator is scheduled to produce a block at a specific time
    pub fn is_validator_scheduled(&self, validator: &VerifyingKey, time: u64) -> bool {
        if let Some(scheduled_validator) = self.get_validator_for_time(time) {
            scheduled_validator == *validator
        } else {
            false
        }
    }
    
    /// Get the next scheduled validator after a specific time
    pub fn next_scheduled_validator(&self, time: u64) -> Option<(u64, VerifyingKey)> {
        let mut next_time = time - (time % self.slot_duration_ms) + self.slot_duration_ms;
        
        while next_time <= self.end_time {
            if let Some(validator) = self.slots.get(&next_time) {
                return Some((next_time, *validator));
            }
            next_time += self.slot_duration_ms;
        }
        
        None
    }
}

/// Block producer for the blockchain
pub struct BlockProducer {
    /// Current block production schedule
    current_schedule: Option<BlockProductionSchedule>,
    /// Missed blocks by validator
    missed_blocks: HashMap<VerifyingKey, u64>,
}

impl BlockProducer {
    /// Create a new block producer
    pub fn new() -> Self {
        BlockProducer {
            current_schedule: None,
            missed_blocks: HashMap::new(),
        }
    }
    
    /// Generate a new block production schedule
    pub fn generate_schedule(
        &mut self,
        validators: &ValidatorSet,
        start_time: u64,
        duration_ms: u64,
        slot_duration_ms: u64,
    ) {
        let end_time = start_time + duration_ms;
        let schedule = BlockProductionSchedule::new(validators, start_time, end_time, slot_duration_ms);
        self.current_schedule = Some(schedule);
    }
    
    /// Get the producer for the current time
    pub fn get_producer(
        &self,
        validators: &ValidatorSet,
        parent_block: &Block,
        timestamp: u64,
    ) -> Option<&Validator> {
        if let Some(schedule) = &self.current_schedule {
            if let Some(validator_key) = schedule.get_validator_for_time(timestamp) {
                return validators.get(&validator_key);
            }
        }
        
        // If no schedule or no validator found, use a simple round-robin approach
        // based on the parent block's validator
        let validators_vec = validators.validators();
        if validators_vec.is_empty() {
            return None;
        }
        
        // Find the index of the parent block's validator
        let parent_validator_idx = validators_vec
            .iter()
            .position(|v| v.public_key() == parent_block.header.validator);
        
        // Get the next validator in the list
        if let Some(idx) = parent_validator_idx {
            let next_idx = (idx + 1) % validators_vec.len();
            return Some(&validators_vec[next_idx]);
        }
        
        // If parent validator not found, use the first validator
        Some(&validators_vec[0])
    }
    
    /// Record a missed block
    pub fn record_missed_block(&mut self, validator: &VerifyingKey) {
        let count = self.missed_blocks.entry(*validator).or_insert(0);
        *count += 1;
    }
    
    /// Get the number of missed blocks for a validator
    pub fn missed_blocks(&self, validator: &VerifyingKey) -> u64 {
        *self.missed_blocks.get(validator).unwrap_or(&0)
    }
    
    /// Reset missed blocks for all validators
    pub fn reset_missed_blocks(&mut self) {
        self.missed_blocks.clear();
    }
}
