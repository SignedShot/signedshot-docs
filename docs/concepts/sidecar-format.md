---
sidebar_position: 2
---

# Sidecar Format

:::info Work in Progress
This page is under construction.
:::

The sidecar file contains both layers of cryptographic proof in a single JSON document.

```json
{
  "version": "1.0",
  "capture_trust": {
    "jwt": "..."
  },
  "media_integrity": {
    "content_hash": "...",
    "signature": "...",
    "public_key": "...",
    "capture_id": "...",
    "captured_at": "..."
  }
}
```

Full schema reference coming soon.
