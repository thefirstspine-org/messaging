# Copilot instructions for contributors

Purpose
- Central realtime messaging broker: HTTP API can send messages to connected websocket clients by subject and user id.

Quick start
- Install: `npm ci`
- Dev run: `npm run start`
- Build prod: `npm run build && node dist/main.js`

Key files
- src/main.ts — app bootstrap, WsAdapter, global pipes/filters
- src/app.module.ts — registers controllers/providers
- src/api/api.controller.ts — POST /api endpoint (SendMessageDto)
- src/messaging/messaging.gateway.ts — websocket gateway, events: `login`, `subscribeToSubject`, `unsubscribeToSubject`, `ping`
- src/messaging/messaging.service.ts — in-memory user registry and message delivery logic

HTTP API
- POST /api
  - Body: { to: '*' | number[], subject: string, message: object }
  - Response: { status: boolean, original: object }
  - Note: CertificateGuard is present but currently commented out in controller (enable in prod).

WebSocket protocol
- Connect to server ws://<host> (server uses Nest's WsAdapter).
- Events:
  - `login` — payload { jwt } → server validates via AuthService.me(jwt) and registers user. Server replies `{ logged: <userId> }`.
  - `subscribeToSubject` / `unsubscribeToSubject` — payload { subject } → subscribe/unsubscribe; server replies `{ subscribed: <subject> }` or `{ unsubscribed: <subject> }`.
  - `ping` — server replies `{ ping: 'pong' }`.
- Messages delivered to clients are JSON: { to, subject, message }
- MessagingService sends only to users that are both targeted (or `*`) and subscribed to the subject.

Auth & security
- Uses @thefirstspine/auth-nest for JWT validation in gateway.
- API-level CertificateGuard is available — enable it for production.

Extending & contributing
- Keep SendMessageDto validation in sync when changing API shape.
- Use LogsService for structured logs (already injected).
- MessagingService is in-memory; for clustering or persistence, replace storage with a shared store (Redis/pubsub) and ensure message de-dup and delivery semantics.
- Add tests under `test/` and run `npm run test` / `npm run test:e2e`.

Notes
- Configuration: dotenv is used; see the Ansible playbook and thefirstspine/configurator references in README to generate local .env
- Socket client must send `login` with JWT before expecting messages targeted to its user id.

Example API request
- curl -X POST https://messaging.example.com/api -H 'Content-Type: application/json' -d '{"to":"*","subject":"game:update","message":{"action":"move","x":1,"y":2}}'

If anything in this file is unclear or needs more detail, ask and guidance will be added.