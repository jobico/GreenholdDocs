---
title: Security model
description: What each port allows, and what protects your computers.
---

## Ports

| Port | Service | What it allows | How it checks the caller |
|---|---|---|---|
| 8444 | Gateway, enrollment | One thing: enrollment with a token. | The agent shows a one-time token. The agent has no certificate yet. |
| 8443 | Gateway, agent channel | Sessions, renewals, and the fetching of Releases, Orders and scripts. Reports of Runs. | Mutual TLS. The agent must show its device certificate. |
| Your choice | Manager | The web console for administrators. | Sign-in through your identity provider. |

The gateway gives an agent only what an Order for that agent names.

## Keep the Manager internal

Never offer the Manager to the internet.
Put it on your internal network.
Offer only port 8443 to the internet, and only when agents must connect from outside.
Keep port 8444 internal.
Open it only while you enroll devices.

## The installation root stays offline

The installation root is a signing key.
It certifies the admin keys.
Agents run an Order only when an admin key that the root certified signed it.

:::caution
Keep `root.key.json` offline and make a backup.
Whoever holds the root can sign work for every computer in the installation.
:::

## Signed Orders

- An administrator signs each Order.
- The agent checks the signature itself.
- The agent trusts only the root that you gave it in the policy.
- The server cannot make an agent run unsigned work.

## The gateway authority

`Greenhold.Gateway init` makes a channel authority.
Its key cannot be exported.
Each agent trusts only this authority for the gateway.
The agent does not use the certificate stores of the computer for this.
Give the authority certificate to agents with Group Policy, Intune or your image.
Do not let agents fetch it from the gateway over the network.

## The database

Greenhold uses three database roles.

| Role | Used by | Can |
|---|---|---|
| `gh_migrator` | Migrations only | Change the schema |
| `gh_runtime` | The gateway | Read and write what the migrations allow |
| `gh_reader` | The Manager | Read only |

Greenhold accepts only TLS connections and only SCRAM passwords.

## Revoke a device

To stop a device, revoke it on the server:

```
Greenhold.Gateway.exe agent revoke <device id>
```
