---
sidebar_position: 1
---

# Quick Start

:::info Work in Progress
This page is under construction.
:::

Get up and running with SignedShot in 5 minutes.

## Verify a Photo

```bash
pip install signedshot
```

```python
import signedshot

result = signedshot.validate_files("photo.sidecar.json", "photo.jpg")
print(result.valid)
```

## Capture a Photo (iOS)

See the [iOS Integration](/guides/ios-integration) guide.
