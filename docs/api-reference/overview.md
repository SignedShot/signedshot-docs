---
sidebar_position: 1
---

# API Reference

:::info Work in Progress
This page is under construction.
:::

## Base URL

```
https://api.signedshot.io
```

## Authentication

Most endpoints require a publisher token or device token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/publishers` | Register a publisher |
| POST | `/devices` | Register a device |
| POST | `/capture/session` | Start a capture session |
| POST | `/capture/trust` | Exchange nonce for trust token |
| POST | `/validate` | Validate media + sidecar |
| GET | `/.well-known/jwks.json` | Public keys for JWT verification |

Full endpoint documentation coming soon.
