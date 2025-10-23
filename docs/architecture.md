# CyberSec Toolkit Platform Architecture Plan

## Stack Selection
- **Frontend:** React 19 + TypeScript, built with Vite. Rationale: matches the extracted toolkit source and keeps the existing component library reusable while we refocus the UI on security tooling.
- **Backend:** FastAPI (Python 3.12) with Pydantic models. Chosen for its async support, solid JSON schema tooling, and ease of interfacing with security libraries plus the Google Gemini REST API.
- **Realtime / Messaging:** FastAPI WebSocket endpoints (or Server-Sent Events where streaming is one-way) backed by Redis Pub/Sub for scalability.
- **Data Layer:** PostgreSQL 16 for durable storage (analysis transcripts, user projects) and Redis for caching rate-limit counters or transient state.
- **Async Jobs:** Dramatiq/RQ or Celery workers (Python) for long-running AI analyses so the HTTP layer can remain responsive.
- **CI/CD & Packaging:** Docker images per service; compose for local, Terraform/k8s for higher environments.

## High-Level Service Boundaries
1. **UI Client (React/Vite):**
   - Hosts the tabbed toolkit shell and individual tool views.
   - Maintains only ephemeral UI state; all sensitive processing is brokered through the API.
   - Communicates over HTTPS + WSS to the API service.
2. **CyberSec API (FastAPI):**
   - REST endpoints for synchronous utilities (cipher, encoding, obfuscation previews).
   - WebSocket/SSE endpoints for streaming Gemini-backed features (Analyzer, ToT, DoT, Persona simulator).
   - Houses integrations with Google Gemini, enforcing input validation, logging, rate limits, and sandbox policies.
   - Exposes authentication endpoints (login, token refresh) and enforces RBAC/ABAC per route.
3. **Background Workers:**
   - Consume jobs from Redis/AMQP to perform long-running Gemini calls or batch analyses.
   - Push incremental progress events back to clients via Redis channels consumed by FastAPI.
4. **Storage:**
   - PostgreSQL schemas for users, saved analyses, tree-of-thought sessions, prompt libraries, audit logs.
   - S3-compatible object storage for attachments if file uploads are added later.
5. **Telemetry & Security:**
   - Centralised logging (OpenTelemetry) shipped to ELK/Grafana.
   - Tracing spans around every external API invocation.
   - Web Application Firewall (e.g., Cloudflare) to shield the API.

## Data Flow Overview
1. **User Interaction:** React client sends HTTPS requests (or opens WebSockets) to the FastAPI gateway with JWT/OIDC access tokens.
2. **Validation & AuthZ:** FastAPI validates schemas with Pydantic, checks RBAC scopes, and enforces per-user rate limits (Redis counters).
3. **Processing:**
   - Lightweight utilities (cipher, encoding, obfuscation) execute synchronously in-process.
   - Gemini-backed tools dispatch requests through a dedicated `GeminiService` that proxies to Google, handles retries, and scrubs sensitive content.
   - Long-running requests enqueue worker jobs; workers stream progress back via Redis channels that the API relays to WebSocket clients.
4. **Persistence:** Results and transcripts are persisted in PostgreSQL; transient states (active ToT sessions, persona chat context) live in Redis with TTLs.
5. **Response:** API returns JSON payloads or streams incremental events, which the React app renders in the respective tool panels.

## Authentication & Authorization
- **Identity Provider:** Recommend OIDC (Auth0/Azure AD/Okta) to avoid custom credential storage.
- **Token Model:** Short-lived access tokens (JWT) + refresh tokens. Store only in secure HTTP-only cookies.
- **Role Scopes:**
  - `analyst`: access to analysis, encoding, crypto utilities.
  - `red_team`: access to obfuscation labs and persona simulators.
  - `admin`: manage prompt libraries, view audit logs.
- **Row-Level Controls:** Apply per-tenant filters in SQL for saved artefacts.
- **Audit Logging:** Capture every Gemini call with hashed user context for compliance.

## Real-Time Channel Strategy
- **Primary:** FastAPI WebSocket endpoints using Redis Pub/Sub to fan out updates for Tree-of-Thought navigation, persona chat, and streaming analyses.
- **Fallback:** Server-Sent Events for environments where WebSockets are blocked.
- **Client Handling:** React Query / Zustand store to consume streams and ensure reconnection with exponential backoff.

## Alignment with Toolkit Artifacts
- The existing TypeScript components can be refactored to call the FastAPI endpoints instead of bundling `@google/genai` in the browser.
- `services/geminiService.ts` will move server-side; the front-end keeps only TypeScript interfaces for response types.
- Canvas-based or offline utilities (e.g., `SpunkEmulator`) remain purely client-side, gated behind feature flags if necessary.

## Observations & Immediate Follow-Ups
- Normalize environment variables (`GEMINI_API_KEY` vs `API_KEY`) and load them exclusively on the backend.
- Implement input sanitisation on all text sent to Gemini to prevent prompt injection echoes.
- Plan unit/integration tests: Jest/Testing Library for React, PyTest for FastAPI, contract tests for Gemini proxy.
- Set up infrastructure for API key rotation and secret storage (e.g., HashiCorp Vault or AWS Secrets Manager).

## Flagged Legacy Assets
The current root files (`App.tsx`, `index.tsx`, `index.html`, `types.ts`, `vite.config.ts`) still reflect the AI Studio persona experience. As we migrate to the dedicated `toolkit/` workspace and backend architecture above, schedule their removal or replacement so future tickets operate solely on the hardened security-focused stack.
