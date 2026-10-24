---
title: Install a package on a device
description: Tell the agent where the library is, sign an InstallPackage Order, pin or follow the publication, and know what the agent does.
---

Dispatch installs a package with an `InstallPackage` Action in a signed Release.
The Action names a package.
It never names a location.

## Before you start

- A library with a signed publication. See [Create a library and add a package](/library/create-a-library/).
- An enrolled device. See [Enroll your first device](/get-started/enroll-your-first-device/).
- The steps to sign and store an Order. See [Run a PowerShell script on a device](/dispatch/run-a-powershell-script/).

The agent reads a folder or a share.
It reads a share as the computer account.
It does not read an Azure Blob address yet.

## 1. Tell the agent where the library is

The agent installs only from libraries that its policy lists in `Libraries`.
Each entry has the library ID as its name and the folder or share as its value.

Find the library ID in `library.json` in the library folder, as the value of `libraryId`:

```powershell
(Get-Content -Raw \\files\library\library.json | ConvertFrom-Json).libraryId
```

For many computers, set `Libraries` with Group Policy.
See [Policy for agents](/concepts/policy-for-agents/).

For one test computer, write the value in the registry.
Run this in an elevated PowerShell on the agent computer:

```powershell
$libraryId = '<library id>'
$key = 'HKLM:\SOFTWARE\Policies\Greenhold\Agent\Libraries'
New-Item -Path $key -Force | Out-Null
Set-ItemProperty -Path $key -Name $libraryId -Value '\\files\library'
Restart-Service GreenholdAgent
```

The agent reads its policy when it starts.
Restart the agent service after each change.

Give the computer account of each agent computer read access to the share.
Use a full local path only when the library is on the agent computer.

## 2. Write the content of the Action

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

## 3. Sign the Release and the Order

Write a Release draft with an Action of this form:

```json
{ "id": "a1", "type": "InstallPackage", "hash": "<sha256 that install-spec printed>", "artifacts": [] }
```

A Release with only this Action has `"parameters": []`.
Its Order has `"values": {}`.

Sign the Release and the Order as in [Run a PowerShell script on a device](/dispatch/run-a-powershell-script/).
Use a new `jobId` and a new `orderId`, for example `install-7zip` and `install-7zip-1`.
If the device is a server, the Order needs two signers.

## 4. Store the Order

Copy the signed files and `install.json` to the gateway computer.
Run this in an elevated PowerShell there:

```powershell
& 'C:\Program Files\Greenhold\Gateway\Greenhold.Gateway.exe' order add --release release.signed --order order.signed --content install.json
```

## 5. Read the result

Wait a few minutes. Then run:

```powershell
& 'C:\Program Files\Greenhold\Gateway\Greenhold.Gateway.exe' run list
& 'C:\Program Files\Greenhold\Gateway\Greenhold.Gateway.exe' run output install-7zip-1
```

A Run that worked shows `succeeded`.
The output shows the pinned version, `SHA-256 verified` and `installed (exit 0)`.

If the Run shows `refused` with code 50, the policy of the agent does not list the library.
Do [step 1](#1-tell-the-agent-where-the-library-is) again and restart the agent service.

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

## Next

- [Remove a package from a device](/library/remove-a-package/)
