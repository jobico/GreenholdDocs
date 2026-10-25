---
title: Logs and support bundles
description: Where each product writes its log, the Greenhold event logs in Event Viewer, and how to make a support bundle.
---

Each product writes its own log.
Read the logs on the computer where the product runs.

## Where the products log

| Product | Log | Event log (Event Viewer) |
|---|---|---|
| Gateway | `%ProgramData%\Greenhold\Gateway\logs\gateway.log` | Greenhold > Gateway |
| Manager | The console and the event log | Greenhold > Manager |
| Agent | `%ProgramData%\Greenhold\Agent\agent.log` | Greenhold > Agent |
| Setup wizard | `%ProgramData%\Greenhold\Setup\setup.log` for a scripted run | Greenhold > Setup |
| Library command line | Run logs in the library, in `logs\runs` | Greenhold > Library Refresh |
| Automatic publisher | Results in the library, in `logs\automatic`. `journal.jsonl` in its home folder, `%ProgramData%\Greenhold\LibraryPublisher\<LibraryId>` | Greenhold > Library Publisher |
| Greenhold Admin | - | Greenhold > Admin, on your own computer |
| Library Installer | `logs\` and `results\` in its work folder, `%ProgramData%\Greenhold\LibraryInstaller` | - |
| MSI installers | The file that you name with `/l*v` | - |

## The Greenhold event logs

Each product writes to its own event log.
In Event Viewer, open **Applications and Services Logs > Greenhold**.
Each product has a folder with one log, **Operational**.
Greenhold writes nothing to the Application log.

The installers register the logs. The uninstall removes them. The events already written stay until you clear the log.

The event IDs are the same in each log:

| ID | Level | Meaning |
|---|---|---|
| 1000 | Information | The product started. |
| 1001 | Information | The product stopped. |
| 2000 | Warning | A warning. |
| 3000 | Error | An error. |
| 3001 | Critical | The product cannot continue. |
| 4000 | Information | A security event. |
| 4001 | Warning | A security event at Warning. |
| 4002 | Error | A security event at Error. |

Each event has three values on the **Details** tab: `Message` (the text), `LogEventId` (the ID of the line in the product's log, for example 5003 for a sign-in without a role) and `Category`.
To filter on one security event, use the log, the event ID and `LogEventId`. For example, in an XPath filter on `Greenhold-Manager/Operational`:

```
*[System[EventID=4001] and EventData[Data[@Name='LogEventId']=5003]]
```

Each log is 1 MB by default. Change the size in the log's Properties, with `wevtutil sl`, or with Group Policy.
To forward the events, subscribe to the log by its name, for example `Greenhold-Gateway/Operational`.
The output of a Run never goes to an event log.

Windows writes the service errors 7000 and 7009 in the System log when a service does not start.

### Gateway

The gateway writes to the console, to the log file and to its event log (Greenhold > Gateway).

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

The Manager writes warnings, errors and all security events to its event log (Greenhold > Manager).
At start it says in its console where the events go.
When the log is not registered, for example when you start the Manager from a folder and not from the installer, it shows a warning at start.
### Agent

The agent log rotates at 5 MB and keeps three files.
The agent writes its start, its stop, its warnings and its errors to its event log (Greenhold > Agent).
The folder is for administrators and SYSTEM only.
The log shows the refusal code when the agent refuses an Order.

The agent keeps these files in its folder, `%ProgramData%\Greenhold\Agent`:

| File or folder | What it holds | How long |
|---|---|---|
| `agent.log` | The agent's log. | Three files of 5 MB. |
| `run-logs\` | The installer logs (for example MSI logs) and script logs of a Run, one folder for each Run. They can hold the MSI properties that a package's switches set. | A Run that did not fail: until the gateway has its result. A failed Run: 14 days, and at most the 20 newest failed Runs. The policy values `FailedRunLogDays` and `FailedRunLogCount` change this. See [Policy for agents](/concepts/policy-for-agents/). |
| `connection.json` | If the agent is connected, since when, the last contact with the gateway, and why the last connection ended. `Greenhold.Agent.exe status` shows it. | The agent writes it again while it runs. |

The Run's summary in the Manager names the folder of its logs.
`remove-identity` and `seal` remove these files.

## Security events

Every product writes security events under the category `Greenhold.Security`.
Each event has an ID that never changes.
In the event logs, this ID is the value `LogEventId` of the events 4000 to 4002.
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

Plan for these warnings:

| Event | Meaning |
|---|---|
| 3606, 6004 | No license is installed. The free period ends in 15 days or less. 3606 is for Greenhold Dispatch. 6004 is for a library. |
| 3607, 6005 | No license is installed. The free period ends in 1 day. |
| 3608, 6006 | No license is installed. The free period is over. New work stops. |
| 5501 | The sign-in secret of the Manager expires in 30 days or less. |
| 5502 | The sign-in secret of the Manager expires in 7 days or less. |
| 5503 | The sign-in secret of the Manager expired. Nobody can sign in. |

The gateway writes 3606 to 3608 once each time it starts.
`greenhold-library` writes 6004 to 6006 once for each library, when you run `license` or `refresh`.

Any program on the computer can write an event under the name of a Greenhold product.
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
- Installer logs, also the logs that the agent keeps of failed Runs. Use `--include-installer-logs`.

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
