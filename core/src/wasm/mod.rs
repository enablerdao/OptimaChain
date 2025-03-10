//! WebAssembly module for OptimaChain
//! 
//! This module implements WebAssembly smart contract execution environment.

mod runtime;
mod contract;
mod host;
mod error;
mod gas;

pub use runtime::{WasmRuntime, RuntimeConfig, RuntimeType};
pub use contract::{Contract, ContractInstance, ContractMetadata};
pub use host::{HostFunctions, HostContext, HostImports};
pub use error::{WasmError, ExecutionError};
pub use gas::{GasMeter, GasConfig, GasCounter};
