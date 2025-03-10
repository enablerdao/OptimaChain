use crate::types::{Account, AccountId, Balance, State, StateUpdate};
use crate::wasm::{WasmError, GasMeter};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

/// Context for host functions
pub struct HostContext {
    /// Current account ID
    pub account_id: AccountId,
    /// Current block height
    pub block_height: u64,
    /// Current block timestamp
    pub block_timestamp: u64,
    /// Current state
    pub state: Arc<Mutex<State>>,
    /// Storage cache
    pub storage_cache: HashMap<Vec<u8>, Vec<u8>>,
    /// Gas meter
    pub gas_meter: Arc<Mutex<GasMeter>>,
}

impl HostContext {
    /// Create a new host context
    pub fn new(
        account_id: AccountId,
        block_height: u64,
        block_timestamp: u64,
        state: Arc<Mutex<State>>,
        gas_meter: Arc<Mutex<GasMeter>>,
    ) -> Self {
        HostContext {
            account_id,
            block_height,
            block_timestamp,
            state,
            storage_cache: HashMap::new(),
            gas_meter,
        }
    }
    
    /// Get the current account
    pub fn get_account(&self) -> Result<Account, WasmError> {
        let state = self.state.lock().unwrap();
        
        state.accounts.iter()
            .find(|a| a.id == self.account_id)
            .cloned()
            .ok_or_else(|| WasmError::HostError(format!("Account not found: {:?}", self.account_id)))
    }
    
    /// Get a storage value
    pub fn storage_get(&mut self, key: &[u8]) -> Result<Option<Vec<u8>>, WasmError> {
        // Check cache first
        if let Some(value) = self.storage_cache.get(key) {
            return Ok(Some(value.clone()));
        }
        
        // Get from account storage
        let account = self.get_account()?;
        
        let value = account.storage.iter()
            .find(|(k, _)| k == key)
            .map(|(_, v)| v.clone());
        
        // Update cache
        if let Some(value) = &value {
            self.storage_cache.insert(key.to_vec(), value.clone());
        }
        
        Ok(value)
    }
    
    /// Set a storage value
    pub fn storage_set(&mut self, key: &[u8], value: &[u8]) -> Result<(), WasmError> {
        // Update cache
        self.storage_cache.insert(key.to_vec(), value.to_vec());
        
        Ok(())
    }
    
    /// Remove a storage value
    pub fn storage_remove(&mut self, key: &[u8]) -> Result<(), WasmError> {
        // Update cache
        self.storage_cache.remove(key);
        
        Ok(())
    }
    
    /// Transfer tokens to another account
    pub fn transfer(&mut self, recipient: &AccountId, amount: u64) -> Result<(), WasmError> {
        let mut state = self.state.lock().unwrap();
        
        // Get sender account
        let sender_idx = state.accounts.iter()
            .position(|a| a.id == self.account_id)
            .ok_or_else(|| WasmError::HostError(format!("Sender account not found: {:?}", self.account_id)))?;
        
        let sender = &mut state.accounts[sender_idx];
        
        // Check balance
        if sender.balance.native < amount {
            return Err(WasmError::HostError(format!("Insufficient balance: {} < {}", sender.balance.native, amount)));
        }
        
        // Get recipient account
        let recipient_idx = state.accounts.iter()
            .position(|a| a.id == *recipient)
            .ok_or_else(|| WasmError::HostError(format!("Recipient account not found: {:?}", recipient)))?;
        
        let recipient = &mut state.accounts[recipient_idx];
        
        // Transfer tokens
        sender.balance.native -= amount;
        recipient.balance.native += amount;
        
        Ok(())
    }
    
    /// Log a message
    pub fn log(&self, message: &str) {
        log::info!("[Contract {}] {}", hex::encode(&self.account_id.0), message);
    }
    
    /// Apply storage changes
    pub fn apply_storage_changes(&mut self) -> Result<(), WasmError> {
        if self.storage_cache.is_empty() {
            return Ok(());
        }
        
        let mut state = self.state.lock().unwrap();
        
        // Get account
        let account_idx = state.accounts.iter()
            .position(|a| a.id == self.account_id)
            .ok_or_else(|| WasmError::HostError(format!("Account not found: {:?}", self.account_id)))?;
        
        let account = &mut state.accounts[account_idx];
        
        // Apply storage changes
        for (key, value) in &self.storage_cache {
            if let Some(entry) = account.storage.iter_mut().find(|(k, _)| k == key) {
                entry.1 = value.clone();
            } else {
                account.storage.push((key.clone(), value.clone()));
            }
        }
        
        // Clear cache
        self.storage_cache.clear();
        
        Ok(())
    }
}

/// Host functions for WASM contracts
pub struct HostFunctions {
    /// Context for host functions
    context: Arc<Mutex<HostContext>>,
}

impl HostFunctions {
    /// Create new host functions
    pub fn new(context: Arc<Mutex<HostContext>>) -> Self {
        HostFunctions {
            context,
        }
    }
    
    /// Get the host context
    pub fn context(&self) -> Arc<Mutex<HostContext>> {
        self.context.clone()
    }
}

/// Host imports for WASM contracts
pub struct HostImports {
    /// Host functions
    host_functions: Arc<HostFunctions>,
}

impl HostImports {
    /// Create new host imports
    pub fn new(host_functions: Arc<HostFunctions>) -> Self {
        HostImports {
            host_functions,
        }
    }
    
    /// Get the host functions
    pub fn host_functions(&self) -> Arc<HostFunctions> {
        self.host_functions.clone()
    }
}
