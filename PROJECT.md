# SESHN Project Brief

> This document is the durable source of truth for the product direction.
> Edit the sections marked **Owner input needed** as the vision becomes clearer.

## Product vision

SESHN is a study tracking and sharing app built around the idea of helping
people "study like an athlete": record deliberate study sessions, understand
their focus and consistency, and share their progress visually. SESHN is going
to be a sleek, modern mobile app that allows students who are proud of their
studies to share their statistics on social platforms.

The final product is a downloadable mobile app. iOS and Android are equally
important target platforms and should be considered together in product,
design, testing, and technical decisions. The product is not ready for public
release until it can be distributed as a mobile app on both platforms.

## Target users

- Primary: Univeristy and sixth form/college students who are motivated by streaks, measurable progress, and sharing accomplishment to further their studies and accomplish greater things. 
- Secondary: Hobbyists who want to document and share their journey working on a personal project.



## Core user journey

1. A user creates a lightweight profile.
2. They set a study target and record a session.
3. SESHN records duration and, when available, browser-based focus signals.
The end goal should have measured device orientation, as SESHN should be a downloadable app.
4. The user reviews session details and aggregate progress.
5. The user can place session statistics over a photo and share the result.

## Current product surface

The current web application is prototype scaffolding, not the intended final
product structure. The public waitlist and locally run development build exist
only to support early design, implementation, and validation before the mobile
app release.

- `/` is the public waitlist landing page.
- `/signin` creates a prototype profile in browser storage.
- `/dashboard` displays totals, focus average, streak, and recent sessions.
- `/sessions/new` records a study session and its details.
- `/sessions/[id]` displays a saved session.
- `/share/[id]` creates a downloadable or shareable photo composition.

## Product principles

- Keep starting and completing a study session fast.
- Make progress understandable without overwhelming the user with metrics.
- Treat focus measurements as helpful estimates, not objective judgments.
- Design mobile-first because session recording and photo sharing are likely
  to happen on a phone. 
- Preserve user trust by explaining what device signals are collected and why.
- The final product must be downloadable through the appropriate iOS and
  Android app stores, with neither platform treated as secondary.


## Current technical direction

- Next.js 16 App Router with React 19.
- JavaScript source files.
- Tailwind CSS utilities for styling.
- Browser `localStorage` for prototype profiles and sessions.
- Browser orientation and visibility signals for optional focus scoring.
- Canvas-based generation of 1080 x 1920 share images.
- Token-and-cookie protection for non-public prototype routes.

These technologies describe the current prototype and do not commit the final
mobile app to a web-only architecture. The production architecture must support
downloadable iOS and Android apps with equivalent feature coverage.

The locally installed documentation in `node_modules/next/dist/docs/` is the
authority for Next.js behavior and conventions in this repository.

## Near-term priorities

1. Create an attractive and easy to use user interface.
2. Validate the core session-recording and sharing experience with users.
3. Add automated coverage for session creation and dashboard statistics.
4. Decide on authentication and persistent data storage.
5. Replace prototype-only local profile and session storage when appropriate.
6. Add production-ready privacy, error handling, and data recovery behavior.


## Non-goals for the current prototype

- Committing to a production authentication provider.
- Committing to a production database.
- Treating browser focus signals as medically or scientifically precise.
- Expanding into a broad learning-management platform before validating the
  core study-session loop.
- Space for advertisements.



## Success criteria

- A user can start, complete, and review a session without assistance.
- A user understands how the focus score was produced.
- A user can create and share a session image successfully on a phone.
- Test users return to record sessions over multiple days.
- 10% of active users join the premium feature. 

## Open product questions

- Who is the first narrowly defined user group?
- What is the single most important behavior SESHN should encourage?
- Is social sharing central to retention or primarily an acquisition feature?
- How should focus be described when device sensors are unavailable?
- Which information must sync across devices in the first production release?
- What privacy promises should apply to session and sensor data?
