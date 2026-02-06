---
sidebar_position: 3
---

# Python Validation

:::info Work in Progress
This page is under construction.
:::

Verify SignedShot photos using the Python library.

## Installation

```bash
pip install signedshot
```

## Basic Usage

```python
import signedshot

# Validate from files
result = signedshot.validate_files("photo.sidecar.json", "photo.jpg")

print(result.valid)           # True/False
print(result.capture_trust)   # JWT verification details
print(result.media_integrity) # Hash/signature verification details
```

## Validation Details

```python
# Capture trust (JWT verification)
trust = result.capture_trust
print(trust["signature_valid"])  # JWT signature verified
print(trust["issuer"])           # API that issued the token
print(trust["method"])           # Attestation method

# Media integrity (content verification)
integrity = result.media_integrity
print(integrity["content_hash_valid"])  # SHA-256 hash matches
print(integrity["signature_valid"])     # ECDSA signature verified
```

Full guide coming soon.
