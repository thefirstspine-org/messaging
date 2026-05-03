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
- src/messaging/messaging.service.ts — fast in-memory messaging core (Map/Set based) — handles multi-device users, subscriptions and efficient delivery

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

Performance & recent optimizations
- The messaging core was rewritten to use Map and Set structures (src/messaging/messaging.service.ts). Benefits:
  - O(1) lookups for clients and subject subscribers instead of scanning arrays
  - Supports multiple client connections per user (multi-device)
  - Faster delivery path: recipients computed by intersecting subscriber sets with target user list
  - Automatic client cleanup on send errors to prevent leaks

Recommended scaling steps
- For multi-process or multi-node setups, use a shared adapter (Redis pub/sub) so messages reach clients on other processes. Example: socket.io-redis or Nest's Redis adapter.
- Use a process manager (PM2) or Node clustering with sticky sessions if keeping in-memory connections.
- Prefer a socket adapter (Redis) + horizontal scaling rather than keeping single-process sockets.
- Add metrics (Prometheus) and health endpoints; monitor connections, message rate, latency, and memory.
- Run load tests (autocannon/wrk) to measure throughput and latency: `npx autocannon -c 1000 -d 30 ws://localhost:3000` and adjust pooling/GC accordingly.

Developer notes
- Changed file: src/messaging/messaging.service.ts — review the Map/Set implementation when modifying subscription logic.
- To add a Redis adapter and clustering, implement a pub/sub bridge: publish API messages to Redis channel; each node subscribes and sends to its local clients.
- Add tests around subscribe/unsubscribe, multi-device delivery, and robust removal of disconnected clients.

If you want, add a PR skeleton that wires a Redis adapter and example clustering configuration; can implement that next.