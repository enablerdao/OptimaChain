use serde::{Serialize, Deserialize};

/// Unique identifier for an account
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct AccountId(pub [u8; 32]);

/// Balance of an account
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Balance {
    /// Balance of the native token
    pub native: u64,
    /// Balances of other tokens
    pub tokens: Vec<(String, u64)>,
}

/// An account in the blockchain
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Account {
    /// Account ID
    pub id: AccountId,
    /// Account balance
    pub balance: Balance,
    /// Account nonce
    pub nonce: u64,
    /// Smart contract code (if this is a contract account)
    pub code: Option<Vec<u8>>,
    /// Smart contract storage
    pub storage: Vec<(Vec<u8>, Vec<u8>)>,
}

impl Account {
    /// Create a new user account
    pub fn new_user(id: AccountId) -> Self {
        Account {
            id,
            balance: Balance {
                native: 0,
                tokens: Vec::new(),
            },
            nonce: 0,
            code: None,
            storage: Vec::new(),
        }
    }
    
    /// Create a new contract account
    pub fn new_contract(id: AccountId, code: Vec<u8>) -> Self {
        Account {
            id,
            balance: Balance {
                native: 0,
                tokens: Vec::new(),
            },
            nonce: 0,
            code: Some(code),
            storage: Vec::new(),
        }
    }
}
