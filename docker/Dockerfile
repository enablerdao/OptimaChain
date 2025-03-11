FROM rust:1.83-slim-bullseye as builder

# Install dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libclang-dev \
    pkg-config \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy the source code
COPY core/ ./core/

# Build the application
WORKDIR /app/core
RUN cargo build --release

# Runtime image
FROM debian:bullseye-slim

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/core/target/release/optimachain /app/optimachain

# Create data directory
RUN mkdir -p /app/data

# Expose ports
EXPOSE 30333 9933 9944

# Set the entrypoint
ENTRYPOINT ["/app/optimachain"]
CMD ["run", "--data-dir", "/app/data"]
