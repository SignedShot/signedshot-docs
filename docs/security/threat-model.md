---
sidebar_position: 1
---

# Threat Model

This document describes what SignedShot protects against, the assumptions it makes, and how the security model works.

## What SignedShot Proves

SignedShot provides cryptographic proof that:

1. **This exact content** was captured (hash verification)
2. **On this device** (Secure Enclave signature)
3. **At this time** (timestamp in signed message)
4. **By a verified app** (device attestation via JWT)

It establishes a verified chain of custody from capture to verification.

:::info Key Insight
SignedShot proves "this device captured this content at this time" — not "this content depicts reality." A capture of a printed deepfake is still a valid SignedShot capture.
:::

## Threats Mitigated

### Post-Capture Tampering

**Threat:** An attacker modifies the image after capture (cropping, editing, AI manipulation).

**Mitigation:** The SHA-256 hash is computed at capture time and signed by the device's Secure Enclave. Any modification — even a single pixel — changes the hash and invalidates the signature.

**Verification:** Compare `content_hash` in the sidecar with the computed hash of the file.

### Content Substitution

**Threat:** An attacker claims a different image was captured during a session.

**Mitigation:** The `capture_id` links the media integrity signature to a specific capture session. The signed message includes the content hash, so a signature cannot be transferred to different content.

**Verification:** Confirm `capture_id` matches in both the JWT and media integrity sections.

### Signature Forgery

**Threat:** An attacker creates a valid signature without access to the device.

**Mitigation:** Private keys are generated and stored in the device's Secure Enclave (iOS) or KeyStore (Android). Keys never leave the secure hardware and cannot be exported.

**Verification:** Verify the ECDSA signature using the public key in the sidecar.

### Replay Attacks

**Threat:** An attacker reuses a valid signature or JWT from a previous capture.

**Mitigation:** Each capture session has a unique `capture_id` and `nonce`. The nonce is single-use and expires after a short window. The server rejects attempts to reuse a nonce.

**Verification:** The JWT `capture_id` must match the media integrity `capture_id`.

### Unauthorized Capture Claims

**Threat:** An attacker claims media was captured through the SignedShot flow when it wasn't.

**Mitigation:** The JWT is signed by the SignedShot API with ES256. Only the API can issue valid JWTs. Validators fetch the JWKS to verify the signature.

**Verification:** Verify JWT signature against `/.well-known/jwks.json`.

### Device Spoofing (with attestation)

**Threat:** An attacker registers a fake device to obtain capture tokens.

**Mitigation:** When attestation is enabled (`app_check` or `app_attest` method), the device must pass Firebase App Check verification. This proves the request comes from a genuine app on a real device.

**Verification:** Check the `method` field in the JWT. Reject `sandbox` for high-trust use cases.

### Cross-Layer Substitution

**Threat:** An attacker performs a legitimate capture to obtain a valid JWT, then generates a new key pair and signs different content with it, combining the valid JWT with the forged media integrity proof.

**Mitigation:** The JWT contains `device_public_key_fingerprint` — the SHA-256 hash of the device's content-signing public key, computed at registration. The validator checks that `SHA-256(public_key from media integrity)` matches this fingerprint, binding the two layers cryptographically.

**Verification:** Confirm `SHA-256(public_key)` matches `device_public_key_fingerprint` in the JWT.

### Metadata Forgery

**Threat:** An attacker manipulates EXIF timestamps, GPS coordinates, or other metadata.

**Mitigation:** SignedShot doesn't rely on EXIF metadata. The `captured_at` timestamp is part of the signed message, making it tamper-evident. The JWT `iat` (issued at) provides server-side timestamp.

**Verification:** Use `captured_at` from the signed media integrity, not EXIF data.

## Security Layers

### Layer 1: Media Integrity

| Component | Security Property |
|-----------|-------------------|
| SHA-256 hash | Collision-resistant content binding |
| ECDSA P-256 signature | Unforgeable without private key |
| Secure Enclave storage | Hardware-protected key material |
| Signed message format | Binds hash, capture_id, and timestamp |

### Layer 2: Capture Trust

| Component | Security Property |
|-----------|-------------------|
| Session nonce | Single-use, prevents replay |
| Device token | Authenticates registered devices |
| Firebase App Check | Verifies genuine app on real device |
| ES256 JWT | Server-signed, publicly verifiable |
| JWKS endpoint | Key rotation, standard verification |

## Trust Levels

The `method` field in the JWT indicates the attestation level:

| Method | Trust Level | Use Case |
|--------|-------------|----------|
| `sandbox` | Low | Development and testing only |
| `app_check` | Medium-High | Production apps with Firebase |
| `app_attest` | High | Future: direct Apple attestation |

**Recommendation:** Verifiers should reject `sandbox` captures for any use case requiring trust.

## Cryptographic Specifications

| Algorithm | Purpose | Standard |
|-----------|---------|----------|
| SHA-256 | Content hashing | FIPS 180-4 |
| ECDSA P-256 | Device signatures | FIPS 186-4, SEC 2 |
| ES256 | JWT signing | RFC 7518 |
| Secure Enclave | Key storage | Apple Platform Security |

### Signature Format

The media integrity signature signs the message:

```
{content_hash}:{capture_id}:{captured_at}
```

Example:
```
9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08:550e8400-e29b-41d4-a716-446655440000:2025-01-15T10:30:00Z
```

The signature uses ECDSA with the P-256 curve, encoded as base64.

## Assumptions

SignedShot's security relies on these assumptions:

1. **Secure Enclave integrity** — The device's secure hardware is not compromised
2. **App integrity** — The SignedShot SDK is running in an unmodified app
3. **Network security** — TLS protects API communication
4. **Server security** — The SignedShot API's signing keys are protected
5. **Time accuracy** — Device and server clocks are reasonably synchronized

## Attack Scenarios

### Scenario: Modified App

**Attack:** An attacker modifies the app to sign arbitrary content.

**Result:** If attestation is enabled (`app_check`), Firebase App Check will reject the modified app. With `sandbox` mode, this attack succeeds — which is why `sandbox` should not be trusted.

### Scenario: Rooted Device

**Attack:** An attacker uses a rooted/jailbroken device to extract keys.

**Result:** Modern Secure Enclaves resist software-based extraction even on rooted devices. However, attestation may fail on some rooted devices, preventing registration with `app_check` method.

### Scenario: Screenshot of Deepfake

**Attack:** An attacker photographs a deepfake displayed on a screen.

**Result:** SignedShot will produce a valid capture. This is by design — SignedShot proves what was captured, not whether the subject is real. The capture is authentic; the content may not be.

### Scenario: Compromised Server

**Attack:** An attacker gains access to the SignedShot API signing keys.

**Result:** The attacker could issue fraudulent JWTs. Mitigation: key rotation via JWKS, server security hardening, monitoring for anomalous JWT issuance.

## Verification Checklist

For maximum security, verify all of the following:

- [ ] JWT signature valid against JWKS
- [ ] JWT `iss` matches expected issuer
- [ ] JWT `method` is acceptable (not `sandbox` for production)
- [ ] Content hash matches file
- [ ] Media integrity signature valid
- [ ] `capture_id` matches in JWT and media integrity
- [ ] `device_public_key_fingerprint` matches `SHA-256(public_key)` from media integrity
- [ ] `captured_at` is reasonable (not in future, not too old)

## Next Steps

- [Limitations](/security/limitations) — What SignedShot doesn't protect against
- [Two-Layer Trust](/concepts/two-layer-trust) — Understand the trust model
- [Sidecar Format](/concepts/sidecar-format) — Proof structure reference
