---
title: Remove Greenhold
description: Uninstall Greenhold, or remove it with all its data.
---

An uninstall keeps your data and keys.
This is on purpose.
A reinstall then continues where you stopped.

The uninstall keeps:

- The agent key, identity and log.
- The gateway authority, listener certificate, data folder and logs.
- The Manager key ring.
- The database in PostgreSQL.

A full removal needs extra commands.
Do the steps in the order shown.

## Agent computer

1. Run `Greenhold.Agent.exe remove-identity --yes`. Run it **before** you uninstall. It deletes the key and the folder of the agent.
2. Uninstall the agent: `msiexec /x C:\path\Greenhold-Agent-<version>-x64.msi /qn`.

:::caution
After `remove-identity`, the device must enroll again with a new token.
:::

If you uninstalled first, do this:

1. Install the agent again with no properties.
2. Run `remove-identity --yes`.
3. Uninstall again.

## Server

1. Stop the services:

   ```powershell
   Stop-Service GreenholdGateway, GreenholdManager
   ```

2. Run `Greenhold.Gateway.exe remove --yes` in an elevated prompt. It deletes the channel authority and the listener certificate with their keys. It deletes the data folder, but keeps the logs. It refuses to run while the service runs.
3. Uninstall the server MSI.
4. Delete `%ProgramData%\Greenhold` when you want nothing to remain.
5. Drop the database as a PostgreSQL superuser:

   ```sql
   DROP DATABASE greenhold;
   DROP ROLE gh_migrator, gh_runtime, gh_reader;
   ```

`remove --yes --delete-logs` deletes the logs too.

:::caution
After `remove --yes`, every enrolled agent must enroll again under a new authority.
:::

## Keep for a reinstall

Keep these items when you plan to install again:

- `root.key.json` and its passphrase.
- The key of the first administrator.
- `root.public.json`.
- A copy of the client secret of the Manager, or make a new one.
- The certificates for the Manager and for PostgreSQL.

:::note
Without the private key of the root, nobody can sign an Order for the installation again.
:::
