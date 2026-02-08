---
sidebar_position: 1
---

# Quick Start

Get up and running with SignedShot in 5 minutes. This guide shows you how to verify media authenticity using the Python library.

## Prerequisites

- Python 3.12+ or Rust toolchain
- A media file with its sidecar (e.g., `photo.jpg` and `photo.sidecar.json`)

Don't have test files? Use the [interactive demo](https://signedshot.io/demo) to capture media and download both files.

## Install

### Python (recommended)

```bash
pip install signedshot
```

### Rust

```bash
cargo install signedshot-validator
```

## Verify Media

```python
import signedshot

# Validate media with its sidecar
result = signedshot.validate_files("photo.sidecar.json", "photo.jpg")

if result.valid:
    print("✓ Media is authentic")
else:
    print(f"✗ Validation failed: {result.error}")
```

## Understanding the Result

The validation result contains detailed information about both trust layers:

```python
# Basic result
print(result.valid)     # True/False
print(result.version)   # Sidecar format version
print(result.error)     # Error message if validation failed

# Capture trust (server-issued JWT)
trust = result.capture_trust
print(trust["signature_valid"])  # JWT signature verified
print(trust["issuer"])           # API that issued the token
print(trust["publisher_id"])     # Publisher ID
print(trust["device_id"])        # Device ID
print(trust["capture_id"])       # Capture session ID
print(trust["method"])           # Attestation: "sandbox", "app_check", or "app_attest"
print(trust["app_id"])           # App bundle ID (if attested)

# Media integrity (device signature)
integrity = result.media_integrity
print(integrity["content_hash_valid"])  # SHA-256 hash matches
print(integrity["signature_valid"])     # ECDSA signature verified
print(integrity["capture_id_match"])    # Capture IDs match
print(integrity["content_hash"])        # SHA-256 of media file
print(integrity["captured_at"])         # ISO8601 timestamp
```

## Validate from Bytes

For in-memory validation (useful in web services):

```python
with open("photo.sidecar.json") as f:
    sidecar_json = f.read()
with open("photo.jpg", "rb") as f:
    media_bytes = f.read()

result = signedshot.validate(sidecar_json, media_bytes)
```

## CLI Usage

Both installation methods include the `signedshot` command-line tool:

```bash
# Basic validation
signedshot validate photo.sidecar.json photo.jpg

# Output as JSON (for scripting)
signedshot validate photo.sidecar.json photo.jpg --json
```

Example output:

```
Validating sidecar: photo.sidecar.json
Media file: photo.jpg
[OK] Sidecar parsed
[OK] JWT decoded
[..] Fetching JWKS from https://api.signedshot.io
[OK] JWT signature verified
[OK] Content hash verified
[OK] Media signature verified
[OK] Capture ID match verified

Claims:
  Issuer:       https://api.signedshot.io
  Capture ID:   ac85dbd2-d8a8-4d0b-9e39-2feef5f7b19f
  Publisher ID: 9a5b1062-a8fe-4871-bdc1-fe54e96cbf1c
  Device ID:    ea5c9bfe-6bbc-4ee2-b82d-0bcfcc185ef1
  Method:       app_check
  App ID:       io.signedshot.capture
  Issued At:    1770319379
  Key ID:       2ad290db...

Media Integrity:
  Content Hash: a4d14b8e32df4123aa91ee172257856456d90f52...
  Capture ID:   ac85dbd2-d8a8-4d0b-9e39-2feef5f7b19f
  Captured At:  2026-02-05T19:22:58Z
  Public Key:   BDX7zNtobXIurJGN5XQFNISR/SLP1u/hhlKng/gW...

[OK] Validation complete
```

## What Gets Validated

The validator performs these checks:

1. **Capture Trust (JWT)** — Fetches JWKS from the issuer and verifies the ES256 signature
2. **Media Integrity** — Computes SHA-256 of the file and verifies the ECDSA signature
3. **Cross-Validation** — Confirms capture IDs match between JWT and media integrity

If any check fails, `result.valid` is `False` and `result.error` describes the issue.

## Next Steps

- [iOS Integration](/guides/ios-integration) — Capture media with cryptographic proof
- [Python Validation](/guides/python-validation) — Advanced validation scenarios
- [Sidecar Format](/concepts/sidecar-format) — Understand the proof structure
