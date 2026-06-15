# Security Policy

## 01 / Supported Versions

The table below outlines the versions of Vantage AI that actively receive security updates and patches:

| Version | Supported |
| ------- | --------- |
| v1.x    | Yes       |
| < v1.0  | No        |

---

## 02 / Reporting a Vulnerability

We take the security of Vantage AI very seriously. If you discover a potential vulnerability or security flaw (especially regarding API key transmission or Request Forgery), please **do not open a public issue or pull request**.

Instead, report vulnerabilities privately by emailing the developer at:
**[dasanuvab38@gmail.com](mailto:dasanuvab38@gmail.com)**

Please include:
- A detailed description of the vulnerability.
- Step-by-step instructions (or a proof-of-concept script) to reproduce the issue.
- The potential impact of the vulnerability.

We will acknowledge your report within 48 hours and work to release a patch as quickly as possible.

---

## 03 / Local-First Credentials Model

All user configurations and credentials respect a strict **local-first privacy architecture**:
- **Browser-Only Storage**: All API connection keys (Google Gemini, OpenAI, Anthropic, OpenRouter, SerpApi) are saved directly on the client side using browser `localStorage` or secure cookies.
- **No Telemetry Mirroring**: Credentials are never sent to or mirrored on any central Vantage AI server or telemetry database. They travel only to the corresponding target provider endpoints during generation runs.

---

## 04 / Request Forgery & Host Safeguards

To prevent Server-Side Request Forgery (SSRF) and malicious redirects inside private local networks:
- **SSRF Whitelisting**: Outbound connections to custom OpenAI gateways or local servers (Ollama, LM Studio) are parsed and checked against strict DNS/host whitelists.
- **Metadata Restrictions**: Connections attempting to resolve standard cloud metadata endpoints (e.g. `169.254.169.254`, `metadata.google.internal`) are automatically rejected before client initialization.
