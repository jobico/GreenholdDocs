// Licence policy check and third-party notices for the docs site.
// Usage:
//   node scripts/generate-notices.mjs --check   enforce the licence policy only; writes nothing
//   node scripts/generate-notices.mjs           check the policy, then write the notices page
//                                               src/content/docs/third-party-notices.md (not committed)
// The policy: every package in package-lock.json must have a known licence, and strong
// copyleft (GPL, AGPL, SSPL, EUPL, CC-BY-SA and similar) is refused. MPL and LGPL are
// allowed and listed. An "A OR B" expression passes when one side is acceptable.
// The notices page is generated during every build, so a dependency update (for example
// from Dependabot) needs no regenerated file in the repository.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));

const strong = /(^|[^L])GPL|AGPL|SSPL|EUPL|CC-BY-SA|CPAL|OSL-/i;
const weak = /LGPL|MPL|EPL|CDDL/i;

// Packages that declare no licence in package.json. Each was read by hand.
const reviewed = { 'khroma@2.1.0': 'MIT (licence file, reviewed)' };

const licenceOf = (entry, id) => {
  if (id && reviewed[id]) return reviewed[id];
  const l = entry.license ?? entry.licenses;
  if (!l) return 'UNKNOWN';
  return typeof l === 'string' ? l : Array.isArray(l) ? l.map((x) => x.type ?? x).join(' OR ') : (l.type ?? 'UNKNOWN');
};

const problems = [];
const weakList = [];
const counts = new Map();
for (const [path, entry] of Object.entries(lock.packages)) {
  if (!path) continue;
  const name = path.replace(/^.*node_modules\//, '');
  const lic = licenceOf(entry, `${name}@${entry.version}`);
  counts.set(lic, (counts.get(lic) ?? 0) + 1);
  const options = lic.replace(/[()]/g, '').split(/\s+OR\s+/);
  const ok = options.some((o) => !strong.test(o) && o !== 'UNKNOWN');
  if (!ok) problems.push(`${name}@${entry.version}: ${lic}`);
  else if (options.every((o) => weak.test(o))) weakList.push(`${name}@${entry.version}: ${lic}`);
}

if (problems.length) {
  console.error('Refused licences (strong copyleft or unknown):\n' + problems.join('\n'));
  console.error('Review the package. If its licence is permissive, add it to "reviewed" in scripts/generate-notices.mjs.');
  process.exit(1);
}
const total = [...counts.values()].reduce((a, b) => a + b, 0);
console.log(`Licence policy: ${total} packages checked, none refused.`);
if (process.argv.includes('--check')) process.exit(0);

const rows = Object.keys(pkg.dependencies).sort().map((name) => {
  const entry = lock.packages[`node_modules/${name}`];
  const metaFile = join(root, 'node_modules', name, 'package.json');
  const meta = existsSync(metaFile) ? JSON.parse(readFileSync(metaFile, 'utf8')) : {};
  const url = typeof meta.repository === 'string' ? meta.repository : (meta.repository?.url ?? meta.homepage ?? '');
  return `| ${name} | ${entry.version} | ${licenceOf(entry)} | ${url.replace(/^git\+/, '').replace(/\.git$/, '')} |`;
});
const summary = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([l, n]) => `| ${l} | ${n} |`);

const text = `---
title: Third-party notices
description: Open-source packages used to build this site, and their licences.
---

This page is generated during every build from \`package.json\` and \`package-lock.json\`.

## Direct dependencies

| Package | Version | Licence | Source |
|---|---|---|---|
${rows.join('\n')}

## Licences of all ${total} packages in the lockfile

| Licence | Packages |
|---|---|
${summary.join('\n')}

## Copyleft check

Strong copyleft licences (GPL, AGPL, SSPL, EUPL, CC-BY-SA) are refused: none found.
Weak copyleft licences (MPL, LGPL, EPL) are allowed because they are build tools only (sharp's libvips, lightningcss) and are not part of the published site: ${weakList.length === 0 ? 'none found.' : '\n\n' + weakList.map((w) => `- ${w}`).join('\n')}
`;

const out = join(root, 'src', 'content', 'docs', 'third-party-notices.md');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, text);
console.log('Wrote src/content/docs/third-party-notices.md');
