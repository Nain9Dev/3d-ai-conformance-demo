# Security Policy

## Reporting Security Issues

This project forms part of the personal engineering portfolio of **Aitor Nain Mendoza Vallejo (`NainDev`)**.

If you discover a security vulnerability or unexpected attack vector (such as path traversal via malicious archives, buffer overflow via corrupted glTF binary buffers, or denial of service via oversized mesh allocations), please report it responsibly:

- **Email:** `contact@naindev.com`
- **Response window:** Within 48 business hours.

## Boundaries & Constraints

1. **Synthetic Data Only:** This repository processes only synthetic or open-source 3D assets. Under no circumstances should confidential, proprietary, or personal data be uploaded or committed.
2. **File Processing Safeguards:** Uploaded 3D models (`.glb`) are processed via temporary descriptors with bounded byte limits (max 50 MB) and strict MIME type verification.
3. **Local Compute:** In-browser and local machine operations operate with zero billable cloud activations.
