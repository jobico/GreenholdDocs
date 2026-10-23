# Greenhold Docs

The source of the documentation site at <https://docs.greenhold.eu>.
The site is built with [Starlight](https://starlight.astro.build) (Astro).
Pages are Markdown (`.md`, `.mdx`) in `src/content/docs`.

- Search: Pagefind (built into Starlight, runs in the browser).
- Diagrams: Mermaid in a fenced `mermaid` block. It renders in the reader's browser.
- Note blocks: `:::note`, `:::tip`, `:::caution` (see `src/content/docs/get-started`).
- Font: Manrope, bundled with the site (`@fontsource/manrope`). The site calls no external font service.
- No analytics and no tracking of any kind.

## Run it locally

Use Node 24 (see `.nvmrc`).

```
npm ci
npm run dev        # http://localhost:4321, reloads on save
npm run build      # writes dist/
npm run preview    # serves dist/ (search works only here, not in dev)
```

## Layout

| Path | Content |
|---|---|
| `src/content/docs/` | The pages. The sidebar order is in `astro.config.mjs`. |
| `src/styles/greenhold.css` | Colours (Hold green `#1B5E43`, Leaf `#3F8F63` / `#8CC49F`) and the font. |
| `src/assets/docs.svg`, `docs-dark.svg` | Logo for light and dark theme. |
| `public/favicon.svg` | Favicon. |
| `.github/workflows/deploy.yml` | Build and deploy (GitHub Pages). |
| `public/CNAME` | The custom domain. |
| `scripts/generate-notices.mjs` | Licence policy check, and writes the page `third-party-notices` from the lockfile (during the build). |

## Dependencies

Direct dependencies are pinned exactly in `package.json`, and `package-lock.json` is committed.
The `overrides` block holds a range for a transitive package that needs a security fix the parent does not allow yet (now: katex).
`npm run notices:check` enforces the licence policy: it refuses strong copyleft (GPL, AGPL and similar) and unknown licences.
It does not compare against a committed file. The build writes the page `/third-party-notices/` itself (`prebuild`),
so a dependency update needs no extra commit.

## Writing style

Write for administrators in ASD-STE100 style:
short sentences, one statement each, imperative verbs, one word for one meaning.
Do not put internal references, host names or names of people in a page.

## How deployment works

`.github/workflows/deploy.yml` builds and publishes the site with GitHub Pages.

1. **Build.** Node from `.nvmrc`, `npm ci`, licence check, `npm run build`. The `dist` folder becomes the Pages artifact.
2. **Deploy.** A push to `main` publishes the artifact to GitHub Pages. `public/CNAME` holds the domain `docs.greenhold.eu`.

Pull requests build only. They do not deploy. The workflow needs no secrets.

## What the owner must set up

1. In the repository, open **Settings > Pages**. Set **Source** to **GitHub Actions**.
2. Set **Custom domain** to `docs.greenhold.eu`. Select **Enforce HTTPS** when the certificate is ready.
3. At the DNS provider of `greenhold.eu`, add a CNAME record: `docs` points to `jobico.github.io`.
4. Optional: in **Settings > Branches**, protect `main` and require the workflow to pass.
## Dependency updates (Dependabot)

`.github/dependabot.yml` checks npm packages and GitHub Actions.

- **Security updates** arrive as soon as GitHub knows about an advisory.
  The workflow `.github/workflows/dependabot-security.yml` approves the pull request,
  waits for the build, merges it and starts a new deployment. A failed build stops it: then a person looks.
- **Other updates** arrive once a week (Monday), grouped into one pull request. A person reviews and merges them.

Settings the owner must turn on once:

1. **Settings > Code security**: turn on **Dependabot alerts** and **Dependabot security updates**.
2. **Settings > Actions > General > Workflow permissions**: select **Read and write permissions** and
   **Allow GitHub Actions to create and approve pull requests**.

## License

- Documentation text (`src/content/docs`): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), see `LICENSE-docs`.
- Everything else (site code, configuration, scripts, workflows): MIT, see `LICENSE`.
- Excluded from both: the Greenhold name, logos and brand icons (`src/assets`, `public/favicon.svg`). All rights reserved.

Copyright (c) 2026 John Billekens Consultancy
