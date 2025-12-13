# FILE: .github/README.md (FULL REPLACEMENT — ACTIONS LOCK)

## OTOS GitHub Actions

### Active workflows

#### 1. pages.yml
- Automatically deploys static OTOS app to GitHub Pages
- Triggers on `main` branch push
- No build step, static-only

#### 2. otos-patch.yml
- Manual safety patch workflow
- Verifies no inline navigation JS exists
- Prevents regression of hardened architecture

### Rules
- No inline `<script>` blocks in HTML
- All shared logic must live in `.js` files
- All UI changes are copy–replace, never partial

This file exists to prevent future drift.
