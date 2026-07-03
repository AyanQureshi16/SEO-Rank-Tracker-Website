# Backend run debugging notes

Observed likely causes (from static code review):
- `Backend/controllers/rankControllers.js` contains multiple syntax/logic errors that will crash Node at startup or on first route hit:
  - Uses `keywordTracking` import that is unlikely to exist (service exports are different: `rankTracker` and `generateSeoReport` etc).
  - Calls `res.staus(...)` (typo).
  - References `tracking` variable that isn’t defined in `getKeyword`.
  - `toggleTracking` has `tracking.active =!tracking.active;` inside an unreachable block due to `return`.
- `Backend/models/keywordTracking.js` has schema typos:
  - `trinm` option likely breaks schema validation (should be `trim`).
  - Field names `currenranking` don’t match controller usage (`currenranking` vs `currentRanking` etc.).
- `Backend/routes/rankRoutes.js` imports controllers by names that don’t exist (`addKeyword` vs `addKeywords`, etc.).

Next steps:
- Patch controllers + routes + model schema.
- Start backend with `npm start` and ensure it prints `Server running on port ...`.

