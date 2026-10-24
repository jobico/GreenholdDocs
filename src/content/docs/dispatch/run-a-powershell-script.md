---
title: Run a PowerShell script on a device
description: Write a script, sign a Release and an Order, store them on the gateway and read the result.
---

This page shows the whole path for one script on one device.

Before you start, you need these items:

- An installation root and an administrator key with a certificate. See [Before you install](/get-started/before-you-install/).
- A running gateway and an enrolled device. See [Enroll your first device](/get-started/enroll-your-first-device/).
- The tool `greenhold-sign` on your own computer. Never use the server for signing.

## 1. Write the script

The agent runs the script with Windows PowerShell 5.1.
Declare each value in `param()`.
Each value arrives as one string.

```powershell
param([string]$Name)
Write-Output "Hello $Name"
```

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
The version starts at 1.
Each new Release of the Job needs a higher version.

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
Give each Order its own `orderId`.

```
greenhold-sign sign --kind order --draft order.json --admin-key admin.key.json --cert admin.cert --out order.signed
```

If the Order needs a second signer, see [Second signer and tags](/dispatch/second-signer-and-tags/).

## 5. Check like an agent

```
greenhold-sign verify --order order.signed --release release.signed --root root.public.json --device-id <device id>
```

The tool prints `ACCEPTED`, or `REFUSED` with a code.
This check does not replace the check of the agent.

## 6. Store the Order on the gateway

Run this command in an elevated prompt on the gateway computer:

```powershell
.\Greenhold.Gateway.exe order add --release release.signed --order order.signed --content hello.ps1
```

Give one `--content` file for each script in the Release.
The command checks the form of the files, the script hashes and the devices.
It does not check the signatures.
The agent does.

The gateway queues one Run for each device.
The agent hears of the Order at its next look.

## 7. Watch the Run

```powershell
.\Greenhold.Gateway.exe run list --limit 50
.\Greenhold.Gateway.exe run output <order id> --device <device id>
```

`run list` shows the state, the exit code and the refusal code of each Run.
For the refusal codes, see [Orders and Releases](/dispatch/orders-and-releases/#what-the-agent-checks).
`run output` shows what the script wrote.

To run the work again, sign a new Order with a new ID.
To change the script, sign a new Release with a higher version.

## Next

- [Run output and retention](/dispatch/run-output-and-retention/)
- [Troubleshooting](/operate/troubleshooting/)
