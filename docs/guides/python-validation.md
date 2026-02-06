---
sidebar_position: 3
---

# Python Validation

This guide covers advanced validation scenarios using the SignedShot Python library.

## Installation

```bash
pip install signedshot
```

Requires Python 3.12+. The library is a compiled Rust extension for maximum performance.

## Validation Methods

### From Files

The simplest approach for local files:

```python
import signedshot

result = signedshot.validate_files("photo.sidecar.json", "photo.jpg")
```

### From Bytes

For in-memory data (web uploads, API services):

```python
with open("photo.sidecar.json") as f:
    sidecar_json = f.read()
with open("photo.jpg", "rb") as f:
    media_bytes = f.read()

result = signedshot.validate(sidecar_json, media_bytes)
```

### With Pre-loaded JWKS

By default, the library fetches JWKS from the issuer's `/.well-known/jwks.json` endpoint. For high-throughput services, cache the JWKS to avoid HTTP calls:

```python
import requests
import signedshot

# Fetch once and cache (refresh periodically)
jwks = requests.get("https://api.signedshot.io/.well-known/jwks.json").text

# Validate without HTTP call
result = signedshot.validate_with_jwks(sidecar_json, media_bytes, jwks)
```

This is recommended for API services that validate many photos.

## Understanding Results

### Overall Status

```python
result.valid      # True if all checks pass
result.version    # Sidecar format version (e.g., "1.0")
result.error      # Error message if validation failed, None otherwise
```

### Capture Trust

The server-issued JWT verification:

```python
trust = result.capture_trust

trust["signature_valid"]   # JWT signature verified against JWKS
trust["issuer"]            # API that issued the token
trust["publisher_id"]      # Publisher UUID
trust["device_id"]         # Device UUID
trust["capture_id"]        # Capture session UUID
trust["method"]            # Attestation: "sandbox", "app_check", or "app_attest"
trust["app_id"]            # App bundle ID (present when attested)
trust["issued_at"]         # Unix timestamp when JWT was issued
trust["key_id"]            # JWKS key ID used for signing
```

### Media Integrity

The device-generated proof verification:

```python
integrity = result.media_integrity

integrity["content_hash_valid"]   # SHA-256 of file matches sidecar
integrity["signature_valid"]      # ECDSA signature verified
integrity["capture_id_match"]     # Capture ID matches JWT
integrity["content_hash"]         # SHA-256 hash (hex, 64 chars)
integrity["capture_id"]           # Capture session UUID
integrity["captured_at"]          # ISO8601 timestamp
```

### Validation Logic

A photo is valid when all these conditions are true:

1. `capture_trust["signature_valid"]` — JWT signature verifies
2. `media_integrity["content_hash_valid"]` — File hash matches
3. `media_integrity["signature_valid"]` — Device signature verifies
4. `media_integrity["capture_id_match"]` — Capture IDs match

If any check fails, `result.valid` is `False` and `result.error` describes the failure.

## Error Handling

```python
import signedshot

try:
    result = signedshot.validate_files("photo.sidecar.json", "photo.jpg")
except FileNotFoundError as e:
    print(f"File not found: {e}")
except ValueError as e:
    print(f"Parse error: {e}")
else:
    if result.valid:
        print("Photo is authentic")
    else:
        print(f"Validation failed: {result.error}")
```

Common error scenarios:

| Error | Cause |
|-------|-------|
| `FileNotFoundError` | Sidecar or media file doesn't exist |
| `ValueError` | Malformed JSON or invalid sidecar structure |
| `result.error = "Content hash mismatch"` | File was modified after capture |
| `result.error = "Signature verification failed"` | Invalid device signature |
| `result.error = "JWT verification failed"` | Invalid or expired JWT |

## Output Formats

Export results as dictionary or JSON:

```python
# Dictionary (for further processing)
data = result.to_dict()

# JSON string (compact)
json_str = result.to_json()

# JSON string (formatted)
json_pretty = result.to_json_pretty()
```

