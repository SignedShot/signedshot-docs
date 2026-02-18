---
sidebar_position: 3
---

# Cryptographic Specifications

This document provides detailed specifications for the cryptographic algorithms, key formats, and encoding standards used by SignedShot.

## Overview

SignedShot uses industry-standard cryptographic primitives:

| Component | Algorithm | Standard |
|-----------|-----------|----------|
| Content hashing | SHA-256 | FIPS 180-4 |
| Device signatures | ECDSA P-256 | FIPS 186-4, SEC 2 |
| JWT signatures | ES256 | RFC 7518 |
| Key storage | Secure Enclave | Apple Platform Security |

## Hash Algorithm

### SHA-256

All content hashing uses SHA-256 (Secure Hash Algorithm 256-bit).

**Properties:**
- Output: 256 bits (32 bytes)
- Collision resistant
- Preimage resistant

**Encoding:** Lowercase hexadecimal (64 characters)

**Example:**
```
Input:  [binary media file]
Output: 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
```

**Standard:** FIPS 180-4

## Signature Algorithms

### Device Signatures (ECDSA P-256)

Device signatures use ECDSA (Elliptic Curve Digital Signature Algorithm) with the P-256 curve.

**Parameters:**
- Curve: NIST P-256 (secp256r1, prime256v1)
- Key size: 256 bits
- Signature format: DER-encoded (X9.62)

**Key Generation:**
- Generated in the device's Secure Enclave
- Private key never leaves secure hardware
- One key pair per device

**Signed Message Format:**
```
{content_hash}:{capture_id}:{captured_at}
```

**Example message:**
```
9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08:550e8400-e29b-41d4-a716-446655440000:2025-01-15T10:30:00Z
```

**Signature encoding:** Base64

**Standards:** FIPS 186-4, SEC 2, ANSI X9.62

### JWT Signatures (ES256)

JWTs are signed using ES256 (ECDSA with P-256 and SHA-256).

**Parameters:**
- Algorithm: ES256
- Curve: P-256
- Hash: SHA-256

**Key management:**
- Server-side key pair
- Public keys published via JWKS endpoint
- Key ID (`kid`) in JWT header for key selection

**Standard:** RFC 7518 (JSON Web Algorithms)

## Key Formats

### Device Public Key

The device's public key is stored in the sidecar as an uncompressed EC point.

**Format:** Uncompressed point (X9.62)
- Prefix: `0x04`
- X coordinate: 32 bytes
- Y coordinate: 32 bytes
- Total: 65 bytes

**Encoding:** Base64

**Example:**
```
BHx5yK3K1K3K1K3K1K3K1K3K1K3K1K3K1K3K1K3K1K3K1K3K1K3K1K3K1K3K1K3K1K3K1K3K1K3K1K3K1K3K1K3K1K3K1K3M=
```

**Decoding steps:**
1. Base64 decode → 65 bytes
2. Verify prefix is `0x04`
3. Extract X (bytes 1-32) and Y (bytes 33-64)

### JWKS Public Keys

Server public keys are published in JWK (JSON Web Key) format.

**Endpoint:** `/.well-known/jwks.json`

**Example:**
```json
{
  "keys": [
    {
      "kty": "EC",
      "crv": "P-256",
      "kid": "key-1",
      "use": "sig",
      "alg": "ES256",
      "x": "base64url-encoded-x-coordinate",
      "y": "base64url-encoded-y-coordinate"
    }
  ]
}
```

**Fields:**
| Field | Value | Description |
|-------|-------|-------------|
| `kty` | `"EC"` | Key type (Elliptic Curve) |
| `crv` | `"P-256"` | Curve name |
| `kid` | string | Key identifier |
| `use` | `"sig"` | Key usage (signature) |
| `alg` | `"ES256"` | Algorithm |
| `x` | base64url | X coordinate |
| `y` | base64url | Y coordinate |

**Standard:** RFC 7517 (JSON Web Key)

## Encoding Standards

### Base64

Used for:
- Device signatures
- Device public keys

**Alphabet:** Standard Base64 (A-Z, a-z, 0-9, +, /)
**Padding:** With `=` padding

### Base64URL

Used for:
- JWT components
- JWKS coordinates

**Alphabet:** URL-safe Base64 (A-Z, a-z, 0-9, -, _)
**Padding:** Without padding

### Hexadecimal

Used for:
- Content hashes

**Format:** Lowercase, no prefix
**Length:** 64 characters for SHA-256

## JWT Structure

### Header

```json
{
  "alg": "ES256",
  "typ": "JWT",
  "kid": "key-1"
}
```

| Field | Description |
|-------|-------------|
| `alg` | Signature algorithm (always `ES256`) |
| `typ` | Token type (always `JWT`) |
| `kid` | Key ID for JWKS lookup |

### Payload

