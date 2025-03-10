use crate::wasm::WasmError;
use serde::{Serialize, Deserialize};
use std::sync::Arc;
use wasmer::Module as WasmerModule;
use wasmtime::Module as WasmtimeModule;

/// Metadata for a smart contract
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContractMetadata {
    /// Name of the contract
    pub name: String,
    /// Version of the contract
    pub version: String,
    /// Author of the contract
    pub author: String,
    /// Description of the contract
    pub description: String,
    /// Interface definition (ABI)
    pub interface: Vec<FunctionDefinition>,
}

/// Definition of a function in a contract
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunctionDefinition {
    /// Name of the function
    pub name: String,
    /// Parameters of the function
    pub parameters: Vec<ParameterDefinition>,
    /// Return type of the function
    pub return_type: Option<String>,
    /// Whether the function is read-only
    pub read_only: bool,
}

/// Definition of a parameter in a function
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParameterDefinition {
    /// Name of the parameter
    pub name: String,
    /// Type of the parameter
    pub parameter_type: String,
}

/// A WebAssembly smart contract
pub struct Contract {
    /// Wasmer module (if using Wasmer)
    wasmer_module: Option<Arc<WasmerModule>>,
    /// Wasmtime module (if using Wasmtime)
    wasmtime_module: Option<Arc<WasmtimeModule>>,
    /// Contract metadata
    metadata: Option<ContractMetadata>,
}

impl Contract {
    /// Create a new contract with a Wasmer module
    pub fn new_wasmer(module: WasmerModule) -> Self {
        Contract {
            wasmer_module: Some(Arc::new(module)),
            wasmtime_module: None,
            metadata: None,
        }
    }
    
    /// Create a new contract with a Wasmtime module
    pub fn new_wasmtime(module: WasmtimeModule) -> Self {
        Contract {
            wasmer_module: None,
            wasmtime_module: Some(Arc::new(module)),
            metadata: None,
        }
    }
    
    /// Get the Wasmer module
    pub fn wasmer_module(&self) -> Option<Arc<WasmerModule>> {
        self.wasmer_module.clone()
    }
    
    /// Get the Wasmtime module
    pub fn wasmtime_module(&self) -> Option<Arc<WasmtimeModule>> {
        self.wasmtime_module.clone()
    }
    
    /// Set the contract metadata
    pub fn set_metadata(&mut self, metadata: ContractMetadata) {
        self.metadata = Some(metadata);
    }
    
    /// Get the contract metadata
    pub fn metadata(&self) -> Option<&ContractMetadata> {
        self.metadata.as_ref()
    }
    
    /// Validate the contract
    pub fn validate(&self) -> Result<(), WasmError> {
        // In a real implementation, we would validate the contract
        // For now, just return Ok
        Ok(())
    }
}

/// An instance of a WebAssembly smart contract
pub struct ContractInstance {
    /// Wasmer instance (if using Wasmer)
    wasmer_instance: Option<wasmer::Instance>,
    /// Wasmtime instance (if using Wasmtime)
    wasmtime_instance: Option<wasmtime::Instance>,
}

impl ContractInstance {
    /// Create a new contract instance with a Wasmer instance
    pub fn new_wasmer(instance: wasmer::Instance) -> Self {
        ContractInstance {
            wasmer_instance: Some(instance),
            wasmtime_instance: None,
        }
    }
    
    /// Create a new contract instance with a Wasmtime instance
    pub fn new_wasmtime(instance: wasmtime::Instance) -> Self {
        ContractInstance {
            wasmer_instance: None,
            wasmtime_instance: Some(instance),
        }
    }
    
    /// Get the Wasmer instance
    pub fn wasmer_instance(&self) -> Option<&wasmer::Instance> {
        self.wasmer_instance.as_ref()
    }
    
    /// Get the Wasmtime instance
    pub fn wasmtime_instance(&self) -> Option<&wasmtime::Instance> {
        self.wasmtime_instance.as_ref()
    }
}
