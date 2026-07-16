# SESHN Project Status

Last updated: 2026-07-16

> Update this file after material development sessions. Keep it focused on the
> present state; durable product direction belongs in `PROJECT.md`.

## Current objective

Finish the prototype frontend and design the session-sharing cards, while
validating the complete flow from recording a session through reviewing and
sharing it.

This web-based prototype is an interim development environment. The final
product must be a downloadable mobile app released for both iOS and Android,
with equal consideration given to both platforms.

After the frontend and share-card experience are complete, the next objective
is backend development.

## Current state

### Completed

- Public waitlist landing page at `/`.
- Prototype profile creation at `/signin`.
- Dashboard with session totals, total duration, average focus, streak, and
  recent sessions.
- Study-session recording with post-session details.
- Individual session detail pages.
- Browser-local persistence for profiles and sessions.
- Optional focus estimation using orientation and page-visibility signals.
- Photo upload/capture and canvas-based share-card generation.
- Multiple movable, scalable, and rotatable share overlay designs.
- Prototype-route access protection through a token and cookie.
- Web app manifest and icon assets.

### In progress

- Product and interaction refinement based on hands-on mobile testing.
- Share studio usability and design exploration.

### Not started / planned

- Select and implement the production mobile architecture for iOS and Android.
- Package, test, and prepare the app for distribution on both mobile platforms.
- Automated tests for session creation, statistics, and core user flows.
- Production authentication.
- Server-backed session persistence and cross-device sync.
- Server-side session mutations through route handlers or server actions.
- Production privacy, observability, and recovery behavior.

## Next actions

1. Finish and refine the frontend, with particular focus on the session-sharing
   card designs and interaction flow.
2. Test the complete prototype flow on real iOS and Android devices and record specific UX
   problems.
3. Define explicit acceptance criteria for considering the prototype frontend
   complete.
4. Add tests around the pure calculations in `src/lib/seshnStore.js`.
5. Add an end-to-end check for creating a session and seeing it on the
   dashboard.
6. Begin backend planning after the frontend milestone is complete, without
   treating the current web prototype as the final delivery architecture.

## Known constraints and risks

- The current Next.js web app is prototype scaffolding and does not yet satisfy
  the downloadable mobile-app release requirement.
- Mobile architecture decisions must account for equivalent iOS and Android
  behavior, permissions, sensors, sharing, and app-store distribution.
- Profile and session data live only in the current browser's `localStorage`;
  clearing site data loses it and there is no cross-device sync.
- Motion/orientation access varies by browser, permission state, device, and
  secure-context support.
- Page visibility is only a proxy for attention and should not be presented as
  a definitive measure of focus.
- The application currently has no automated test command in `package.json`.
- The prototype access cookie is a preview gate, not user authentication.
- Canvas export and native file sharing need testing across target mobile
  browsers.

## Relevant files

- `src/app/page.js` — public waitlist page.
- `src/app/components/SessionWorkspace.js` — session-recording experience.
- `src/app/components/DashboardClient.js` — dashboard behavior.
- `src/app/components/ShareCardClient.js` — share studio and canvas rendering.
- `src/lib/seshnStore.js` — local persistence, formatting, focus, and stats.
- `src/proxy.js` — prototype-route access gate.
- `README.md` — setup, routes, and manual testing notes.
- `PROJECT.md` — durable product vision and priorities.

## Verification baseline

For material code changes, use the checks relevant to the change:

```powershell
npm.cmd run lint
npm.cmd run build
```

Also manually test affected mobile interactions when changing session sensors,
pointer gestures, photo capture, canvas output, or native sharing.

## Session handoff

### Most recent work

- Created durable project-direction and status documents for continuity across
  development sessions.
- Refined the product definition and target audience in `PROJECT.md`.
- Confirmed that the immediate objective is to finish the frontend and design
  the session-sharing cards; backend development follows this milestone.
- Confirmed that the final product is a downloadable mobile app, with iOS and
  Android treated as equal target platforms.
- Clarified that the Next.js app, public waitlist, and local development build
  are prototype scaffolding rather than the intended final product structure.

### Files changed

- `PROJECT.md`
- `docs/PROJECT_STATUS.md`

### Important discoveries

- The implemented product surface is broader than the public waitlist page;
  the functional prototype begins at `/dashboard`.
- The current persistence and identity model is intentionally browser-local.
- No automated test script is currently defined.
- Public release requires downloadable iOS and Android versions with equivalent
  product consideration and feature coverage.
- Production architecture has not yet been selected and must account for
  mobile sensors, permissions, sharing, and app-store distribution.

### Checks run

- Reviewed `PROJECT.md`, `docs/PROJECT_STATUS.md`, the current application
  surface, and available package scripts.
- Documentation-only changes; lint and build checks were not required.

### Checks still needed

- Define what specific screens, interactions, and quality criteria constitute a
  finished frontend.
- Decide how the final mobile app will be implemented before backend contracts
  become difficult to change.
- Test photo capture, device orientation, canvas export, and native sharing on
  representative iOS and Android devices.
