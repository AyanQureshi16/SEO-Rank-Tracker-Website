# TODO - Auth/Login behavior fix

- [x] Inspect current auth flow in Frontend `AppContext` and routing logic in `App.tsx`
- [x] Fix inconsistent axios usage by switching login/register to use the same `api` axios instance with Authorization interceptor
- [x] Update `/login` and `/register` routes to redirect when a token exists (not only when `user` is already loaded) and to avoid flicker while `loading` is true
- [ ] Run frontend build/test and quickly verify:
  - After login: visiting `/login` redirects to `/dashboard`
  - After logout: visiting `/login` shows login page
  - After refresh while logged in: user remains logged in and protected routes stay accessible

