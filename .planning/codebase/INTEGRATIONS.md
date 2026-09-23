---
last_mapped_commit: 5bb8919024dcaaee469701a9086df5dc814ba501
last_mapped_at: 2026-09-23
---
# External Integrations

**Analysis Date:** 2026-09-23

## APIs & External Services

**Google Fonts:**

- Service: Google Fonts (`https://fonts.googleapis.com`)
- What it's used for: Typeface delivery for typography (non-system fonts)
- Fonts loaded:
  - `Fraunces` (homepage, Pizza Slices, RSA Examplifier)
  - `Source Sans 3` (homepage, Pizza Slices, RSA Examplifier)
  - `JetBrains Mono` (homepage, Pizza Slices, RSA Examplifier)
  - `Mountains of Christmas` (Factor Tree tool — seasonal)
  - `Poppins` (Factor Tree, Completing-the-Square tools)
- Connection: `<link rel="preconnect">` and `<link rel="stylesheet">` tags
- Auth: None (public CDN)
- Fallback: System fonts via font stack (`Georgia`, `monospace`, `sans-serif`)

**No Other External APIs:**

- No analytics, tracking, or observability integrations
- No payment processors
- No authentication providers (OAuth, SAML, etc.)
- No real-time communication (WebSocket, Server-Sent Events)
- No email, SMS, or notification services

## Data Storage

**No External Databases:**

- All data is computed at runtime; no persistent backend storage
- No cloud databases (Firebase, Supabase, MongoDB Atlas, etc.)

**Client-side Storage Only:**

- `localStorage` (browser-persisted key-value store)
  - `site-theme`: Day/night mode preference (string: `"day"` or `"night"`)
  - `congruence-wheel`: Pizza Slices tool state (JSON: `{N: number, depth: number}`)
- `sessionStorage`: Not used
- `IndexedDB`: Not used
- `Cookies`: Not used

**No File Upload/Download:**

- All tools generate output only in the browser DOM (SVG, HTML)
- No download functionality
- No file input fields

## Authentication & Identity

**Auth Provider:**

- None. All tools are publicly accessible, no user authentication.

**Implementation:**

- Completely anonymous, client-side only
- No login, registration, or session management
- No per-user state or accounts

## Monitoring & Observability

**Error Tracking:**

- None. No external error tracking service (Sentry, Rollbar, etc.)
- Browser console errors only

**Logs:**

- None. No centralized logging.
- Developers use browser DevTools console

**Analytics:**

- None. No Google Analytics, Mixpanel, Amplitude, or similar.
- No tracking of user interactions or page visits

## CI/CD & Deployment

**Hosting:**

- Static file hosting (GitHub Pages, Netlify, Vercel, or any HTTP server)
- No backend server, no serverless functions

**CI Pipeline:**

- None. No automated build, test, or deployment pipeline.
- Manual deployment (push `.html` files to hosting provider)

**Container/Orchestration:**

- Not applicable; no containerization

## Environment Configuration

**Required Environment Variables:**

- None. All configuration is via CSS custom properties or embedded in HTML.

**Development Server:**

- Optional: Simple HTTP server for development (Python `http.server`, Node.js `http-server`, etc.)
- Direct `file://` URLs work for most browsers (CSP and CORS not in play)

**Secrets Location:**

- No secrets are used or stored (public, open-source codebase)

## Webhooks & Callbacks

**Incoming Webhooks:**

- None

**Outgoing Webhooks:**

- None

## Third-Party Libraries

**None.** The codebase uses only:

- Browser built-in APIs (DOM, SVG, localStorage)
- Native JavaScript `BigInt` type (for RSA tool)
- No npm packages, CDN dependencies (beyond Google Fonts), or external JavaScript files

**Example dependency absence:**

- No charting library (chart.js, D3, Recharts, etc.)
- No math library (math.js, Decimal.js, etc.)
- No cryptography library (TweetNaCl.js, libsodium.js, etc.)
- No animation library (Anime.js, Framer Motion, etc.)
- All algorithms implemented from scratch in vanilla JavaScript

## Security Posture

**No Security Configurations Needed:**

- No Content Security Policy (CSP) headers
- No CORS configuration (no cross-origin requests beyond Google Fonts)
- No HTTPS enforcement (works over `http://` or `file://`)
- No HTTPS certificate management

**Code Transparency:**

- All source code is readable client-side (vanilla JavaScript in `<script>` tags)
- No code obfuscation or minification
- Educational intent: code is meant to be read and understood

---

*Integration audit: 2026-09-23*
