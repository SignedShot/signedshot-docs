---
sidebar_position: 1
---

# SignedShot — Cryptographic proof at capture

**SignedShot** is an open-source protocol that provides cryptographic proof of media authenticity at the moment of capture. The goal is to embed verifiable signatures into photos and videos, so technical professionals can cryptographically verify they're unaltered.

## The Problem

Today, anyone can edit photos or videos in seconds — making it impossible to know what's authentic. Digital media is trivially manipulated; cryptographic verification is needed.

## Our Solution

SignedShot solves this by using **Secure Enclave**, **cryptographic signatures**, and **device-based attestation** to embed mathematically verifiable proof of authenticity into every photo or video you capture.

Whether you're a security engineer, cryptographer, or developer building trust systems, SignedShot provides the cryptographic foundations to **verify what you capture**.

## Core Features

- **Direct proof at capture**: Authenticity is cryptographically embedded at recording time, not retroactively guessed
- **Open-source protocol**: Anyone can inspect, verify, or contribute — transparency first
- **Two-layer model**: Clear separation of media integrity and capture trust, making the protocol flexible and evolvable
- **Secure Enclave P-256 signing**: Hardware-backed cryptographic signatures

Ready to learn more? Check out our documentation:

- [How it Works](/how-it-works) - Technical implementation details
- [Demo](/demo) - See SignedShot in action