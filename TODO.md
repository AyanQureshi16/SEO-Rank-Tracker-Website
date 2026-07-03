# TODO - Fix Backend Not Running

- [ ] Step 1: Identify runtime error causes (syntax/import issues in backend controllers/models).
- [ ] Step 2: Patch `Backend/controllers/rankControllers.js` (fix wrong exports/names, typos like `res.staus`, missing variable `tracking`, and improper logic blocks).
- [ ] Step 3: Patch `Backend/models/keywordTracking.js` (fix schema typos: `trinm`, `currenranking` mismatch, unique index consistency).
- [ ] Step 4: Ensure correct exports/imports in `keywordTrackingService.js` usage (use `rankTracker` or correct function name).
- [ ] Step 5: Run backend locally to confirm server boots (node server.js) and check console logs.

