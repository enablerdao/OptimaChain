//! Utility module for OptimaChain
//! 
//! This module provides common utility functions used across the blockchain implementation.

mod logging;
mod errors;
pub mod crypto;
mod config;

pub use logging::{init_logger, Logger, LogLevel};
pub use errors::{Result, Error, ErrorKind};
pub use crypto::{KeyPair, Signature, hash, verify_signature, generate_keypair, sign_message};
pub use config::{Config, ConfigBuilder, load_config, save_config};
