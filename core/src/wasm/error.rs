use thiserror::Error;

/// Errors that can occur during WebAssembly execution
#[derive(Error, Debug)]
pub enum WasmError {
    /// Error compiling WASM module
    #[error("WASM compilation error: {0}")]
    CompilationError(String),
    
    /// Error instantiating WASM module
    #[error("WASM instantiation error: {0}")]
    InstantiationError(String),
    
    /// Error during WASM execution
    #[error("WASM execution error: {0}")]
    ExecutionError(String),
    
    /// Error in host function
    #[error("Host function error: {0}")]
    HostError(String),
    
    /// Out of gas error
    #[error("Out of gas: used {used}, limit {limit}")]
    OutOfGas {
        /// Gas used
        used: u64,
        /// Gas limit
        limit: u64,
    },
    
    /// Memory access error
    #[error("Memory access error: {0}")]
    MemoryAccessError(String),
    
    /// Function not found
    #[error("Function not found: {0}")]
    FunctionNotFound(String),
    
    /// Invalid arguments
    #[error("Invalid arguments: {0}")]
    InvalidArguments(String),
    
    /// Runtime error
    #[error("Runtime error: {0}")]
    RuntimeError(String),
    
    /// I/O error
    #[error("I/O error: {0}")]
    IoError(String),
    
    /// Serialization error
    #[error("Serialization error: {0}")]
    SerializationError(String),
    
    /// Deserialization error
    #[error("Deserialization error: {0}")]
    DeserializationError(String),
    
    /// Trap error
    #[error("Trap: {0}")]
    Trap(String),
    
    /// Other error
    #[error("WASM error: {0}")]
    Other(String),
}

/// Errors that can occur during contract execution
#[derive(Error, Debug)]
pub enum ExecutionError {
    /// WASM error
    #[error("WASM error: {0}")]
    WasmError(#[from] WasmError),
    
    /// Contract error
    #[error("Contract error: {0}")]
    ContractError(String),
    
    /// Storage error
    #[error("Storage error: {0}")]
    StorageError(String),
    
    /// Account error
    #[error("Account error: {0}")]
    AccountError(String),
    
    /// Permission error
    #[error("Permission error: {0}")]
    PermissionError(String),
    
    /// Validation error
    #[error("Validation error: {0}")]
    ValidationError(String),
    
    /// Timeout error
    #[error("Execution timeout after {0} ms")]
    TimeoutError(u64),
    
    /// Other error
    #[error("Execution error: {0}")]
    Other(String),
}
