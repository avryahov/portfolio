# Portfolio (Static Site)

## Architecture

- Shared UI components:
  - `components/header.html`
  - `components/footer.html`
- Shared theme/layout:
  - `assets/css/base.css`
- Page-specific layout add-ons:
  - `assets/css/*.css`
- Shared runtime:
  - `assets/js/main.js` (theme toggle, component injection, active nav, footer year)
  - `assets/js/reveal.js` (scroll reveal)

Default theme is light. Dark theme can be toggled from the header and is saved in browser storage.

## Run locally on localhost:8080

```bash
./scripts/serve-local.sh
```

Then open:

- http://localhost:8080

## Optional

Run on custom port/host:

```bash
./scripts/serve-local.sh 8080 0.0.0.0
```
