//! Network module for OptimaChain
//! 
//! This module implements the P2P networking functionality using libp2p.

mod discovery;
mod transport;
mod protocol;
mod message;

pub use discovery::{Discovery, DiscoveryConfig, PeerInfo};
pub use transport::{Transport, TransportConfig};
pub use protocol::{Protocol, ProtocolConfig, ProtocolEvent};
pub use message::{Message, MessageType, MessageId};
