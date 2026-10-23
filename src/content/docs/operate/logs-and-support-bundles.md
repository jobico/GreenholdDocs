---
title: Logs and support bundles
description: Where each product writes its log, which Event Log sources exist, and how to make a support bundle.
---

Each product writes its own log.
Read the logs on the computer where the product runs.

## Where the products log

| Product | Log | Event Log source |
|---|---|---|
| Gateway | `%ProgramData%\Greenhold\Gateway\logs\gateway.log` | `Greenhold Gateway` |
| Manager | The Windows Application event log | `Greenhold Manager` |
| Agent | `%ProgramData%\Greenhold\Agent\agent.log` | None |
| Setup wizard | `%ProgramData%\Greenhold\Setup\setup.log` for a scripted run | - |
| Library command line | Security events in the Application event log. Run logs in the library, in `logs\runs` | `Greenhold Library` |
| Automatic publisher | Results in the library, in `logs\automatic`. `journal.jsonl` in its home folder, `%ProgramData%\Greenhold\LibraryPublisher\<LibraryId>` | - |
| Library Installer | `logs\` and `results\` in its work folder, `%ProgramData%\Greenhold\LibraryInstaller` | - |
| MSI installers | The file that you name with `/l*v` | - |

Windows writes the service errors 7000 and 7009 in the System log when a service does not start.

### Gateway

The gateway writes to the console, to the log file and to the Windows Application event log.

- The file has one JSON object on each line. It has the fields `time` (UTC), `level`, `eventId`, `event`, `category`, `security` and `message`.
- The file rotates at 10 MB. The gateway keeps 10 files. The files of the gateway need at most about 100 MB.
- The folder is for administrators and SYSTEM only.
- The event log gets warnings, errors and all security events.
- A log collector can read the file. It must share write access with the gateway.

Change the logging with the section `Gateway:Logging` in `%ProgramData%\Greenhold\Gateway\appsettings.json`.
The values are `File`, `FileSizeMegabytes`, `FilesKept`, `MaxAgeDays` (default 90), `EventLog` and `PseudonymiseAddresses`.
Restart the service after a change.

:::caution
The gateway does not write the output of a Run in its log.
The output can hold secrets.
Keep `Gateway:Logging:RunOutput` off on a production server.
:::

### Manager

The Manager writes to the Application event log under the source `Greenhold Manager`.
The event ID is the Windows event ID.
An administrator must register the source once:

```
Greenhold.Manager.exe event-source create
```

Restart the Manager after you register the source.
Without the source, the Manager writes under `.NET Runtime` with the event ID 1000 for every event.
It then shows a warning at start.

Run `Greenhold.Manager.exe event-source remove` before you remove the Manager from a computer.

### Agent

The agent log rotates at 5 MB and keeps three files.
The agent writes nothing to the Windows Event Log.
The folder is for administrators and SYSTEM only.
The log shows the refusal code when the agent refuses an Order.

## Security events

Every product writes security events under the category `Greenhold.Security`.
Each event has an ID that never changes.
Use the IDs to alert.

| IDs | Product |
|---|---|
| 3xxx | Gateway |
| 5xxx | Manager |
| 6xxx | Library command line |

Alert first on these events:

| Event | Meaning |
|---|---|
| 3004 | The gateway suspects a clone. |
| 3206 | A revoked device keeps trying to connect. |
| 3309 | An agent refused an Order as changed, replayed or signed by a revoked key. |
| 3503 | The gateway cannot write its log file. |
| 3622 | The hash chain of the audit trail does not verify. |
| 5003 | A person signed in without a role. |
| 5201 | The Manager can write to the database. |

Anybody who can use the Event Log can write an entry under the name of a source.
An entry says that something wrote it.
It does not prove that the product wrote it.
Compare an alert with the log file of the gateway and with the database.

## The audit trail

The database keeps an audit trail.
Each entry links to the one before it by a hash.

```powershell
.\Greenhold.Gateway.exe audit list
.\Greenhold.Gateway.exe audit verify
```

`audit verify` exits with 0 when the chain holds, and with 5 when it does not.
Keep the security events 3620 and 3621 where the database administrator cannot change them.
Each of them holds the number and the hash of the newest entry.

## Support bundles

A support bundle is a set of redacted files that you can send to support.
Each product has a `support-bundle` command.
Run the command on the computer of the product.
It only writes files.
It sends nothing.

| Product | Command | Elevated |
|---|---|---|
| Gateway | `Greenhold.Gateway.exe support-bundle --out <folder> [--log <console capture>] [--include-run-output <order id>]` | Yes |
| Agent | `Greenhold.Agent.exe support-bundle --out <folder> [--include-installer-logs]` | Yes |
| Manager | `Greenhold.Manager.exe support-bundle --out <folder> [--log <console capture>]` | No |
| Library command line | `greenhold-library support-bundle --out <folder> [--library <location>]` | No |
| Automatic publisher | `Greenhold.LibraryPublisher.exe support-bundle --out <folder>` | Yes, or its account |
| Library Installer | `Greenhold.LibraryInstaller.exe support-bundle --out <folder> [--include-installer-logs]` | Yes |

Every command also takes these options:

- `--since <days>`. The default is 7. The most is 90.
- `--mapping <file>`. Give the mapping of an earlier bundle. The same computer then keeps the same pseudonym.

### What you get

The command writes three items into the folder:

| Item | What to do |
|---|---|
| `greenhold-<product>-support-<time>\` | Read it before you send it. |
| The same bundle as a `.zip` | Send this file. If you change a file in the folder, make the zip again. |
| `...mapping-keep-private.json` | Keep it. Never send it. It holds the real values behind each pseudonym. |

The command refuses a folder that already holds a bundle.
It refuses an output folder inside a folder that it reads.

### What the bundle contains

- The versions of the product.
- The configuration. A secret shows only as set or not set.
- The logs of the product within the time window.
- For the gateway: the devices as counts only.
- For the agent: the effective policy and the state without the key and the certificate.

### What the bundle leaves out

The bundle never holds these items:

- Keys, certificates and enrollment tokens.
- The read access for Azure Blob.
- The content of packages and signed publications.

The bundle leaves out these items unless you add them with an option:

- The output of scripts. Use `--include-run-output` for the gateway.
- Installer logs. Use `--include-installer-logs`.

### How the bundle redacts

- IP addresses, host names, computer names, domains, accounts, SIDs, device IDs, certificate thumbprints, file shares and user names become pseudonyms such as `HOST-1`. A pseudonym is the same in every file.
- Secrets become `[SECRET]`. This covers values under the name of a secret, connection strings, tokens, key blocks and long random strings.
- Windows Installer properties, except the ones of the product, become `[WITHHELD]`.
- A line that the command cannot redact with certainty is dropped.
- `manifest.json` lists each file, the dropped lines and the reason.

The limits are the last 50 MiB of a file, lines of 16 KiB, 2,000 files and 250 MiB in total.

:::caution
Redaction finds shapes, not meaning.
A name in free text, or a secret with no clear shape, can stay in the bundle.
Read the bundle before you send it.
A bundle is personal data while you hold the mapping.
:::
