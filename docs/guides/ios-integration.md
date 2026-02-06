---
sidebar_position: 2
---

# iOS Integration

Integrate SignedShot into your iOS app to capture media with cryptographic proof of authenticity.

## Requirements

- iOS 16.0+
- Xcode 15.0+
- Swift 5.9+
- Device with Secure Enclave (iPhone 5s or later)

The SDK uses the Secure Enclave for hardware-backed key storage. Simulator builds work but use software keys.

## Installation

Add the SDK via Swift Package Manager.

### In Xcode

**File → Add Package Dependencies** → Enter:

```
https://github.com/SignedShot/signedshot-ios.git
```

### In Package.swift

```swift
dependencies: [
    .package(url: "https://github.com/SignedShot/signedshot-ios.git", from: "0.1.0")
]
```

## Configuration

Initialize the client with your publisher ID:

```swift
import SignedShotSDK

let config = SignedShotConfiguration(
    baseURL: URL(string: "https://api.signedshot.io")!,
    publisherId: "your-publisher-id"
)

let client = SignedShotClient(configuration: config)
```

Or using the string convenience initializer:

```swift
let config = SignedShotConfiguration(
    baseURLString: "https://api.signedshot.io",
    publisherId: "your-publisher-id"
)!

let client = SignedShotClient(configuration: config)
```

## Device Registration

Register the device once (credentials are stored in Keychain):

```swift
// Check if already registered
if !client.isDeviceRegistered {
    do {
        let response = try await client.registerDevice()
        print("Device registered: \(response.deviceId)")
    } catch {
        print("Registration failed: \(error)")
    }
}

// Access stored device ID
if let deviceId = client.deviceId {
    print("Using device: \(deviceId)")
}
```

Registration creates a device identity on the SignedShot backend and stores the device token securely in Keychain.

## Capture Workflow

The capture flow has four steps:

1. **Create session** — Get a capture ID and nonce from the backend
2. **Capture media** — Take the photo or video (your camera code)
3. **Generate integrity** — Hash and sign the media with Secure Enclave
4. **Exchange trust token** — Swap nonce for a signed JWT
5. **Generate sidecar** — Combine trust token and integrity proof

### 1. Create Session

```swift
let session = try await client.createCaptureSession()
// session.captureId  - UUID for this capture
// session.nonce      - Cryptographic nonce (use once)
// session.expiresAt  - Session expiration time
```

### 2. Capture Media

Use your existing camera implementation. The SDK doesn't handle camera capture—it only handles signing.

```swift
// Your camera code produces media data (JPEG, HEIC, etc.)
let mediaData: Data = captureMedia()
let capturedAt = Date()
```

### 3. Generate Media Integrity

Sign the media with the device's Secure Enclave:

```swift
let enclaveService = SecureEnclaveService()
let integrityService = MediaIntegrityService(enclaveService: enclaveService)

let integrity = try integrityService.generateIntegrity(
    for: jpegData,
    captureId: session.captureId,
    capturedAt: capturedAt
)
```

This produces a `MediaIntegrity` object containing:
- `contentHash` — SHA-256 of the media (hex)
- `signature` — ECDSA signature from Secure Enclave (base64)
- `publicKey` — Device's public key (base64)
- `captureId` — Matches the session
- `capturedAt` — ISO8601 timestamp

### 4. Exchange Trust Token

Swap the nonce for a signed JWT:

```swift
let trustResponse = try await client.exchangeTrustToken(nonce: session.nonce)
let jwt = trustResponse.trustToken
```

The JWT contains claims about the publisher, device, and attestation method, signed by the SignedShot API.

### 5. Generate Sidecar

Combine everything into a sidecar file:

```swift
let generator = SidecarGenerator()
let sidecarData = try generator.generate(
    jwt: jwt,
    mediaIntegrity: integrity
)
```

### 6. Save Files

Save the media and sidecar together:

```swift
let photoURL = documentsDirectory.appendingPathComponent("photo.jpg")
let sidecarURL = documentsDirectory.appendingPathComponent("photo.sidecar.json")

try jpegData.write(to: photoURL)
try sidecarData.write(to: sidecarURL)
```

## Complete Example

