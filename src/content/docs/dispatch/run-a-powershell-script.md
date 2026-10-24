---
title: Run a PowerShell script on a device
description: Write a script, sign a Release and an Order, store them on the gateway and read the result.
---

This page shows the whole path for one script on one device.

Before you start, you need these items:

- An installation root and an administrator key with a certificate. See [Before you install](/get-started/before-you-install/).
- A running gateway and an enrolled device. See [Enroll your first device](/get-started/enroll-your-first-device/).
- The tool `greenhold-sign` on your own computer. Admin Tools installs it. Never use the server for signing.
- A second administrator key, if the Order needs two signers. See [When you need two signers](#when-you-need-two-signers).

## Find the values

You need these values for the drafts:

| Value | Where to find it |
|---|---|
| Installation ID | `installationId` in `root.public.json`. On the server, the file is `C:\ProgramData\Greenhold\Gateway\root.public.json`. |
| Device ID | The line `Device id` of `Greenhold.Agent.exe status` on the device, or `Greenhold.Gateway.exe agent list --wide` on the server. It has 32 characters. |

To read the installation ID in PowerShell:

```powershell
(Get-Content -Raw root.public.json | ConvertFrom-Json).installationId
```

### When you need two signers

By default, an Order needs two signers in these cases:

- The device is a server. `Greenhold.Agent.exe status` shows `Server: yes`.
- The Order names a tag.
- The Order names more than 25 devices.

The policy of the agent can change these rules.
See [Second signer and tags](/dispatch/second-signer-and-tags/).

## 1. Write the script

The agent runs the script with Windows PowerShell 5.1.
Declare each value in `param()`.
Each value arrives as one string.

```powershell
param([string]$Name)
Write-Output "Hello $Name from $env:COMPUTERNAME"
```

Save it as `hello.ps1`.

:::caution
A parameter value is visible on the command line of the process.
Do not use a parameter for a secret.
:::

Get the SHA-256 of the script:

```powershell
(Get-FileHash .\hello.ps1 -Algorithm SHA256).Hash.ToLower()
```

## 2. Write the Release draft

A draft is a JSON file.
The layout of the file does not matter.
Save it as `release.json`.

```json
{
  "format": 2,
  "installationId": "<installation id>",
  "jobId": "hello",
  "version": 1,
  "createdOn": "2026-10-24T12:00:00Z",
  "actions": [
    { "id": "a1", "type": "RunScript", "hash": "<sha256 of hello.ps1>", "artifacts": [] }
  ],
  "parameters": [
    { "name": "Name", "values": ["world", "lab"] }
  ]
}
```

A parameter has either `values` (the allowed text) or `min` and `max` (a range of whole numbers).
A Release without parameters has `"parameters": []`.
The version starts at 1.
Each new Release of the Job needs a higher version.

Write each time in UTC, in the form `yyyy-MM-ddTHH:mm:ssZ`.
Use the time now for `createdOn`.
To get it in PowerShell:

```powershell
[DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
```

## 3. Sign the Release

```
greenhold-sign sign --kind release --draft release.json --admin-key admin.key.json --cert admin.cert --out release.signed
greenhold-sign hash --file release.signed
```

The tool asks for your passphrase.
Set `GREENHOLD_ADMIN_PASSPHRASE` or type it when asked.
Never give it as an argument.
The command `hash` prints the hash of the Release.
You need it in the Order.

## 4. Write and sign the Order

Save the Order draft as `order.json`:

```json
{
  "format": 2,
  "installationId": "<installation id>",
  "orderId": "order-0001",
  "releaseHash": "<hash from greenhold-sign hash>",
  "issuedOn": "2026-10-24T12:00:00Z",
  "notBefore": "2026-10-24T12:00:00Z",
  "expires": "2026-10-25T12:00:00Z",
  "targets": { "devices": ["<device id>"] },
  "values": { "Name": "world" }
}
```

Each parameter of the Release needs a value.
The value must fit the Release.
A Release without parameters needs `"values": {}`.
Give each Order its own `orderId`.

Set `issuedOn` and `notBefore` to the time now, or a little earlier.
The agent waits for an Order whose `notBefore` is in the future.
Set `expires` to a time after the agent can run the Order, for example 2 hours from now.
The agent refuses an Order after `expires`.

```
greenhold-sign sign --kind order --draft order.json --admin-key admin.key.json --cert admin.cert --out order.signed
```

If the Order needs a second signer, the second administrator adds a signature:

```
greenhold-sign sign --add-to order.signed --admin-key <key folder 2>\admin.key.json --cert <key folder 2>\admin.cert --out order2.signed
```

Then use `order2.signed` in the next steps.
See [Second signer and tags](/dispatch/second-signer-and-tags/).

## 5. Check like an agent

```
greenhold-sign verify --order order.signed --release release.signed --root root.public.json --device-id <device id>
```

The tool prints `ACCEPTED`, or `REFUSED` with a code.
Add `--server` when the device is a server.
This check does not replace the check of the agent.

## 6. Store the Order on the gateway

Copy these files to the gateway computer:

- `release.signed`
- `order.signed`, or `order2.signed` with two signers
- `hello.ps1`

The files hold no secret.
Run these commands in an elevated PowerShell on the gateway computer, in the folder with the files:

```powershell
$gw = 'C:\Program Files\Greenhold\Gateway\Greenhold.Gateway.exe'
& $gw order add --release release.signed --order order.signed --content hello.ps1
```

The command prints this line:

```
Order order-0001 stored for 1 device(s); each agent is told at its next look. The agent judges the signatures, not the gateway.
```

Give one `--content` file for each script in the Release.
The command checks the form of the files, the script hashes and the devices.
It does not check the signatures.
The agent does.

The gateway queues one Run for each device.
The agent hears of the Order at its next look.
This can take a few minutes.

## 7. Watch the Run

```powershell
& $gw run list --limit 50
& $gw run output order-0001 --device <device id>
```

`run list` shows the state, the exit code and the refusal code of each Run.
A Run that worked shows `succeeded` and exit code `0`.
For the refusal codes, see [Orders and Releases](/dispatch/orders-and-releases/#what-the-agent-checks).

`run output` shows what the script wrote, for example `Hello world from PC-01`.
For an Order with one device, you can leave out `--device`.
For `--device`, the first characters of the ID from `run list` are enough.

To run the work again, sign a new Order with a new ID.
To change the script, sign a new Release with a higher version.

## Next

- [Run output and retention](/dispatch/run-output-and-retention/)
- [Install a package on a device](/library/install-a-package/)
- [Troubleshooting](/operate/troubleshooting/)