```json
{
  "iss": "https://dev-api.signedshot.io",
  "aud": "signedshot",
  "sub": "capture-service",
  "iat": 1705312200,
  "capture_id": "550e8400-e29b-41d4-a716-446655440000",
  "publisher_id": "9a5b1062-a8fe-4871-bdc1-fe54e96cbf1c",
  "device_id": "ea5c9bfe-6bbc-4ee2-b82d-0bcfcc185ef1",
  "device_public_key_fingerprint": "4ca63447117ea5c99614bcbe433eb393a1f8b2e14c7b3f5d8e9a0b1c2d3e4f56",
  "attestation": {
    "method": "app_check",
    "app_id": "io.signedshot.capture"
  }
}
```

### Signature

The signature is computed over:
```
base64url(header) + "." + base64url(payload)
```

Using ES256 (ECDSA P-256 with SHA-256).

**Standard:** RFC 7519 (JSON Web Token)

## Timestamp Formats

### ISO 8601 (Media Integrity)

Used for `captured_at` in media integrity.

**Format:** `YYYY-MM-DDTHH:mm:ssZ`
**Timezone:** UTC (indicated by `Z` suffix)
**Precision:** Seconds (no fractional seconds)

**Example:** `2025-01-15T10:30:00Z`

### Unix Timestamp (JWT)

Used for `iat` (issued at) in JWT payload.

**Format:** Integer seconds since Unix epoch (1970-01-01T00:00:00Z)

**Example:** `1705312200`

## UUID Format

All identifiers use UUID v4.

**Format:** `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- `x`: hexadecimal digit
- `4`: version (always 4)
- `y`: variant (8, 9, a, or b)

**Example:** `550e8400-e29b-41d4-a716-446655440000`

**Standard:** RFC 4122

## Verification Pseudocode

### Verify Media Integrity

```python
def verify_media_integrity(media_bytes, sidecar):
    # 1. Compute hash
    computed_hash = sha256(media_bytes).hex()

    # 2. Compare hashes
    if computed_hash != sidecar.media_integrity.content_hash:
        return False, "Hash mismatch"

    # 3. Reconstruct signed message
    message = f"{sidecar.media_integrity.content_hash}:{sidecar.media_integrity.capture_id}:{sidecar.media_integrity.captured_at}"

    # 4. Decode public key (base64 → 65 bytes uncompressed point)
    public_key = base64_decode(sidecar.media_integrity.public_key)

    # 5. Decode signature (base64 → DER-encoded ECDSA signature)
    signature = base64_decode(sidecar.media_integrity.signature)

    # 6. Verify ECDSA signature
    if not ecdsa_verify(public_key, message.encode('utf-8'), signature):
        return False, "Invalid signature"

    return True, None
```

### Verify Capture Trust

```python
def verify_capture_trust(sidecar, jwks):
    jwt = sidecar.capture_trust.jwt

    # 1. Decode JWT header (without verification)
    header = jwt_decode_header(jwt)
    kid = header['kid']

    # 2. Find key in JWKS
    key = find_key_by_kid(jwks, kid)
    if key is None:
        return False, "Key not found"

    # 3. Verify JWT signature
    if not jwt_verify(jwt, key, algorithm='ES256'):
        return False, "Invalid JWT signature"

    # 4. Decode payload
    payload = jwt_decode_payload(jwt)

    return True, payload
```

### Cross-Validate

```python
def cross_validate(sidecar, jwt_payload):
    # Capture IDs must match
    if sidecar.media_integrity.capture_id != jwt_payload['capture_id']:
        return False, "Capture ID mismatch"

    # Device public key fingerprint must match (cross-layer binding)
    public_key_bytes = base64_decode(sidecar.media_integrity.public_key)
    fingerprint = sha256(public_key_bytes).hex()
    if fingerprint != jwt_payload['device_public_key_fingerprint']:
        return False, "Device public key fingerprint mismatch"

    return True, None
```

## Security Considerations

### Key Security

- Device private keys are generated in and never leave the Secure Enclave
- Server signing keys should be stored in HSM or secure key management
- Key rotation is supported via JWKS `kid` field

### Signature Security

- ECDSA P-256 provides ~128 bits of security
- SHA-256 is collision-resistant with 256-bit output
- Both meet current security standards (NIST, FIPS)

### Timing Attacks

- Signature verification should use constant-time comparison
- Hash comparison should use constant-time comparison

## References

| Standard | Document |
|----------|----------|
| SHA-256 | [FIPS 180-4](https://csrc.nist.gov/publications/detail/fips/180/4/final) |
| ECDSA | [FIPS 186-4](https://csrc.nist.gov/publications/detail/fips/186/4/final) |
| P-256 | [SEC 2](https://www.secg.org/sec2-v2.pdf) |
| JWT | [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519) |
| JWK | [RFC 7517](https://datatracker.ietf.org/doc/html/rfc7517) |
| JWA | [RFC 7518](https://datatracker.ietf.org/doc/html/rfc7518) |
| UUID | [RFC 4122](https://datatracker.ietf.org/doc/html/rfc4122) |

## Next Steps

- [Sidecar Format](/concepts/sidecar-format) — Full JSON schema reference
- [Two-Layer Trust](/concepts/two-layer-trust) — Understand the trust model
- [Threat Model](/security/threat-model) — Security analysis
