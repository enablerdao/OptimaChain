use ed25519_dalek::{Signature, SigningKey, VerifyingKey};
use serde::{Serialize, Deserialize};
use std::collections::HashMap;

/// Information about a validator
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidatorInfo {
    /// Validator name
    pub name: String,
    /// Validator website
    pub website: Option<String>,
    /// Validator description
    pub description: Option<String>,
    /// Validator icon URL
    pub icon_url: Option<String>,
}

/// Staking information for a validator
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StakeInfo {
    /// Amount staked
    pub amount: u64,
    /// When the stake was made
    pub since: u64,
    /// Whether the stake is locked
    pub locked: bool,
    /// Until when the stake is locked (if locked)
    pub locked_until: Option<u64>,
}

/// A validator in the network
#[derive(Debug, Clone)]
pub struct Validator {
    /// Validator's public key
    public_key: VerifyingKey,
    /// Validator's stake information
    stake_info: StakeInfo,
    /// Validator's information
    info: ValidatorInfo,
    /// Validator's weight for block production (0-100)
    weight: u32,
    /// Validator's delegations from other users
    delegations: HashMap<[u8; 32], u64>,
}

impl Validator {
    /// Create a new validator
    pub fn new(
        public_key: VerifyingKey,
        stake_amount: u64,
        name: String,
        website: Option<String>,
        description: Option<String>,
        icon_url: Option<String>,
    ) -> Self {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs();
        
        Validator {
            public_key,
            stake_info: StakeInfo {
                amount: stake_amount,
                since: now,
                locked: false,
                locked_until: None,
            },
            info: ValidatorInfo {
                name,
                website,
                description,
                icon_url,
            },
            weight: 50, // Default weight
            delegations: HashMap::new(),
        }
    }
    
    /// Get the validator's public key
    pub fn public_key(&self) -> VerifyingKey {
        self.public_key
    }
    
    /// Get the validator's stake amount
    pub fn stake(&self) -> u64 {
        self.stake_info.amount
    }
    
    /// Get the validator's total stake (including delegations)
    pub fn total_stake(&self) -> u64 {
        self.stake_info.amount + self.delegations.values().sum::<u64>()
    }
    
    /// Get the validator's weight
    pub fn weight(&self) -> u32 {
        self.weight
    }
    
    /// Set the validator's weight
    pub fn set_weight(&mut self, weight: u32) {
        self.weight = weight.min(100); // Ensure weight is at most 100
    }
    
    /// Add a delegation to the validator
    pub fn add_delegation(&mut self, delegator: [u8; 32], amount: u64) {
        if let Some(existing) = self.delegations.get_mut(&delegator) {
            *existing += amount;
        } else {
            self.delegations.insert(delegator, amount);
        }
    }
    
    /// Remove a delegation from the validator
    pub fn remove_delegation(&mut self, delegator: &[u8; 32], amount: u64) -> Result<(), String> {
        if let Some(existing) = self.delegations.get_mut(delegator) {
            if *existing < amount {
                return Err("Insufficient delegation amount".to_string());
            }
            
            *existing -= amount;
            
            if *existing == 0 {
                self.delegations.remove(delegator);
            }
            
            Ok(())
        } else {
            Err("No delegation found for this delegator".to_string())
        }
    }
    
    /// Lock the validator's stake
    pub fn lock_stake(&mut self, duration_seconds: u64) {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs();
        
        self.stake_info.locked = true;
        self.stake_info.locked_until = Some(now + duration_seconds);
    }
    
    /// Unlock the validator's stake
    pub fn unlock_stake(&mut self) -> Result<(), String> {
        if !self.stake_info.locked {
            return Err("Stake is not locked".to_string());
        }
        
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs();
        
        if let Some(locked_until) = self.stake_info.locked_until {
            if now < locked_until {
                return Err(format!("Stake is locked until {}", locked_until));
            }
        }
        
        self.stake_info.locked = false;
        self.stake_info.locked_until = None;
        
        Ok(())
    }
}

/// A set of validators
#[derive(Debug, Clone)]
pub struct ValidatorSet {
    /// Validators in the set
    validators: Vec<Validator>,
}

impl ValidatorSet {
    /// Create a new empty validator set
    pub fn new() -> Self {
        ValidatorSet {
            validators: Vec::new(),
        }
    }
    
    /// Add a validator to the set
    pub fn add_validator(&mut self, validator: Validator) {
        // Check if validator already exists
        if self.validators.iter().any(|v| v.public_key() == validator.public_key()) {
            return;
        }
        
        self.validators.push(validator);
    }
    
    /// Remove a validator from the set
    pub fn remove_validator(&mut self, public_key: &VerifyingKey) {
        self.validators.retain(|v| v.public_key() != *public_key);
    }
    
    /// Get a validator by public key
    pub fn get(&self, public_key: &VerifyingKey) -> Option<&Validator> {
        self.validators.iter().find(|v| v.public_key() == *public_key)
    }
    
    /// Get a mutable validator by public key
    pub fn get_mut(&mut self, public_key: &VerifyingKey) -> Option<&mut Validator> {
        self.validators.iter_mut().find(|v| v.public_key() == *public_key)
    }
    
    /// Check if a validator is in the set
    pub fn contains(&self, public_key: &VerifyingKey) -> bool {
        self.validators.iter().any(|v| v.public_key() == *public_key)
    }
    
    /// Get the number of validators in the set
    pub fn len(&self) -> usize {
        self.validators.len()
    }
    
    /// Check if the validator set is empty
    pub fn is_empty(&self) -> bool {
        self.validators.is_empty()
    }
    
    /// Get all validators in the set
    pub fn validators(&self) -> &[Validator] {
        &self.validators
    }
    
    /// Get the total stake of all validators in the set
    pub fn total_stake(&self) -> u64 {
        self.validators.iter().map(|v| v.total_stake()).sum()
    }
}
