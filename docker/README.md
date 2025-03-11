# OptimaChain Docker Setup

This directory contains Docker configuration files for running the OptimaChain blockchain node and API server.

## Components

- **Node**: The core OptimaChain blockchain node written in Rust
- **API**: Express.js API server that provides a RESTful interface to the blockchain

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/enablerdao/OptimaChain.git
   cd OptimaChain
   ```

2. Build and start the containers:
   ```
   docker-compose -f docker/docker-compose.yml up -d
   ```

3. Check the logs:
   ```
   docker-compose -f docker/docker-compose.yml logs -f
   ```

## Configuration

### Node Configuration

The node can be configured using environment variables in the `docker-compose.yml` file:

- `RUST_LOG`: Log level (error, warn, info, debug, trace)

### API Configuration

The API server can be configured using environment variables:

- `NODE_ENV`: Environment (development, production)
- `NODE_URL`: URL of the blockchain node

## Ports

- **8080**: HTTP API for the blockchain node
- **30333**: P2P networking port for the blockchain node
- **3000**: API server port

## Data Persistence

Data is persisted using Docker volumes:

- `node-data`: Blockchain data, including the database and configuration

## Running as a Validator

To run the node as a validator, use the `--validator` flag in the command:

```yaml
command: ["./core/target/release/optimachain", "run", "--validator"]
```

## Troubleshooting

If you encounter issues:

1. Check the logs:
   ```
   docker-compose -f docker/docker-compose.yml logs -f node
   docker-compose -f docker/docker-compose.yml logs -f api
   ```

2. Restart the services:
   ```
   docker-compose -f docker/docker-compose.yml restart
   ```

3. Rebuild the containers:
   ```
   docker-compose -f docker/docker-compose.yml build --no-cache
   docker-compose -f docker/docker-compose.yml up -d
   ```
