#!/bin/bash
# Build script for Linux/Mac

set -e

IMAGE_NAME="naga-wasm-builder"
CURRENT_DIR=$(pwd)

echo "Building Docker image..."
docker build -t $IMAGE_NAME .

echo "Compiling WASM..."
docker run --rm \
    -v "$CURRENT_DIR/rust:/workspace" \
    -v "$CURRENT_DIR/dist:/output" \
    $IMAGE_NAME \
    build --target nodejs --out-dir /output

echo "Build completed successfully!"
