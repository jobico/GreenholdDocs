---
title: Upgrade Greenhold
description: Install a new version over the old one, run the database migrations, and check the result.
---

To upgrade, install the new MSI over the old one.
You do not uninstall first.
The settings and the data stay.

## What an upgrade keeps and what it replaces

| Kept | Replaced |
|---|---|
| `%ProgramData%\Greenhold\Gateway\appsettings.json` | The program files in `C:\Program Files\Greenhold`. |
| `%ProgramData%\Greenhold\Manager.appsettings.json` | `appsettings.json` beside the programs. |
| The gateway authority, the listener certificate and the data folder | |
| The logs of all products | |
| The key ring of the Manager | |
| The key, the identity and the log of the agent | |
| The policy values in the registry | |
| The database in PostgreSQL | |

:::caution
Keep the settings of this computer in the two files in `%ProgramData%`.
An upgrade replaces the `appsettings.json` that is beside the programs.
Copy any edit from that file to the `%ProgramData%` file before you upgrade.
:::

The installer does not start the services.
A service that is not set up cannot run.
To start the services at the end of an upgrade, give `STARTSERVICES=1`.
Use it only for an installation that is set up.

## Upgrade the server

1. Make a backup of the database. The database holds the list of devices.
2. Check the new files. Compare `Get-FileHash` with `SHA256SUMS.txt`. Check the signature with `Get-AuthenticodeSignature`.
3. Install the new MSI. Use the full path to the file:

   ```
   msiexec /i C:\path\Greenhold-Server-<version>-x64.msi /qn /norestart LICENSEACCEPTED=1 /l*v C:\Windows\Temp\greenhold-server-upgrade.log
   ```

   The installer stops the services, replaces the files and starts nothing.
4. Run the database migrations when the new build has them. See the next section.
5. Start the services:

   ```powershell
   Start-Service GreenholdGateway, GreenholdManager
   ```

6. Check the result. See [Check the upgrade](#check-the-upgrade).

## Run the database migrations

A new build can need a newer database schema.
The gateway refuses to start when the schema is not the one that the build expects.
A database that is newer than the software is also refused.
Greenhold never takes a database back to an older schema.

Use one of these ways:

- Start **Greenhold Server Setup** again. Run the database step. It applies the migrations and changes only what is needed.
- Run the migration yourself. Use the connection string of the role `gh_migrator`. Put it in the environment of this one command only:

  ```powershell
  cd "C:\Program Files\Greenhold\Gateway"
  $env:GREENHOLD_MIGRATOR_DATABASE = 'Host=<host>;Database=greenhold;Username=gh_migrator;Password=<password>;SSL Mode=VerifyFull'
  .\Greenhold.Gateway.exe database migrate
  Remove-Item Env:GREENHOLD_MIGRATOR_DATABASE
  ```

  You can use `--connection-file <path>` instead of the variable.

Migrations apply in order, each in one transaction.
They only go forward.
A migration that was applied and then edited is refused.

:::note
The setup wizard does not keep the password of `gh_migrator`.
If you do not have it, use the wizard.
:::

## Upgrade an agent

1. Install the new agent MSI over the old one:

   ```
   msiexec /i C:\path\Greenhold-Agent-<version>-x64.msi /qn /norestart LICENSEACCEPTED=1 STARTSERVICES=1 /l*v C:\Windows\Temp\greenhold-agent-upgrade.log
   ```

2. The key, the identity and the policy stay. The device does not enroll again.
3. If you gave the `POLICY...` properties at the first install, the installer remembers them. An upgrade without properties keeps them. A property that you give replaces that one value and keeps the others. Group Policy overrides them at its next refresh.

To upgrade many computers, use your software distribution tool with the same command.
A software-installation GPO needs `LICENSEACCEPTED=1` in a transform (`.mst`).

## Rules for versions

- Windows Installer compares the first three parts of the version. It ignores the fourth part.
- You cannot install an older version over a newer one. The installer stops with error 1603. Uninstall first.
- To put back the files and registry entries of Greenhold, repair the installation:

  ```
  msiexec /fam C:\path\Greenhold-Agent-<version>-x64.msi /qn LICENSEACCEPTED=1
  ```

## Check the upgrade

On the server:

```powershell
Get-Service GreenholdGateway, GreenholdManager
cd "C:\Program Files\Greenhold\Gateway"
.\Greenhold.Gateway.exe agent list
```

Both services must show `Running`.
The agents must show `connected` after a short time.
Open the Manager and sign in.

On an agent computer:

```
"C:\Program Files\Greenhold\Agent\Greenhold.Agent.exe" status
```

If a service does not start, see [Troubleshooting](/operate/troubleshooting/).
