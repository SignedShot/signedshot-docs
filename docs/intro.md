---
sidebar_position: 1
slug: /
---

# SignedShot

**Signed at capture. Verified anywhere.**

SignedShot is an open protocol for proving photos and videos haven't been altered since capture—cryptographically, not by guessing.

## The Problem

Digital manipulation is easy and getting easier. Anyone can alter a photo in seconds, and there's no built-in way to prove otherwise.

This leads to an erosion of trust in visual media—and no way to prove "I didn't edit this."

SignedShot solves this by embedding cryptographic proof at the moment of capture.

## A Different Approach

SignedShot doesn't detect fakes. It proves authenticity at the moment of capture.

> "Detection is an arms race. SignedShot focuses on authenticity at capture: cryptographic proof of where content came from, at the moment it was created."

The result: **"This device captured this content at this time."**

Anyone can verify the proof independently. Open source, no vendor lock-in.

## How It Works: Two Layers

SignedShot uses two complementary layers of cryptographic proof:

| Layer | What it proves | How |
|-------|---------------|-----|
| **Media Integrity** | Content hasn't been modified | Device signs the content hash using Secure Enclave (P-256) |
| **Capture Trust** | A legitimate device captured it | Server verifies the device before capture via attestation |

Together they prove: *"This exact content was captured on a verified device, in an authorized session, and hasn't been modified since."*

## Detection vs Provenance

| Detection (others) | Provenance (SignedShot) |
|-------------------|------------------------|
| Analyzes after the fact | Proves at capture time |
| Statistical guessing | Cryptographic certainty |
| Arms race with AI | Doesn't matter how good AI gets |
| Requires expert analysis | Anyone can verify |

## What You Can Do

### Capture signed photos
Use the iOS SDK to capture photos with embedded cryptographic proof.

```swift
let session = try await signedShot.startSession()
let sidecar = try await signedShot.createSidecar(imageData: jpegData, session: session)
```

### Verify photos

Use the Python library to verify any SignedShot photo.

```bash
pip install signedshot
```

```python
import signedshot
result = signedshot.validate_files("photo.sidecar.json", "photo.jpg")
print(result.valid)  # True or False
```

### Integrate with your app
Use the API directly to build custom integrations.

## Get Started

- [Two-Layer Trust Model](/concepts/two-layer-trust) — Understand how SignedShot works
- [Quick Start](/guides/quick-start) — Get up and running in 5 minutes
- [iOS Integration](/guides/ios-integration) — Capture signed photos
- [Python Validation](/guides/python-validation) — Verify photos programmatically
- [API Reference](/api-reference/overview) — Direct API integration

## Open Source

SignedShot is fully open source. Inspect, verify, or contribute:

- [signedshot-api](https://github.com/SignedShot/signedshot-api) — Backend API
- [signedshot-ios](https://github.com/SignedShot/signedshot-ios) — iOS SDK
- [signedshot-validator](https://github.com/SignedShot/signedshot-validator) — Verification CLI + Python library

---

*"I don't believe any single company should be the arbiter of digital truth."*
