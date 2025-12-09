# Architecture Overview (High-Level, No Brevity)

## Frontend (React + TypeScript, CRA)
- Entry: `src/index.tsx` mounts `App`.
- Routing: `react-router-dom` v6 with nested routes under `MainLayout` (`src/features/layout/components/MainLayout.tsx`) which wraps Navbar and Footer around the routed content. Routes:
  - `/` → Home (landing, links to games/gallery/tutorials)
  - `/games` → Games page (browsable sections, launches iframe viewer)
  - `/gallery` → Gallery page (grid + modal viewer)
  - `/tutorials` → Tutorials page (code editor/runner, markdown/iframe)
  - `/subscribe` → Subscription checkout (Stripe)
  - `/login`, `/register` → Auth
  - `/profile` → User profile (protected)
  - `/admin` → Admin dashboard (protected admin)
  - `/admin/control` → ESP32/WebSocket control (protected admin)
  - `/admin/users/:userId` → User details (protected admin)
- Feature-first structure under `src/features/`:
  - `features/layout`: Navbar, Footer, ErrorBoundary, MainLayout, layout styles.
  - `features/home`: Home page + styles.
  - `features/games`: Data (`games.ts`), components (GameCard, GameViewer, ServerStatus), page, styles, and a small API module (track game click).
  - `features/gallery`: Data (`galleryItems.ts`), components (GalleryItem, GalleryViewer), page, styles.
  - `features/tutorials`: Data (`tutorials.ts`), component (TutorialItem with Monaco editor/ReactMarkdown), page, styles.
  - `features/subscription`: Components (CheckoutForm using CardElement flow, SubscriptionButton/Payment using PaymentElement), page, styles, and API stub (`create-subscription`).
  - `features/auth`: Login/Register pages, API for login/register/current-user.
  - `features/profile`: UserProfile page, ProfileActions component, profile API (fetch profile, update email, change password).
  - `features/admin`: AdminDashboard (active users, visitor stats, game analytics, user management), UserDetails, AdminControlPage (WebSocket bridge), styles, admin API (active users, visitor stats, users CRUD, role updates).
  - `features/shared`: Reusable ErrorMessage, LoadingState + styles.
- Core utilities/config:
  - `core/api/client.ts`: shared axios instance (`withCredentials`, JSON headers).
  - `core/constants.ts`: roles/access level enums.
  - `utils/access.ts`: central game access rule.
  - `utils/logger.ts`: console logger helper.
  - `context/AuthContext.tsx`: fetches current user on load, stores user, sends heartbeat (via `userService`); provides `useAuth`.
  - `PrivateRoute.tsx`: role-aware route guard.
  - Global styles: `styles/shared.css` (colors/spacing variables) plus feature styles.
- Data sources:
  - Games, gallery items, tutorials are static TS files under their feature folders.
- Payments:
  - CardElement flow via `features/subscription/components/CheckoutForm`.
  - PaymentElement flow via `SubscriptionButton`/`SubscriptionPayment` (Stripe publishable key env-driven in PaymentElement flow; CardElement flow still uses a hardcoded test key—needs env).
- Access/roles:
  - `canUserAccessGame` in `utils/access.ts` gates play logic; UI shows overlay/redirect to login/subscribe accordingly.
- Admin UI:
  - Dashboard shows live active users, visitor stats (30-day aggregates), and per-game click analytics.
  - User management (role change, user details, delete).
  - AdminControlPage WebSocket bridge placeholder.

## Backend (Express + Postgres + Stripe, single `server.js`)
- Auth: Passport-local with sessions (express-session + connect-pg-simple). Routes: register, login, logout, current-user, protected/role-protected examples.
- Subscription: Stripe customer/subscription creation (`/api/create-subscription`), webhook handling (update roles/status), profile email sync with Stripe, password change.
- Analytics: heartbeats (auth/anon), active users listing, visitor stats aggregate, game click tracking. Cron every minute to store visitor analytics.
- Admin: list users, update role, get user details, delete user. Active users/visitor stats endpoints.
- Games/services: `/api/game-status` proxy to external server status; `/run-code` JDoodle proxy for tutorial code execution.
- WebSocket: bridge for ESP32 control (no auth yet).
- DB: Pool in `config/database.ts` (client-side unused; server uses Pool in server.js). SQL queries are parameterized.
- CORS/session: session cookies set with `sameSite: 'none'`, secure in prod, domain set for prod; CORS allows localhost and prod origins.

## Tests (to implement)
- Unit/UI: Jest + RTL for GameCard access logic, PrivateRoute redirects, GalleryViewer navigation, ProfileActions forms.
- API: Jest + supertest for auth, subscription (Stripe mocked), analytics, game tracking validation.
- E2E: Playwright/Cypress for login/register → play game → profile; admin dashboard; subscription happy path (mock payments).

## Observability & Logging
- Console-based logger (`utils/logger.ts`). ErrorBoundary for UI errors. Backend logs to console; no centralized logger yet.
- Health: `/api/health/db` for DB connectivity.

## Known gaps / next improvements
- Move remaining shared utilities to `features/shared` (if any).
- Replace hardcoded Stripe publishable key in CardElement flow with env (`REACT_APP_STRIPE_PUBLIC_KEY`).
- Requires updating device environments variables in digital ocean. ^
- Finish API module adoption in components (admin/profile currently mixing apiClient and axios/fetch).
- Add request validation + error middleware on the server; split server into routes/services/config/middlewares.
- Normalize routes to lowercase consistently (`/gallery`, `/tutorials` already updated).
- Add tests as outlined above. 

