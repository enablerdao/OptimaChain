use thiserror::Error;
use std::fmt;
use std::result;

/// Result type for the blockchain
pub type Result<T> = result::Result<T, Error>;

/// Error kinds for the blockchain
#[derive(Debug, Error)]
pub enum ErrorKind {
    /// I/O error
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),
    
    /// Serialization error
    #[error("Serialization error: {0}")]
    Serialization(String),
    
    /// Deserialization error
    #[error("Deserialization error: {0}")]
    Deserialization(String),
    
    /// Database error
    #[error("Database error: {0}")]
    Database(String),
    
    /// Network error
    #[error("Network error: {0}")]
    Network(String),
    
    /// Consensus error
    #[error("Consensus error: {0}")]
    Consensus(String),
    
    /// Validation error
    #[error("Validation error: {0}")]
    Validation(String),
    
    /// Cryptographic error
    #[error("Cryptographic error: {0}")]
    Crypto(String),
    
    /// Configuration error
    #[error("Configuration error: {0}")]
    Config(String),
    
    /// Transaction error
    #[error("Transaction error: {0}")]
    Transaction(String),
    
    /// Block error
    #[error("Block error: {0}")]
    Block(String),
    
    /// State error
    #[error("State error: {0}")]
    State(String),
    
    /// Sharding error
    #[error("Sharding error: {0}")]
    Sharding(String),
    
    /// WASM error
    #[error("WASM error: {0}")]
    Wasm(String),
    
    /// Not found error
    #[error("Not found: {0}")]
    NotFound(String),
    
    /// Already exists error
    #[error("Already exists: {0}")]
    AlreadyExists(String),
    
    /// Permission denied error
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
    
    /// Timeout error
    #[error("Timeout: {0}")]
    Timeout(String),
    
    /// Other error
    #[error("Other error: {0}")]
    Other(String),
}

/// Error for the blockchain
#[derive(Debug)]
pub struct Error {
    /// Kind of error
    kind: ErrorKind,
    /// Source of the error
    source: Option<Box<dyn std::error::Error + Send + Sync>>,
}

impl Error {
    /// Create a new error
    pub fn new(kind: ErrorKind) -> Self {
        Error {
            kind,
            source: None,
        }
    }
    
    /// Create a new error with a source
    pub fn with_source<E>(kind: ErrorKind, source: E) -> Self
    where
        E: std::error::Error + Send + Sync + 'static,
    {
        Error {
            kind,
            source: Some(Box::new(source)),
        }
    }
    
    /// Get the kind of error
    pub fn kind(&self) -> &ErrorKind {
        &self.kind
    }
    
    /// Create a new I/O error
    pub fn io(err: std::io::Error) -> Self {
        Error::new(ErrorKind::Io(err))
    }
    
    /// Create a new serialization error
    pub fn serialization<S: Into<String>>(msg: S) -> Self {
        Error::new(ErrorKind::Serialization(msg.into()))
    }
    
    /// Create a new deserialization error
    pub fn deserialization<S: Into<String>>(msg: S) -> Self {
        Error::new(ErrorKind::Deserialization(msg.into()))
    }
    
    /// Create a new database error
    pub fn database<S: Into<String>>(msg: S) -> Self {
        Error::new(ErrorKind::Database(msg.into()))
    }
    
    /// Create a new network error
    pub fn network<S: Into<String>>(msg: S) -> Self {
        Error::new(ErrorKind::Network(msg.into()))
    }
    
    /// Create a new consensus error
    pub fn consensus<S: Into<String>>(msg: S) -> Self {
        Error::new(ErrorKind::Consensus(msg.into()))
    }
    
    /// Create a new validation error
    pub fn validation<S: Into<String>>(msg: S) -> Self {
        Error::new(ErrorKind::Validation(msg.into()))
    }
    
    /// Create a new cryptographic error
    pub fn crypto<S: Into<String>>(msg: S) -> Self {
        Error::new(ErrorKind::Crypto(msg.into()))
    }
    
    /// Create a new configuration error
    pub fn config<S: Into<String>>(msg: S) -> Self {
        Error::new(ErrorKind::Config(msg.into()))
    }
    
    /// Create a new transaction error
    pub fn transaction<S: Into<String>>(msg: S) -> Self {
        Error::new(ErrorKind::Transaction(msg.into()))
    }
    
    /// Create a new block error
    pub fn block<S: Into<String>>(msg: S) -> Self {
        Error::new(ErrorKind::Block(msg.into()))
    }
    
    /// Create a new state error
    pub fn state<S: Into<String>>(msg: S) -> Self {
        Error::new(ErrorKind::State(msg.into()))
    }
    
    /// Create a new sharding error
    pub fn sharding<S: Into<String>>(msg: S) -> Self {
        Error::new(ErrorKind::Sharding(msg.into()))
    }
    
    /// Create a new WASM error
    pub fn wasm<S: Into<String>>(msg: S) -> Self {
        Error::new(ErrorKind::Wasm(msg.into()))
    }
    
    /// Create a new not found error
    pub fn not_found<S: Into<String>>(msg: S) -> Self {
        Error::new(ErrorKind::NotFound(msg.into()))
    }
    
    /// Create a new already exists error
    pub fn already_exists<S: Into<String>>(msg: S) -> Self {
        Error::new(ErrorKind::AlreadyExists(msg.into()))
    }
    
    /// Create a new permission denied error
    pub fn permission_denied<S: Into<String>>(msg: S) -> Self {
        Error::new(ErrorKind::PermissionDenied(msg.into()))
    }
    
    /// Create a new timeout error
    pub fn timeout<S: Into<String>>(msg: S) -> Self {
        Error::new(ErrorKind::Timeout(msg.into()))
    }
    
    /// Create a new other error
    pub fn other<S: Into<String>>(msg: S) -> Self {
        Error::new(ErrorKind::Other(msg.into()))
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.kind)
    }
}

impl std::error::Error for Error {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        self.source.as_ref().map(|s| s.as_ref() as &(dyn std::error::Error + 'static))
    }
}

impl From<std::io::Error> for Error {
    fn from(err: std::io::Error) -> Self {
        Error::io(err)
    }
}

impl From<serde_json::Error> for Error {
    fn from(err: serde_json::Error) -> Self {
        if err.is_data() {
            Error::deserialization(err.to_string())
        } else {
            Error::serialization(err.to_string())
        }
    }
}
