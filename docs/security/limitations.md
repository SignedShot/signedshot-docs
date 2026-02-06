---
sidebar_position: 2
---

# Limitations

SignedShot provides strong guarantees about capture authenticity, but it's important to understand what it doesn't protect against.

## What SignedShot Does NOT Prove

### Content Truthfulness

SignedShot proves a device captured specific content — not that the content depicts reality.

**Example:** Photographing a printed deepfake, a TV screen showing manipulated video, or a staged scene produces a valid SignedShot capture. The capture is authentic; the subject may not be.

**Implication:** SignedShot is about provenance (where did this come from?), not truth (is this real?).

### Scene Authenticity

SignedShot doesn't verify what the camera is pointed at.

**Example:** An attacker could:
- Display AI-generated content on a monitor and photograph it
- Print a fake document and capture it
- Stage a scene with actors

All would produce valid captures.

### Pre-Capture Manipulation

If content is manipulated before being photographed, SignedShot cannot detect it.

**Example:** A document could be forged, printed, then photographed with SignedShot. The capture is authentic; the document is not.

### Identity of Photographer

SignedShot identifies the device, not the person using it.

**Example:** Anyone with physical access to a registered device can create valid captures. There's no biometric or identity verification.

**Implication:** "This device captured this" ≠ "This person captured this"

## Technical Limitations

### Compromised Devices

**Rooted/Jailbroken Devices:**
- Secure Enclave still protects keys on most rooted devices
- However, sophisticated attacks may be possible
- Attestation (`app_check`) may fail on some rooted devices

**Physical Attacks:**
- Sophisticated hardware attacks on Secure Enclave are theoretically possible
- Requires physical access and specialized equipment
- Not practical for most threat scenarios

### Sandbox Mode

**`sandbox` mode provides NO security guarantees:**
- No attestation is performed
- Any device can register
- Signatures are still valid, but trust is minimal

**Use only for:**
- Development and testing
- Demos and proof-of-concept
- Non-critical applications

### Network Dependency

SignedShot requires network connectivity for:
- Device registration (once)
- Creating capture sessions
- Exchanging nonces for trust tokens

**Implication:** Fully offline capture is not currently supported. The media integrity layer (hash + signature) works offline, but the capture trust layer (JWT) requires server communication.

### Key Loss

If a device is lost, wiped, or replaced:
- The Secure Enclave keys are lost
- Previous captures remain verifiable (public key is in sidecar)
- New captures require re-registration on the new device

### Server Dependency

SignedShot's capture trust layer depends on the API server:
- Server issues JWTs
- Server manages sessions and nonces
- JWKS provides verification keys

**Implication:** If the server is unavailable, new captures can't get trust tokens. Existing captures remain verifiable as long as JWKS is cached or accessible.

## Platform Limitations

### iOS Only (Currently)

The SDK currently supports iOS only.

**Roadmap:** Android support is planned for post-launch.

### Photo Only (Currently)

Video support is in development.

**Current state:** The protocol supports video (SHA-256 works on any byte stream), but the iOS SDK is optimized for photos.

## Comparison to Detection

SignedShot takes a fundamentally different approach than AI detection:

| Approach | What it does | Limitations |
|----------|--------------|-------------|
| **AI Detection** | Analyzes content for signs of manipulation | Arms race with generators; false positives/negatives |
| **SignedShot** | Proves content came from a verified source | Doesn't detect pre-capture manipulation |

**SignedShot's advantage:** No arms race. Cryptographic proofs don't become less secure as AI improves.

**SignedShot's limitation:** Only works for content captured through the SignedShot flow. Doesn't help with existing content.

## Responsible Use

### What Verifiers Should Communicate

When displaying SignedShot verification results, be clear about what was verified:

**Good:**
> "This photo was captured on a verified device on [date] and has not been modified since."

**Misleading:**
> "This photo is authentic and real."

### Combine with Other Evidence

SignedShot is one piece of evidence, not the complete picture:

- Cross-reference with other sources
- Consider context and circumstances
- Apply editorial or investigative judgment
- Use SignedShot as part of a verification workflow

## Summary

| SignedShot Proves | SignedShot Does NOT Prove |
|-------------------|---------------------------|
| Content hasn't been modified | Content depicts reality |
| Captured on a specific device | Identity of photographer |
| Captured at a specific time | Scene wasn't staged |
| App passed attestation | Device wasn't compromised |

## Next Steps

- [Threat Model](/security/threat-model) — What SignedShot protects against
- [Two-Layer Trust](/concepts/two-layer-trust) — Understand the trust model
- [Quick Start](/guides/quick-start) — Start verifying captures