```swift
import SignedShotSDK

class CaptureManager {
    private let client: SignedShotClient
    private let integrityService: MediaIntegrityService

    init(publisherId: String) {
        let config = SignedShotConfiguration(
            baseURLString: "https://api.signedshot.io",
            publisherId: publisherId
        )!

        self.client = SignedShotClient(configuration: config)
        self.integrityService = MediaIntegrityService()
    }

    func captureSignedPhoto(jpegData: Data) async throws -> (photo: Data, sidecar: Data) {
        // Ensure device is registered
        if !client.isDeviceRegistered {
            try await client.registerDevice()
        }

        // Create capture session
        let session = try await client.createCaptureSession()
        let capturedAt = Date()

        // Generate media integrity (Secure Enclave signs the hash)
        let integrity = try integrityService.generateIntegrity(
            for: jpegData,
            captureId: session.captureId,
            capturedAt: capturedAt
        )

        // Exchange nonce for trust token
        let trustResponse = try await client.exchangeTrustToken(nonce: session.nonce)

        // Generate sidecar
        let generator = SidecarGenerator()
        let sidecarData = try generator.generate(
            jwt: trustResponse.trustToken,
            mediaIntegrity: integrity
        )

        return (jpegData, sidecarData)
    }
}
```

## Firebase App Check

For production apps, enable device attestation with Firebase App Check. This proves the app is running on a genuine device.

### 1. Set Up Firebase

Add Firebase to your project and enable App Check in the Firebase Console.

### 2. Configure Provider

```swift
import FirebaseCore
import FirebaseAppCheck

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // Set up App Check before Firebase.configure()
        let providerFactory = SignedShotAppCheckProviderFactory()
        AppCheck.setAppCheckProviderFactory(providerFactory)

        FirebaseApp.configure()
        return true
    }
}

class SignedShotAppCheckProviderFactory: NSObject, AppCheckProviderFactory {
    func createProvider(with app: FirebaseApp) -> AppCheckProvider? {
        #if targetEnvironment(simulator)
        return AppCheckDebugProvider(app: app)
        #else
        return AppAttestProvider(app: app)
        #endif
    }
}
```

### 3. Register with Attestation

```swift
import FirebaseAppCheck

// Get App Check token
let appCheckToken = try await AppCheck.appCheck().token(forcingRefresh: false)

// Register device with attestation
let response = try await client.registerDevice(attestationToken: appCheckToken.token)
```

### 4. Configure Publisher (Backend)

Your publisher must be configured for attestation on the backend:

```bash
curl -X PATCH https://api.signedshot.io/publishers/YOUR_PUBLISHER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "sandbox": false,
    "attestation_provider": "firebase_app_check",
    "attestation_bundle_id": "com.yourcompany.yourapp"
  }'
```

## Error Handling

The SDK throws `SignedShotAPIError` for API failures:

```swift
do {
    let session = try await client.createCaptureSession()
} catch SignedShotAPIError.deviceNotRegistered {
    // Need to register first
    try await client.registerDevice()
} catch SignedShotAPIError.unauthorized {
    // Token expired or invalid
    try client.clearStoredCredentials()
    try await client.registerDevice()
} catch SignedShotAPIError.sessionExpired {
    // Nonce was already used or expired
    // Create a new session
} catch SignedShotAPIError.networkError(let error) {
    // Network issue
    print("Network error: \(error)")
} catch SignedShotAPIError.httpError(let statusCode, let message) {
    // Other HTTP error
    print("HTTP \(statusCode): \(message ?? "unknown")")
}
```

Common errors:

| Error | Cause | Solution |
|-------|-------|----------|
| `deviceNotRegistered` | No device credentials | Call `registerDevice()` |
| `unauthorized` | Invalid or expired token | Clear credentials and re-register |
| `sessionExpired` | Nonce already used | Create new session |
| `invalidNonce` | Nonce format invalid | Use nonce from `createCaptureSession()` |
| `invalidPublisherId` | Publisher ID not found | Check configuration |

## Security Notes

- **Private keys never leave the device** — Generated and stored in Secure Enclave
- **Keys are hardware-bound** — Cannot be extracted or copied
- **Content hashed before any disk write** — Sign immediately after capture
- **Each capture session is single-use** — Nonces prevent replay attacks

## Next Steps

- [Quick Start](/guides/quick-start) — Verify media with Python
- [Python Validation](/guides/python-validation) — Advanced validation scenarios
- [Two-Layer Trust](/concepts/two-layer-trust) — Understand the trust model
- [Sidecar Format](/concepts/sidecar-format) — Proof structure reference
