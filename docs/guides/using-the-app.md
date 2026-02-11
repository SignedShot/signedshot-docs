---
sidebar_position: 4
---

# Using the App

A step-by-step guide to capturing authenticated photos with the SignedShot iOS app.

## Overview

The SignedShot app captures photos with cryptographic proof of authenticity. Each photo is signed by your device's hardware key and verified by the SignedShot API. The result is two files: the original photo and a sidecar proof that anyone can verify.

## Step 1: Register Your Device

When you first open the app, you'll see a **Device Not Registered** prompt.

1. Tap **Register Device**
2. Your device will be registered with the SignedShot API
3. A green shield icon appears in the status bar confirming registration

This is a one-time setup. Your device receives a unique identity used to sign future captures. The registration uses Apple's App Attest to verify that requests come from a genuine device.

:::tip
If registration fails, check your internet connection and try again. The app will show a **Retry** button on errors.
:::

## Step 2: Start a Capture Session

Before each photo, you need to start a capture session.

1. Tap **Start Session**
2. A **Session Active** indicator appears with a countdown timer
3. The capture button turns white, indicating you can now take a photo

Sessions expire after **5 minutes** as a security measure to prevent replay attacks. If a session expires, tap **Create New Session** to start a fresh one.

:::info
Each session generates a one-time nonce that ties your capture to a specific moment in time. This ensures the proof can't be reused.
:::

## Step 3: Capture a Photo

With an active session:

1. Frame your shot using the camera preview
2. Tap the **capture button** (white circle at the bottom)
3. Wait for the capture to complete

Behind the scenes, the app:
- Captures the raw JPEG bytes
- Signs the content hash with your device's hardware key (Secure Enclave)
- Exchanges the session nonce for a trust token from the API
- Generates a sidecar file combining the trust token and media integrity proof

## Step 4: View the Result

After a successful capture, you'll see:

- A thumbnail of your photo
- The filename (e.g., `photo_20260209_143052.jpg`)
- **Trust Token Received** confirmation
- The sidecar filename (e.g., `photo_20260209_143052.sidecar.json`)
- **Saved to Files → SignedShot** indicating where your files are stored

### Finding Your Files

Photos and sidecar proofs are saved to the **Files** app under the **SignedShot** folder. You can also tap **Open in Files** to jump there directly.

Each capture produces two files:

| File | Description |
|------|-------------|
| `photo_YYYYMMDD_HHMMSS.jpg` | The original photo (unmodified JPEG) |
| `photo_YYYYMMDD_HHMMSS.sidecar.json` | The cryptographic proof |

Both files are needed for verification. The sidecar alone proves nothing — it must be verified against the original media.

## Verifying Your Photo

You can verify a captured photo using the CLI or the API.

### CLI

```bash
# Install via pip or cargo
pip install signedshot
# or: cargo install signedshot-validator

# Validate
signedshot validate photo_20260209_143052.sidecar.json photo_20260209_143052.jpg
```

### API

Upload both files to the `/validate` endpoint:

```bash
curl -X POST https://api.signedshot.io/validate \
  -F "sidecar=@photo_20260209_143052.sidecar.json" \
  -F "media=@photo_20260209_143052.jpg"
```

### What Gets Verified

The validator checks three things:

1. **Capture Trust** — The JWT was signed by the SignedShot API (verified via JWKS)
2. **Media Integrity** — The SHA-256 hash matches and the device signature is valid
3. **Cross-Validation** — The capture ID in the JWT matches the one in the media integrity proof

If any check fails, the photo cannot be considered authentic.

## Troubleshooting

### Session Expired

Sessions last 5 minutes. If you see **Session Expired**, tap **Create New Session** and capture again.

### Network Errors

The app requires an internet connection to create sessions and exchange trust tokens. If you see a network error, check your connection and tap **Retry**.

### Unauthorized (401)

If your device session has expired on the server, the app will automatically clear credentials and prompt you to register again. Tap **Register Device** to re-register.

## Next Steps

- [Quick Start](/guides/quick-start) — Verify photos with the Python library or CLI
- [Sidecar Format](/concepts/sidecar-format) — Understand the proof structure
- [Two-Layer Trust](/concepts/two-layer-trust) — How Capture Trust and Media Integrity work together
