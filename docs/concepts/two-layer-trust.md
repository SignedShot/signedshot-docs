---
sidebar_position: 1
---

# Two-Layer Trust Model

SignedShot uses two complementary layers of cryptographic proof to verify media authenticity.

## Overview

When you capture a photo with SignedShot, two things happen:

1. **Capture Trust** — The server issues a signed token proving a verified device started a capture session
2. **Media Integrity** — The device signs the content hash using its Secure Enclave

Together, these prove: *"This exact content was captured on a verified device, in an authorized session, and hasn't been modified since."*

## Layer 1: Capture Trust

Capture Trust answers: **"Was this captured by a legitimate device?"**

### How it works

1. Device registers with the SignedShot API (once)
2. Device requests a capture session before taking a photo
3. Server verifies the device via attestation (Firebase App Check or App Attest)
4. Server issues a signed JWT containing session details

### What's in the JWT

| Field | Description |
|-------|-------------|
| `issuer` | API that issued the token (e.g., `https://api.signedshot.io`) |
| `publisher_id` | Publisher who owns the app |
| `device_id` | Unique device identifier |
| `capture_id` | Unique session identifier |
| `method` | Attestation method: `sandbox`, `app_check`, or `app_attest` |
| `app_id` | App bundle ID (when attested) |
| `issued_at` | Unix timestamp |

### Verification

The JWT is signed with ES256 (P-256 ECDSA). Anyone can verify it using the public keys from:

```
https://api.signedshot.io/.well-known/jwks.json
```

## Layer 2: Media Integrity

Media Integrity answers: **"Has this content been modified?"**

### How it works

1. Device computes SHA-256 hash of the media bytes
2. Device signs the hash + metadata using its Secure Enclave private key
3. Signature is stored in the sidecar alongside the content hash

### What's in Media Integrity

| Field | Description |
|-------|-------------|
| `content_hash` | SHA-256 hash of the media (hex, 64 characters) |
| `signature` | ECDSA signature (base64) |
| `public_key` | Device's public key (base64, uncompressed EC point) |
| `capture_id` | Must match the JWT's capture_id |
| `captured_at` | ISO8601 timestamp |

### Verification

1. Compute SHA-256 of the media file
2. Compare with `content_hash` in sidecar
3. Verify ECDSA signature using the `public_key`
4. Confirm `capture_id` matches the JWT

## Why Two Layers?

Neither layer alone is sufficient:

| Layer | What it proves | What it doesn't prove |
|-------|---------------|----------------------|
| **Capture Trust only** | Device is legitimate | Content wasn't modified after capture |
| **Media Integrity only** | Content wasn't modified | Device was legitimate |

Together, they create a complete chain of trust from device verification to content integrity.

## The Sidecar File

Both layers are stored in a JSON sidecar file that travels with the media:

```json
{
  "version": "1.0",
  "capture_trust": {
    "jwt": "eyJhbGciOiJFUzI1NiIs..."
  },
  "media_integrity": {
    "content_hash": "a1b2c3d4...",
    "signature": "MEUCIQC...",
    "public_key": "BHx5y...",
    "capture_id": "550e8400-e29b-41d4-a716-446655440000",
    "captured_at": "2025-01-15T10:30:00Z"
  }
}
```

The sidecar is a separate file (e.g., `photo.sidecar.json`) that accompanies the media file (`photo.jpg`). This keeps the original media untouched.

## Attestation Methods

The `method` field in the JWT indicates how the device was verified:

| Method | Description |
|--------|-------------|
| `sandbox` | No attestation (development/testing only) |
| `app_check` | Firebase App Check verification |
| `app_attest` | Apple App Attest directly (future) |

Verifiers can check the attestation method to make trust decisions. For example, a news organization might reject `sandbox` captures while accepting `app_check` or `app_attest`.

## Next Steps

- [Sidecar Format](/concepts/sidecar-format) — Full JSON schema reference
- [Python Validation](/guides/python-validation) — Verify photos programmatically
- [iOS Integration](/guides/ios-integration) — Capture signed photos
