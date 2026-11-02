# Data copied from the Greenhold product

`third-party-components.json` is a copy of `src/Greenhold.Manager/Status/third-party-components.json` in the Greenhold product repository.
The product build generates it from the dependency lists of every shipped part.
Do not edit it here. At each release, copy the new file over this one, then run `npm run build`.
It feeds the page `src/content/docs/reference/third-party-components.mdx`.
