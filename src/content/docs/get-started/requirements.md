---
title: Requirements
description: What you need before you install the Greenhold server.
---

Check this list before you install.
Each item says who can supply it.

| You need | Details |
|---|---|
| PostgreSQL 18 | An existing server that the Greenhold server can reach. Greenhold does not install PostgreSQL. |
| TLS in PostgreSQL | Set `ssl = on`. A new PostgreSQL on Windows has TLS off. Greenhold refuses a database without TLS. |
| SCRAM passwords | Set `password_encryption = 'scram-sha-256'`. Greenhold accepts only SCRAM. |
| Windows Server 2022 or 2025 | Use this for the server. Windows Server 2019 has no TLS 1.3. Greenhold works there with TLS 1.2. |
| A DNS name | Agents use this name to find the gateway. Keep the name the same for years. The gateway certificate is made for it. |
| Ports | Port 8443 for the agent channel. Port 8444 for enrollment. A port for the Manager (the web console). |
| An identity provider app | The Manager uses it for sign-in. See [Install the server](/get-started/install-the-server/). |
| A certificate for the Manager | Browsers must trust it. Your own certificate authority can issue it. |
| A computer for each administrator | Greenhold Admin runs there, not on the server. Use a computer with a TPM, or a PIV security key such as a YubiKey, for the administrator keys. |

:::note
You do not need .NET on any computer.
The installers include what they need.
:::

## Quick install of PostgreSQL for a test server

:::caution
Production databases usually run on a separate server.
A database administrator runs that server.
Use the quick install below for a test server or a small installation only.
:::

Run this in an elevated PowerShell on the computer that will host the database:

```powershell
winget install --id PostgreSQL.PostgreSQL.18 -e --interactive
```

The installer asks you to set the password of the `postgres` superuser.
Type the password in the installer window.
Do not type it on a command line.
A command line is visible to every process on the computer.

A new PostgreSQL has TLS off.
Turn it on before you continue.
See [Install the server](/get-started/install-the-server/).

## Database account

The setup needs one of these:

- A PostgreSQL account that can create a database and roles.
- The connection strings from your database administrator, who has run the bootstrap script.

The setup uses the first account for one run only.
It does not save the password.

## Next

Read [Before you install](/get-started/before-you-install/).
