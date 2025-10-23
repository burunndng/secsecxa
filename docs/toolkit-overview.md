# CyberSec Toolkit Inventory Overview

## Extraction Summary
- The `cybersec-toolkit.zip` archive has been unpacked to `/home/engine/project/toolkit`.
- Existing root-level scaffolding remains untouched. The extracted bundle is a self-contained React/Vite workspace that mirrors the legacy AI Studio app structure.

## Runtime & Dependencies
- **Primary language:** TypeScript (React 19 front end).
- **Build tooling:** Vite 6, TypeScript 5.8, JSX/TSX Modules.
- **Runtime prerequisites:** Node.js ≥ 18 (for Vite + `@google/genai` ESM support) and npm/yarn/pnpm.
- **External APIs:** Google Gemini via the `@google/genai` SDK (requires a valid API key).
- **Environment variables:** `.env.local` ships with `GEMINI_API_KEY`, but client code currently looks for `process.env.API_KEY` — this mismatch must be resolved before the AI-backed tools will function.

## Tool & Script Inventory
| Module | Category | Purpose & Behaviour | Dependencies / Runtime Needs | Inputs | Outputs / Side Effects |
| --- | --- | --- | --- | --- | --- |
| `toolkit/App.tsx` | UI Shell | Tabbed launcher that wires all feature components together. | React 19, shared UI components. | User tab selection state. | Renders selected tool component. |
| `toolkit/components/AnalyzerTool.tsx` | Prompt / Threat Analysis | Sends user-provided text to Gemini for markdown risk analysis. | React hooks, `services/geminiService.analyzeText`, Google Gemini API key, network egress. | Free-form text blob. | Markdown-formatted analysis; logs errors to console. |
| `toolkit/components/ToTVisualizer.tsx` | AI Reasoning Simulator | Generates Tree-of-Thought nodes from Gemini and guides the user through branches. | React hooks, `services/geminiService.generateInitialNode`/`generateNextNode`, Google Gemini API key, network egress. | Seed prompt plus per-branch selections. | Structured node JSON rendered as tables; remote API calls on each branch. |
| `toolkit/components/DoTFramework.tsx` | Dynamic Thought Stream | Streams five short ideas from Gemini given a topic. | `@google/genai` instantiated client-side, API key access, network egress. | Single topic string. | Array of short sentences displayed sequentially. |
| `toolkit/components/CarmenSimulator.tsx` | Persona / Social Engineering Simulation | Keeps a persona chat session with Gemini using a heavy system prompt. | `@google/genai`, chat session API, API key, network egress; relies on browser clipboard for copy. | Conversational turns from the user. | Streaming persona responses; maintains in-memory transcript. |
| `toolkit/components/SystemPromptViewer.tsx` | Prompt Library | Surface read-only system prompts (currently only the Carmen persona) with copy-to-clipboard. | React, browser clipboard API. | None; purely reads static prompt map. | Displays prompt text; copies to clipboard. |
| `toolkit/components/CipherTool.tsx` | Cryptography Utility | Performs Vigenère cipher encrypt/decrypt with validation. | React state only. | Plaintext/ciphertext string and alphabetic key. | Transformed Vigenère text; inline validation errors. |
| `toolkit/components/EncodingTool.tsx` | Data Encoding | Converts between Base64, URL, Binary, Hex, and Morse. | Browser `btoa/atob`, React. | Text to encode/decode plus encoding type selector. | Encoded/decoded string; error message on invalid input. |
| `toolkit/components/ObfuscatorTool.tsx` | Obfuscation / Redaction | Applies a variety of glyph transformations (glitch, homoglyph, runic, stylistic fonts). | React hooks; uses Unicode manipulation. | Source text, obfuscation type, optional intensity slider. | Obfuscated string updated reactively. |
| `toolkit/components/GroundingTool.tsx` | Resilience / Wellness | Guided 5-4-3-2-1 sensory grounding exercise with step tracking. | React state. | User journal entries per step. | Final reassurance message and ability to restart. |
| `toolkit/components/MemoryPalace.tsx` | Knowledge Management | Build rooms and memories using local state for mnemonic anchoring. | React state; Date.now identifiers. | Room names and memory payloads. | Renders editable room list; no persistence. |
| `toolkit/components/SpunkEmulator.tsx` | Training / Arcade | Canvas-based reflex mini-game with particle effects; no external services. | HTML Canvas API, browser animation frame. | Mouse movement and clicks. | Visual game state; score counter updated in memory. |
| `toolkit/data/treeData.ts` | Sample Data | Static tree structure illustrating desired ToT payload shape. | Type definitions. | None. | Provides default node data (not currently wired into UI). |
| `toolkit/services/geminiService.ts` | Shared AI Service | Wrapper around `@google/genai` for analysis and node generation using JSON schemas. | Requires `@google/genai` SDK, valid `process.env.API_KEY`, network egress; assumes execution in a secure environment. | Text to analyse, current node context. | Responses from Gemini as strings/JSON, throws on error. |
| `toolkit/types.ts` | Type Definitions | Enumerations and interfaces shared across components. | TypeScript compiler. | N/A. | Provides enums for encoding/obfuscation + Tree/Node contracts. |
| `toolkit/components/common/*.tsx` | UI Controls | Styled `Button`, `Select`, `TextArea` components reused by tools. | React. | Varies per control. | Emit DOM events to parent components. |
| `toolkit/components/icons/*.tsx` | Iconography | SVG-based icon components for the cyberpunk UI. | React. | N/A. | SVG JSX fragments. |

_No compiled binaries or native executables were found in the archive._

## Missing Dependencies & Risks
- **API key handling:** Multiple components and `geminiService` expect `process.env.API_KEY`, which is undefined in the Vite browser runtime. The included `.env.local` uses `GEMINI_API_KEY`. A secure server-side proxy is required to keep the Gemini secret off the client.
- **Client-side `@google/genai` usage:** `DoTFramework` and `CarmenSimulator` instantiate the Gemini SDK directly in the browser, which will fail in production (the package is not browser-safe and exposes secrets). These calls should be routed through a backend and/or sandboxed worker.
- **Rate limiting & sandboxing:** Gemini-backed tools need throttling and abuse protection once moved server-side. No sandboxing requirements were identified for the purely front-end utilities.

## Flagged Legacy / AI Studio Assets
The following root-level files stem from the prior AI Studio UI and do not align with the cyber security toolkit direction. They should be scheduled for removal or replacement in later tickets:
- `/home/engine/project/App.tsx`
- `/home/engine/project/index.tsx`
- `/home/engine/project/index.html`
- `/home/engine/project/types.ts`
- `/home/engine/project/vite.config.ts`
- Any forthcoming `components/` directory mirrored from the legacy AI Studio project (currently only present in `toolkit/`).

These assets duplicate the extracted toolkit UI and still reference persona-focused experiences (e.g., "Cognitive Dis-Assembler").
