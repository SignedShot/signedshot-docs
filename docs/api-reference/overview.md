---
sidebar_position: 1
---

# API Reference

The SignedShot API provides cryptographic proof of authenticity for photos and videos.

## Base URL

```
https://dev-api.signedshot.io
```

:::note Staging Environment
During the MVP launch, use `dev-api.signedshot.io` for development and testing.

Production API (`api.signedshot.io`) will be available post-launch with proper account registration and authentication.
:::

## Authentication

Most endpoints require authentication via the `Authorization` header:

```
Authorization: Bearer <token>
```

| Token Type | Used For | Obtained From |
|------------|----------|---------------|
| Device Token | Capture endpoints | `POST /devices` response |

## Endpoints Overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/publishers` | Create a publisher | None |
| GET | `/publishers/{id}` | Get publisher details | None |
| PATCH | `/publishers/{id}` | Update publisher | None |
| POST | `/devices` | Register a device | Header |
| POST | `/capture/session` | Start capture session | Bearer |
| POST | `/capture/trust` | Exchange nonce for JWT | Bearer |
| POST | `/validate` | Validate media + sidecar | None |
| GET | `/.well-known/jwks.json` | Public keys for JWT verification | None |

---

## Publishers

Publishers represent apps or organizations that capture signed media.

### Create Publisher

```
POST /publishers
```

**Request Body:**

