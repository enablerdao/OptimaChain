use libp2p::{
    core::{muxing::StreamMuxerBox, transport::Boxed, upgrade::Version},
    dns::DnsConfig,
    identity::Keypair,
    mplex::MplexConfig,
    noise::{NoiseConfig, X25519Spec},
    tcp::TcpConfig,
    Transport as LibP2PTransport,
    PeerId,
};
use serde::{Serialize, Deserialize};
use std::time::Duration;

/// Configuration for the network transport
#[derive(Debug, Clone)]
pub struct TransportConfig {
    /// Connection timeout in seconds
    pub connection_timeout: u64,
    /// Keep alive interval in seconds
    pub keep_alive_interval: u64,
    /// Maximum number of concurrent connections
    pub max_connections: usize,
    /// Maximum message size in bytes
    pub max_message_size: usize,
    /// Enable or disable NAT traversal
    pub enable_nat_traversal: bool,
}

impl Default for TransportConfig {
    fn default() -> Self {
        TransportConfig {
            connection_timeout: 30,
            keep_alive_interval: 20,
            max_connections: 100,
            max_message_size: 10 * 1024 * 1024, // 10 MB
            enable_nat_traversal: true,
        }
    }
}

/// Network transport for the blockchain
pub struct Transport {
    /// Configuration
    config: TransportConfig,
    /// Local peer ID
    local_peer_id: PeerId,
    /// Local keypair
    local_keypair: Keypair,
}

impl Transport {
    /// Create a new transport
    pub fn new(config: TransportConfig, keypair: Keypair) -> Self {
        let local_peer_id = PeerId::from(keypair.public());
        
        Transport {
            config,
            local_peer_id,
            local_keypair: keypair,
        }
    }
    
    /// Get the local peer ID
    pub fn local_peer_id(&self) -> &PeerId {
        &self.local_peer_id
    }
    
    /// Get the local keypair
    pub fn local_keypair(&self) -> &Keypair {
        &self.local_keypair
    }
    
    /// Build the libp2p transport
    pub fn build_transport(&self) -> Boxed<(PeerId, StreamMuxerBox)> {
        // Create a TCP transport with DNS name resolution
        let tcp_transport = TcpConfig::new()
            .nodelay(true)
            .connection_timeout(Duration::from_secs(self.config.connection_timeout));
        
        let dns_tcp = match DnsConfig::system(tcp_transport) {
            Ok(dns) => dns,
            Err(err) => {
                log::error!("Failed to create DNS config: {:?}", err);
                panic!("Failed to create DNS config: {:?}", err);
            }
        };
        
        // Create a Noise protocol for encryption
        let noise_keys = NoiseConfig::xx(self.local_keypair.clone()).into_authenticated();
        
        // Create a Mplex protocol for multiplexing
        let mplex = MplexConfig::new()
            .max_buffer_size(self.config.max_message_size)
            .max_substreams(self.config.max_connections);
        
        // Combine everything into a single transport
        dns_tcp
            .upgrade(Version::V1)
            .authenticate(noise_keys)
            .multiplex(mplex)
            .timeout(Duration::from_secs(self.config.connection_timeout))
            .boxed()
    }
    
    /// Get the configuration
    pub fn config(&self) -> &TransportConfig {
        &self.config
    }
}
