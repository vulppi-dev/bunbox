# Build stage for wasm-pack
FROM rust:1.83-slim as builder

# Install wasm-pack and dependencies
RUN apt-get update && \
    apt-get install -y pkg-config libssl-dev curl && \
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# This image is ready to build WASM projects
# Usage: docker run --rm -v $(pwd):/workspace wasm-builder wasm-pack build ...
ENTRYPOINT ["wasm-pack"]
