---
sidebar_position: 2
---

# iOS Integration

:::info Work in Progress
This page is under construction.
:::

Integrate SignedShot into your iOS app to capture signed photos.

## Installation

Add the SignedShot SDK via Swift Package Manager:

```
https://github.com/SignedShot/signedshot-ios.git
```

## Basic Usage

```swift
import SignedShotSDK

let signedShot = SignedShotClient(
    baseURL: "https://api.signedshot.io",
    publisherToken: "your-publisher-token"
)

// Register device (once)
let device = try await signedShot.registerDevice()

// Start capture session
let session = try await signedShot.startSession()

// After capturing photo...
let sidecar = try await signedShot.createSidecar(
    imageData: jpegData,
    session: session
)
```

Full guide coming soon.
