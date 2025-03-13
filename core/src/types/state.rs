use crate::types::Account;
use serde::{Serialize, Deserialize};
use sha3::Digest;

/// Root hash of the state
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct StateRoot(pub [u8; 32]);

/// Update to the state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StateUpdate {
    /// Create a new account
    CreateAccount(Account),
    /// Update an existing account
    UpdateAccount {
        id: [u8; 32],
        balance_delta: i64,
        nonce_delta: u64,
        storage_updates: Vec<(Vec<u8>, Option<Vec<u8>>)>,
    },
    /// Delete an account
    DeleteAccount {
        id: [u8; 32],
    },
}

/// The state of the blockchain
#[derive(Debug, Clone)]
pub struct State {
    /// Accounts in the state
    pub accounts: Vec<Account>,
    /// Root hash of the state
    pub root: StateRoot,
}

impl State {
    /// Create a new empty state
    pub fn new() -> Self {
        State {
            accounts: Vec::new(),
            root: StateRoot([0; 32]),
        }
    }
    
    /// Apply a state update
    pub fn apply_update(&mut self, update: StateUpdate) {
        match update {
            StateUpdate::CreateAccount(account) => {
                self.accounts.push(account);
            }
            StateUpdate::UpdateAccount { id, balance_delta, nonce_delta, storage_updates } => {
                if let Some(account) = self.accounts.iter_mut().find(|a| a.id.0 == id) {
                    if balance_delta >= 0 {
                        account.balance.native += balance_delta as u64;
                    } else {
                        account.balance.native -= (-balance_delta) as u64;
                    }
                    account.nonce += nonce_delta;
                    
                    for (key, value_opt) in storage_updates {
                        if let Some(value) = value_opt {
                            // Update or insert
                            if let Some(entry) = account.storage.iter_mut().find(|(k, _)| k == &key) {
                                entry.1 = value;
                            } else {
                                account.storage.push((key, value));
                            }
                        } else {
                            // Remove
                            account.storage.retain(|(k, _)| k != &key);
                        }
                    }
                }
            }
            StateUpdate::DeleteAccount { id } => {
                self.accounts.retain(|a| a.id.0 != id);
            }
        }
        
        // Recalculate state root
        self.recalculate_root();
    }
    
    /// Recalculate the state root
    fn recalculate_root(&mut self) {
        // Simple implementation for now
        // In a real implementation, this would use a Merkle Patricia Trie
        let serialized = bincode::serialize(&self.accounts).unwrap();
        let mut hasher = sha3::Sha3_256::new();
        hasher.update(&serialized);
        let result = hasher.finalize();
        
        let mut root = [0u8; 32];
        root.copy_from_slice(&result);
        self.root = StateRoot(root);
    }
}
