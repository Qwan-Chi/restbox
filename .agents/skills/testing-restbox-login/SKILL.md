---
name: testing-restbox-login
description: Run restbox locally and test the login/OAuth flow and AI-provider settings end-to-end. Use when verifying changes to LoginScreen, OAuth wiring (Google/Yandex), the guest flow, or AI provider/model config.
---

# Testing restbox (login / OAuth / AI providers)

Restbox is a Vite + React + TypeScript REST client. State (auth, history, API keys) lives in the browser's localStorage/IndexedDB. There is no backend to run.

## Run locally

```bash
npm install
npm run dev   # serves at http://localhost:5173/restbox/  (note the /restbox/ base path)
```

Verification commands (all should pass; CI runs the same set):
```bash
npm run lint        # ESLint flat config
npm run typecheck   # tsc -b --noEmit
npm run test        # vitest (unit tests)
npm run build       # tsc + vite build
```

## Enabling OAuth login buttons for testing

The Google / Yandex buttons on the login screen only render when the matching client ID is set at build time. `isGoogleConfigured()` / `isYandexConfigured()` check `import.meta.env.VITE_GOOGLE_CLIENT_ID` / `VITE_YANDEX_CLIENT_ID`. With neither set, only the guest button shows.

To make the buttons appear locally, create a gitignored `.env` (it's covered by `.gitignore`) before `npm run dev`:
```
VITE_GOOGLE_CLIENT_ID=1234567890-testdemoclientid.apps.googleusercontent.com
VITE_YANDEX_CLIENT_ID=test_yandex_client_id_demo
```
Dummy values are enough to render the buttons and to prove the Yandex redirect. They are NOT enough to complete a real sign-in (Google needs a registered client_id + origin; the Google button draws but real auth fails).

## What to verify

- **OAuth buttons render**: login card shows the Google button, a red «Войти через Яндекс» button, an «или» divider, and «Продолжить как гость».
- **Yandex redirect (deterministic OAuth proof)**: clicking the Yandex button navigates to `https://oauth.yandex.ru/authorize?response_type=token&client_id=<id>&redirect_uri=<origin>/restbox/&force_confirm=true` (you'll land on `passport.yandex.ru` with that URL as `retpath`). This proves `startYandexLogin` in `services/yandexAuth.ts` is wired up.
- **Guest provider**: click «Продолжить как гость» → main 3-panel UI loads. The user menu (bottom-left of the Sidebar) should show name «Гость» with a «Гость» provider label and a 👤 icon — NOT "Google". The guest user uses `provider: 'guest'` (`types/index.ts`).
- To reset auth between runs, clear localStorage key `restbox:auth` (or use the menu's «Выйти»).

## Known UI-testing limitation

- **AI provider model dropdown**: in the Rusty ⚙ settings (`ApiKeyModal`), the model `<select>` only lists models fetched from the provider API with a *valid* key. With no/invalid key the list is empty, so config-only changes like DeepSeek model names (`services/providers.ts`) can't be confirmed through the dropdown without a real key. Verify those via the diff/unit tests instead, or supply a real provider key.

## Devin Secrets Needed

- None required for the login/guest/OAuth-redirect tests (dummy client IDs suffice).
- A real `DEEPSEEK_API_KEY` (or other provider key) is only needed to verify the AI model dropdown / live model fetching.
