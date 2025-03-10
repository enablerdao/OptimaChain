use std::sync::{Arc, Mutex};

/// Configuration for gas metering
#[derive(Debug, Clone)]
pub struct GasConfig {
    /// Base cost for a WASM operation
    pub base_cost: u64,
    /// Cost per byte of memory allocation
    pub memory_byte_cost: u64,
    /// Cost per byte of storage read
    pub storage_read_byte_cost: u64,
    /// Cost per byte of storage write
    pub storage_write_byte_cost: u64,
    /// Cost per byte of storage remove
    pub storage_remove_byte_cost: u64,
    /// Cost per byte of contract code
    pub code_byte_cost: u64,
    /// Cost per byte of contract execution
    pub execution_byte_cost: u64,
    /// Cost per byte of host function call
    pub host_function_call_cost: u64,
}

impl Default for GasConfig {
    fn default() -> Self {
        GasConfig {
            base_cost: 1,
            memory_byte_cost: 1,
            storage_read_byte_cost: 10,
            storage_write_byte_cost: 20,
            storage_remove_byte_cost: 15,
            code_byte_cost: 2,
            execution_byte_cost: 1,
            host_function_call_cost: 100,
        }
    }
}

/// Counter for gas usage
#[derive(Debug, Clone)]
pub struct GasCounter {
    /// Gas used
    pub used: u64,
    /// Gas limit
    pub limit: u64,
}

impl GasCounter {
    /// Create a new gas counter
    pub fn new(limit: u64) -> Self {
        GasCounter {
            used: 0,
            limit,
        }
    }
    
    /// Use gas
    pub fn use_gas(&mut self, amount: u64) -> Result<(), String> {
        let new_used = self.used.checked_add(amount)
            .ok_or_else(|| "Gas overflow".to_string())?;
        
        if new_used > self.limit {
            return Err(format!("Out of gas: used {}, limit {}", new_used, self.limit));
        }
        
        self.used = new_used;
        Ok(())
    }
    
    /// Check if there is enough gas
    pub fn has_gas(&self, amount: u64) -> bool {
        match self.used.checked_add(amount) {
            Some(new_used) => new_used <= self.limit,
            None => false,
        }
    }
    
    /// Get the remaining gas
    pub fn remaining_gas(&self) -> u64 {
        self.limit.saturating_sub(self.used)
    }
    
    /// Get the gas usage percentage
    pub fn usage_percentage(&self) -> f64 {
        if self.limit == 0 {
            return 100.0;
        }
        
        (self.used as f64 / self.limit as f64) * 100.0
    }
}

/// Meter for gas usage
pub struct GasMeter {
    /// Gas counter
    counter: GasCounter,
    /// Gas configuration
    config: GasConfig,
}

impl GasMeter {
    /// Create a new gas meter
    pub fn new(limit: u64, config: GasConfig) -> Self {
        GasMeter {
            counter: GasCounter::new(limit),
            config,
        }
    }
    
    /// Use gas for a base operation
    pub fn use_base(&mut self) -> Result<(), String> {
        self.counter.use_gas(self.config.base_cost)
    }
    
    /// Use gas for memory allocation
    pub fn use_memory(&mut self, bytes: usize) -> Result<(), String> {
        let cost = (bytes as u64).saturating_mul(self.config.memory_byte_cost);
        self.counter.use_gas(cost)
    }
    
    /// Use gas for storage read
    pub fn use_storage_read(&mut self, bytes: usize) -> Result<(), String> {
        let cost = (bytes as u64).saturating_mul(self.config.storage_read_byte_cost);
        self.counter.use_gas(cost)
    }
    
    /// Use gas for storage write
    pub fn use_storage_write(&mut self, bytes: usize) -> Result<(), String> {
        let cost = (bytes as u64).saturating_mul(self.config.storage_write_byte_cost);
        self.counter.use_gas(cost)
    }
    
    /// Use gas for storage remove
    pub fn use_storage_remove(&mut self, bytes: usize) -> Result<(), String> {
        let cost = (bytes as u64).saturating_mul(self.config.storage_remove_byte_cost);
        self.counter.use_gas(cost)
    }
    
    /// Use gas for code execution
    pub fn use_code(&mut self, bytes: usize) -> Result<(), String> {
        let cost = (bytes as u64).saturating_mul(self.config.code_byte_cost);
        self.counter.use_gas(cost)
    }
    
    /// Use gas for execution
    pub fn use_execution(&mut self, bytes: usize) -> Result<(), String> {
        let cost = (bytes as u64).saturating_mul(self.config.execution_byte_cost);
        self.counter.use_gas(cost)
    }
    
    /// Use gas for host function call
    pub fn use_host_function(&mut self) -> Result<(), String> {
        self.counter.use_gas(self.config.host_function_call_cost)
    }
    
    /// Get the gas counter
    pub fn counter(&self) -> &GasCounter {
        &self.counter
    }
    
    /// Get the gas configuration
    pub fn config(&self) -> &GasConfig {
        &self.config
    }
    
    /// Get the gas used
    pub fn gas_used(&self) -> u64 {
        self.counter.used
    }
    
    /// Get the gas limit
    pub fn gas_limit(&self) -> u64 {
        self.counter.limit
    }
    
    /// Get the remaining gas
    pub fn remaining_gas(&self) -> u64 {
        self.counter.remaining_gas()
    }
}
