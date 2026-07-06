# SESHN

SESHN is a study tracking and sharing app. The root route (`/`) is the
completed waitlist page. The product prototype now starts at `/dashboard`.

## Getting Started

First, run the development server:

```bash
npm.cmd run dev
```

Open:

- Waitlist: [http://localhost:3000](http://localhost:3000)
- App prototype: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## Current App Surface

- `/signin` stores a prototype local profile in browser storage.
- `/dashboard` shows study totals, streak, focus average, recent sessions, and a share-photo link.
- `/sessions/new` lets you set targets, record a study session, and enter details only after completion.
- `/sessions/[id]` shows the saved session detail.
- `/share/[id]` lets you take or upload a photo, apply a share design overlay, and save the composed image.

The app currently persists data to `localStorage` so you can develop the UX
without committing to auth or database choices yet.

Focus scoring is optional and uses browser-accessible signals. Device
orientation is used when the browser grants permission; otherwise, page
visibility can act as a fallback proxy for phone-on/app-active time. Most phone
browsers require HTTPS for motion sensors, so focus tracking may stay disabled
when testing over a local `http://192.168...` address.

## Protect The Prototype

The landing page at `/` is public. Prototype routes are gated by `src/proxy.js`:

- `/signin`
- `/dashboard`
- `/sessions/*`
- `/share/*`

Set this environment variable in Vercel:

```text
PROTOTYPE_ACCESS_TOKEN=replace-with-a-long-random-secret
```

Then open the prototype once with:

```text
https://YOUR_DOMAIN/dashboard?access=replace-with-a-long-random-secret
```

That sets a 30-day private cookie on your device. Public visitors who open
prototype routes without the token are redirected to `/`.

## Test On A Phone

Run Next on your network:

```bash
npm.cmd run dev -- -H 0.0.0.0 -p 3000
```

Find your computer's IPv4 address:

```powershell
ipconfig
```

On your phone, connect to the same Wi-Fi and open:

```text
http://YOUR_IPV4_ADDRESS:3000/dashboard
```

## Test On Android Emulator

After starting the dev server, open Chrome in the emulator:

```text
http://10.0.2.2:3000/dashboard
```

If that does not load, use your computer's IPv4 address instead.

## Next Engineering Steps

1. Replace local profile storage with real auth.
2. Replace `localStorage` session persistence with a database.
3. Add route handlers or server actions for session mutations.
4. Generate PNG app icons for the manifest.
5. Add tests around the session creation and dashboard stats flow.
