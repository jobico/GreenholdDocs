---
title: Install a package on a device
description: Sign an InstallPackage Order, pin or follow the publication, and know what the agent does.
---

Dispatch installs a package with an `InstallPackage` Action in a signed Release.
The Action names a package.
It never names a location.

## Before you start

- A library with a signed publication. See [Create a library and add a package](/library/create-a-library/).
- Agents with a policy that lists the library in `Libraries`. See [Policy for agents](/concepts/policy-for-agents/).
- Read rights for the computer accounts on the share.

The agent reads a folder or a share.
It reads a share as the computer account.
It does not read an Azure Blob address yet.

## 1. Write the content of the Action

```
greenhold-sign install-spec --library <library folder> --library-id <id> --root root.public.json --package 7zip.7zip --out install.json
```

The command reads the verified publication of the library.
It prints the plan: every package it installs, with version, installer and switches.
Read the plan before you sign.
It also prints the SHA-256 of `install.json`.

The Action has one of two forms:

| Form | Option | What the agent installs |
|---|---|---|
| Pinned | Default, or `--version <v>` | The version, the installer and the whole plan that the Action names. The agent refuses a later publication that changes any item of the plan. |
| Published | `--follow-publication` | Whatever the verified publication names when the Order runs. |

:::caution
The published form lets a later publication change what runs.
Use the pinned form for sensitive computers.
:::

Add `--refuse-automatic` to make the Action refuse automatic publications.

## 2. Sign the Release and the Order

Write a Release draft with an Action of this form:

```json
{ "id": "a1", "type": "InstallPackage", "hash": "<sha256 that install-spec printed>", "artifacts": [] }
```

Sign the Release and the Order as in [Run a PowerShell script on a device](/dispatch/run-a-powershell-script/).

## 3. Store the Order

```powershell
.\Greenhold.Gateway.exe order add --release release.signed --order order.signed --content install.json
```

## What the agent does

Before it claims the Order, the agent does these steps:

1. It reads the publication and verifies it against its root.
2. It plans the package and its dependencies.
3. It copies each installer and script to the folder of the Run.
4. It holds each copy open and checks its hash.

Then it runs the held copies.
An MSI runs through `msiexec /norestart`.

The agent refuses a package whose switches force a restart.
The agent never restarts the computer.
When a package asks for a restart, the Run ends with the code 3010 or 1641.

When the library is not reachable, the Order waits.
The wait starts at 1 minute and doubles up to 30 minutes.

If the policy does not list the library, the agent refuses the Order with code 50.
See [Orders and Releases](/dispatch/orders-and-releases/#what-the-agent-checks) for the codes.