```json
{
  "name": "My Camera App",
  "sandbox": true,
  "attestation_provider": "NONE",
  "firebase_project_id": null,
  "attestation_bundle_id": null,
  "track_devices": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name (1-255 chars) |
| `sandbox` | boolean | No | Sandbox mode (default: `true`) |
| `attestation_provider` | string | No | `"NONE"` or `"FIREBASE_APP_CHECK"` |
| `firebase_project_id` | string | No | Firebase project ID (required for App Check) |
| `attestation_bundle_id` | string | No | App bundle ID for attestation |
| `track_devices` | boolean | No | Enable device tracking (default: `false`) |

**Response (201):**

```json
{
  "publisher_id": "9a5b1062-a8fe-4871-bdc1-fe54e96cbf1c",
  "name": "My Camera App",
  "sandbox": true,
  "attestation_provider": "NONE",
  "firebase_project_id": null,
  "attestation_bundle_id": null,
  "track_devices": false,
  "created_at": "2025-01-15T10:30:00Z"
}
```

### Get Publisher

```
GET /publishers/{publisher_id}
```

**Response (200):** Same as create response.

**Errors:**
- `404` — Publisher not found

### Update Publisher

```
PATCH /publishers/{publisher_id}
```

Only provided fields are updated.

**Request Body:**

```json
{
  "sandbox": false,
  "attestation_provider": "FIREBASE_APP_CHECK",
  "firebase_project_id": "my-project-123",
  "attestation_bundle_id": "io.signedshot.capture"
}
```

**Response (200):** Updated publisher object.

**Errors:**
- `404` — Publisher not found

---

## Devices

Devices are registered once per app installation and receive a token for authentication.

### Register Device

```
POST /devices
```

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `X-Publisher-ID` | Yes | Publisher UUID |
| `X-Attestation-Token` | Conditional | Firebase App Check token (required if publisher has attestation enabled) |

**Request Body:**

```json
{
  "external_id": "device-abc-123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `external_id` | string | Yes | Unique device identifier (1-255 chars) |

**Response (201):**

```json
{
  "device_id": "ea5c9bfe-6bbc-4ee2-b82d-0bcfcc185ef1",
  "publisher_id": "9a5b1062-a8fe-4871-bdc1-fe54e96cbf1c",
  "external_id": "device-abc-123",
  "device_token": "eyJhbGciOiJIUzI1NiIs...",
  "created_at": "2025-01-15T10:30:00Z"
}
```

**Important:** Store `device_token` securely. It's only returned once.

**Errors:**
- `400` — Invalid publisher ID format
- `401` — Attestation verification failed
- `404` — Publisher not found
- `409` — Device already registered
- `500` — Attestation not configured for non-sandbox publisher

---

## Capture

The capture flow creates a session before capturing and exchanges a nonce for a trust token after.

### Create Session

```
POST /capture/session
```

**Headers:**

```
Authorization: Bearer <device_token>
```

**Response (201):**

```json
{
  "capture_id": "550e8400-e29b-41d4-a716-446655440000",
  "nonce": "a1b2c3d4e5f6...",
  "expires_at": "2025-01-15T10:35:00Z"
}
```

| Field | Description |
|-------|-------------|
| `capture_id` | UUID for this capture (include in sidecar) |
| `nonce` | One-time token to exchange for trust token |
| `expires_at` | Session expiration (complete capture before this) |

**Errors:**
- `401` — Invalid or missing device token

### Exchange Trust Token

```
POST /capture/trust
```

**Headers:**

```
Authorization: Bearer <device_token>
```

**Request Body:**

```json
{
  "nonce": "a1b2c3d4e5f6..."
}
```

**Response (200):**

```json
{
  "trust_token": "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleS0xIn0..."
}
```

The `trust_token` is an ES256-signed JWT containing:

```json
{
  "iss": "https://dev-api.signedshot.io",
  "aud": "signedshot",
  "sub": "capture-service",
  "iat": 1705312200,
  "capture_id": "550e8400-e29b-41d4-a716-446655440000",
  "publisher_id": "9a5b1062-a8fe-4871-bdc1-fe54e96cbf1c",
  "device_id": "ea5c9bfe-6bbc-4ee2-b82d-0bcfcc185ef1",
  "attestation": {
    "method": "app_check",
    "app_id": "io.signedshot.capture"
  }
}
```

**Errors:**
- `400` — Invalid or expired nonce
- `401` — Invalid device token

---

## Validate

Verify a media file against its sidecar.

### Validate Media

```
POST /validate
Content-Type: multipart/form-data
```

**Form Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `media` | file | The media file (photo/video) |
| `sidecar` | file | The sidecar JSON file |

**Response (200):**

```json
{
  "valid": true,
  "version": "1.0",
  "capture_trust": {
    "signature_valid": true,
    "issuer": "https://dev-api.signedshot.io",
    "publisher_id": "9a5b1062-a8fe-4871-bdc1-fe54e96cbf1c",
    "device_id": "ea5c9bfe-6bbc-4ee2-b82d-0bcfcc185ef1",
    "capture_id": "550e8400-e29b-41d4-a716-446655440000",
    "method": "app_check",
    "app_id": "io.signedshot.capture",
    "issued_at": 1705312200,
    "key_id": "key-1"
  },
  "media_integrity": {
    "content_hash_valid": true,
    "signature_valid": true,
    "capture_id_match": true,
    "content_hash": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    "capture_id": "550e8400-e29b-41d4-a716-446655440000",
    "captured_at": "2025-01-15T10:30:00Z"
  },
  "error": null
}
```

**Errors:**
- `400` — Invalid sidecar format or validation error

---

## JWKS

Public keys for verifying JWT signatures.

### Get JWKS

```
GET /.well-known/jwks.json
```

**Response (200):**

```json
{
  "keys": [
    {
      "kty": "EC",
      "crv": "P-256",
      "kid": "key-1",
      "x": "...",
      "y": "...",
      "use": "sig",
      "alg": "ES256"
    }
  ]
}
```

Use the `kid` from the JWT header to find the matching key.

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message describing the issue"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| `400` | Bad request (invalid input) |
| `401` | Unauthorized (missing/invalid token) |
| `404` | Resource not found |
| `409` | Conflict (duplicate resource) |
| `500` | Server error |

---

## Rate Limits

The API currently has no rate limits. This may change in the future.

---

## Next Steps

- [Quick Start](/guides/quick-start) — Verify media with Python
- [iOS Integration](/guides/ios-integration) — Capture signed media
- [Sidecar Format](/concepts/sidecar-format) — Proof structure reference
