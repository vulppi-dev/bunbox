# Build script for Windows (PowerShell)
$IMAGE_NAME = "naga-wasm-builder"
$CURRENT_DIR = Get-Location

Write-Host "Building Docker image..." -ForegroundColor Cyan
docker build -t $IMAGE_NAME .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build Docker image" -ForegroundColor Red
    exit 1
}

Write-Host "Compiling WASM..." -ForegroundColor Cyan
docker run --rm `
    -v "${CURRENT_DIR}/rust:/workspace" `
    -v "${CURRENT_DIR}/dist:/output" `
    $IMAGE_NAME `
    build --target nodejs --out-dir /output

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to compile WASM" -ForegroundColor Red
    exit 1
}

Write-Host "Build completed successfully!" -ForegroundColor Green