Example JSON output:

```json
{
  "valid": true,
  "version": "1.0",
  "error": null,
  "capture_trust": {
    "signature_valid": true,
    "issuer": "https://api.signedshot.io",
    "publisher_id": "9a5b1062-a8fe-4871-bdc1-fe54e96cbf1c",
    "device_id": "ea5c9bfe-6bbc-4ee2-b82d-0bcfcc185ef1",
    "capture_id": "550e8400-e29b-41d4-a716-446655440000",
    "method": "app_check",
    "app_id": "io.signedshot.capture",
    "issued_at": 1705312200
  },
  "media_integrity": {
    "content_hash_valid": true,
    "signature_valid": true,
    "capture_id_match": true,
    "content_hash": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    "capture_id": "550e8400-e29b-41d4-a716-446655440000",
    "captured_at": "2025-01-15T10:30:00Z"
  }
}
```

## Web Service Integration

### FastAPI Example

```python
from fastapi import FastAPI, UploadFile, HTTPException
import signedshot
import requests

app = FastAPI()

# Cache JWKS at startup
JWKS = requests.get("https://api.signedshot.io/.well-known/jwks.json").text

@app.post("/validate")
async def validate_photo(media: UploadFile, sidecar: UploadFile):
    media_bytes = await media.read()
    sidecar_json = (await sidecar.read()).decode("utf-8")

    try:
        result = signedshot.validate_with_jwks(sidecar_json, media_bytes, JWKS)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not result.valid:
        raise HTTPException(status_code=422, detail=result.error)

    return {
        "valid": True,
        "publisher_id": result.capture_trust["publisher_id"],
        "captured_at": result.media_integrity["captured_at"],
        "attestation": result.capture_trust["method"],
    }
```

### Flask Example

```python
from flask import Flask, request, jsonify
import signedshot
import requests

app = Flask(__name__)

# Cache JWKS at startup
JWKS = requests.get("https://api.signedshot.io/.well-known/jwks.json").text

@app.post("/validate")
def validate_photo():
    media = request.files["media"].read()
    sidecar = request.files["sidecar"].read().decode("utf-8")

    try:
        result = signedshot.validate_with_jwks(sidecar, media, JWKS)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    if not result.valid:
        return jsonify({"error": result.error}), 422

    return jsonify({
        "valid": True,
        "publisher_id": result.capture_trust["publisher_id"],
        "captured_at": result.media_integrity["captured_at"],
        "attestation": result.capture_trust["method"],
    })
```

## Batch Validation

For validating multiple files:

```python
from pathlib import Path
import signedshot

def validate_directory(directory: str):
    results = []

    for sidecar_path in Path(directory).glob("*.sidecar.json"):
        # Derive media path (photo.sidecar.json → photo.jpg or photo.heic)
        stem = sidecar_path.stem.replace(".sidecar", "")
        media_path = None

        for ext in [".jpg", ".jpeg", ".heic", ".png"]:
            candidate = sidecar_path.parent / f"{stem}{ext}"
            if candidate.exists():
                media_path = candidate
                break

        if not media_path:
            results.append({"file": str(sidecar_path), "error": "Media file not found"})
            continue

        result = signedshot.validate_files(str(sidecar_path), str(media_path))
        results.append({
            "file": str(media_path),
            "valid": result.valid,
            "error": result.error,
            "captured_at": result.media_integrity.get("captured_at") if result.valid else None,
        })

    return results

# Usage
for item in validate_directory("./photos"):
    status = "✓" if item["valid"] else "✗"
    print(f"{status} {item['file']}")
```

## Next Steps

- [Quick Start](/guides/quick-start) — Basic validation in 5 minutes
- [iOS Integration](/guides/ios-integration) — Capture photos with cryptographic proof
- [Sidecar Format](/concepts/sidecar-format) — Understand the proof structure
