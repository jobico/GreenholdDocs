---
title: Command line
description: The commands of the gateway, the agent, greenhold-sign, the Manager and greenhold-library.
---

Run the gateway and agent commands in an elevated prompt.
Without elevation, a command stops with exit code 2 and says so.

## Greenhold.Gateway

The program is in `C:\Program Files\Greenhold\Gateway`.

### Set up

| Command | Job |
|---|---|
| `init --dns <name> [--ip <address>] [--accept-license]` | Make the channel authority, the listener certificate and the data folder. Name every host name and address that agents use. Add `--accept-license` after you read `LICENSE.txt`. The command refuses to run when an authority exists. |
| `database migrate [--connection-file <path>]` | Apply the database migrations. Give the connection string of `gh_migrator` in the variable `GREENHOLD_MIGRATOR_DATABASE` or in the file. |
| `run` | Run the gateway in the console. Stop the service first. Both use the same ports. |
| `remove --yes [--delete-logs]` | Delete the authority, the certificates, the data folder and the event source. Stop the service first. Without `--yes` it changes nothing. |

### Tokens and devices

| Command | Job |
|---|---|
| `token new --name <name> \| --pattern <pattern> [--uses <n>] [--lifetime <d.hh:mm:ss>]` | Make an enrollment token, for one name or for the devices whose names match a pattern. `--uses` is the number of devices for a pattern, 1 to 1000. The token is shown once. It lasts at most 7 days. The Manager's **Add devices** page does the same. |
| `agent list [--wide] [--json]` | List the devices and their connection state. `--wide` prints whole values. `--json` is for scripts. |
| `agent show <device id>` | Show one device, its session and what its agent reported. It prints a warning for each policy value that is weaker than the recommended one. Four or more characters of the ID are enough. |
| `agent revoke <device id>` | Revoke a device. You need the whole ID. You cannot undo it. The computer must enroll again as a new device. |
| `agent forget <device id> --yes [--note <text>] [--include-clone-suspected]` | Delete the data of a revoked device. Give the connection string of `gh_migrator`. The note is kept for ever. Use a reference number, not a name. |

### Work

| Command | Job |
|---|---|
| `order add --release <file> --order <file> --content <file>` | Store a signed Release, a signed Order and the scripts. Give one `--content` file for each script. The command does not check the signatures. |
| `run list [--limit <n>] [--wide]` | List the most recent Runs, with state, exit code and refusal code. `--wide` prints whole values. |
| `run output <order id> [--device <device id>]` | Show what a Run wrote. |

### License

| Command | Job |
|---|---|
| `license install --file <license> --root <root.public.json>` | Install a license. The command refuses a license for another installation. |
| `license root --root <root.public.json>` | Tell the gateway which installation root this installation uses. The 90 days without a license then count from the date of the root, if that date is earlier. The setup wizard runs this command when you continue without a license. |
| `license show` | Show the installed license, the clock and what the license allows. Without a license, it shows the days left. |
| `license clock reset [--connection-file <path>]` | Move the license clock mark back to the clock of the database. Give the connection string of `gh_migrator`. |

Enrolling a device and storing a new Order need a valid license or the starter allowance.
The starter allowance is 5 devices for 90 days.
The other commands work with any license, and after the 90 days.
See [Use without a license](/manager/license/#use-without-a-license).

### Audit trail

| Command | Job |
|---|---|
| `audit list [--since <date>] [--action <name>] [--limit <n>]` | Show the audit trail. It shows the newest 50 entries by default. |
| `audit verify` | Check the hash chain of the audit trail. Exit code 0 means that it holds. Exit code 5 means that it does not. |
| `audit export --out <file> [--since <date>] [--until <date>]` | Write the entries to a compressed file. The command never overwrites a file. |
| `audit verify --archive <file>` | Check an exported file. It needs no database and no elevation. |

### Database

| Command | Job |
|---|---|
| `database retention` | Show the retention periods and the latest purges. |
| `database retention set [options]` | Set the periods. Give the connection string of `gh_migrator`. |

The options of `database retention set` are:

| Option | Default | Meaning |
|---|---|---|
| `--run-output-days` | 90 | Days to keep the output of a finished Run. |
| `--run-days` | 365 | Days to keep a finished Run. |
| `--revoked-session-days` | 30 | Days to keep the session data of a revoked device. |
| `--expired-token-days` | 1 | Days to keep an unused token after it expired. |
| `--audit-days` | 730 | Days to keep an audit entry. |
| `--audit-archive-folder <folder>` | off | Write the entries to this folder before the sweep removes them. |
| `--no-audit-archive` | | Turn off the archive. |

### Support

| Command | Job |
|---|---|
| `support-bundle --out <folder> [--log <console capture>] [--since <days>] [--include-run-output <order id>]` | Write a redacted bundle for support. It sends nothing. See [Logs and support bundles](/operate/logs-and-support-bundles/). |

### Exit codes

| Code | Meaning |
|---|---|
| 0 | Done. |
| 1 | A wrong argument, an unknown device, or a command that refused. |
| 2 | Not elevated, not initialised, a folder or file that others can open, a setting out of range, or no database. |
| 3 | The database could not be used. Nothing changed. |
| 4 | The license refuses the new work, or refuses the license you installed. Nothing changed. |
| 5 | The audit chain does not verify. |
| 64 | Unknown command. The usage is printed. |

## Greenhold.Agent

The program is in `C:\Program Files\Greenhold\Agent`.
Only one agent process can run at a time.

| Command | Job |
|---|---|
| `enroll [--token-file <file>]` | Enroll with a token. Without the option, it asks for the token and does not show what you type. It also reads the token from standard input. It refuses a token as an argument. |
| `status` | Show the policy, the enrollment, the key, the certificate end and the service. |
| `run` | Run the agent in the console. Press Ctrl+C to stop. |
| `install` | Install the Windows service. It does not start it. |
| `uninstall` | Stop and remove the service. The key and the folder stay. |
| `remove-identity --yes` | Delete the key and the folder of the agent. The device must enroll again. |
| `seal --yes [--offline]` | Prepare a computer for an image. Stop the service first. The gateway retires the device. Then the agent removes its keys and identity. With `--offline`, revoke the device by hand. |
| `support-bundle --out <folder> [--since <days>] [--include-installer-logs]` | Write a redacted bundle for support. It sends nothing. |

Enroll with the token on standard input:

```powershell
Get-Content token.txt | & "C:\Program Files\Greenhold\Agent\Greenhold.Agent.exe" enroll
```

| Exit code | Meaning |
|---|---|
| 0 | Done. |
| 1 | A wrong argument, or the service is already installed. |
| 2 | Not elevated, a policy value that is not usable, a folder that others can open, another agent process, or a seal that is refused or not complete. |
| 3 | The gateway refused or could not be reached. For `seal`: nothing was removed. |
| 64 | Unknown command. |

## greenhold-sign

`greenhold-sign` is in `C:\Program Files\Greenhold\Admin Tools\greenhold-sign` when Greenhold Admin is installed.
It is also in the `Greenhold.SigningTool` folder of the release.
Run it on the own computer of an administrator.
Never run it on the server.

A passphrase comes from an environment variable, from standard input or from a prompt.
The root passphrase variable is `GREENHOLD_ROOT_PASSPHRASE`.
The administrator passphrase variable is `GREENHOLD_ADMIN_PASSPHRASE`.
A passphrase has at least 10 characters.
The tool never takes a passphrase as an argument.

| Exit code | Meaning |
|---|---|
| 0 | Done or accepted. |
| 1 | Refused or failed. |
| 2 | A wrong command line. |

### Keys

| Command | Job |
|---|---|
| `root-create --installation <id> --out <dir> [--store tpm\|smartcard]` | Make the root: a key file (`root.key.json`, keep it offline) or a key in the TPM or on a security key, and the public file (`root.public.json`). The installation ID must be a GUID. `--store software` is refused. |
| `admin-create --admin-id <id> --name <name> --out <dir> [--store tpm\|smartcard\|software]` | Make an administrator key and a request. With `--store tpm` or `smartcard`, the request holds the proof of where the key is. `software` is for tests: nothing asks before it signs. Use a role name. It prints the key ID. Read the key ID to the root holder in person or by voice. |
| `admin-certify --root <file> \| --cert-thumbprint <thumbprint> --request <file> --out <file> [--months 1-6] [--attestation-roots <folder>] [--yes]` | Certify an administrator key with the root. The kind is the kind that the proof shows. A certificate lasts at most 6 months. Compare the key ID with the one that the administrator reads aloud. |
| `admin-unseal --sealed <file> --out <file>` | Open the sealed certificate of a TPM key on the computer of that TPM. |
| `store-list` | List the Greenhold keys in your certificate store. |
| `automation-certify --root <file> --request <file> --library-id <id> --protection tpm\|software --out <file> [--months 1-6]` | Certify the automation key of one library. |
| `key-id --cert <file> [--alg sha384]` | Show the IDs of a certificate and its keys. |
| `revoke --root <file> --key-id <id>[,<id>] --out <file> [--previous <file>]` | Write a revocation list. A list is cumulative. Its sequence rises. |

### Sign and check

| Command | Job |
|---|---|
| `sign --kind release\|order\|policy --draft <json> --admin-key <file> --cert <file> --out <file>` | Sign a draft. |
| `sign --add-to <signed file> --admin-key <file> --cert <file> --out <file>` | Add a second signature to a signed object. |
| `sign --kind publication --draft <file> --content <file> --library <dir> --root <file> --state <dir> --admin-key <file> --cert <file> --out <file> [--valid-days 1-366] [--first] [--yes]` | Sign a library publication. `--state` is your own memory of the library. Keep it on your computer. |
| `hash --file <signed Release> [--alg sha384]` | Show the hash that an Order names. |
| `install-spec --library <dir> --library-id <id> --root <file> --package <id> --out <file> [--version <v> \| --follow-publication]` | Write the content of an `InstallPackage` Action from the verified publication. |
| `verify --order <file> --release <file> --root <file> --device-id <id>` | Check an Order as an agent does. It prints `ACCEPTED` or `REFUSED` with the code. |
| `verify-publication --publication <file> --content <file> --root <file> --library-id <id>` | Check a publication as a Library Installer does. |

`verify` also takes these options: `--tag`, `--server`, `--accept-kinds`, `--second-signer-above`, `--no-second-signer`, `--always-second-signer`, `--forbid-tag-relaxation`, `--lab`, `--revocations` and `--amendment`.
`verify-publication` also takes `--accept-kinds` and `--lab`.

#### The defaults of verify and verify-publication

`verify` and `verify-publication` use the strict defaults, as an agent or a Library Installer with no policy does:

- Only signatures from hardware-backed keys count: `windows-hello`, `passkey`, `security-key` and `vault`.
- A signed amendment cannot relax the tag rule (`verify` only).

So the result is the same as on a reader with no policy.

| Option | Effect |
|---|---|
| `--accept-kinds <kind>,<kind>` | Use these key kinds. The kinds are `software`, `windows-hello`, `passkey`, `security-key` and `vault`. This option wins over the defaults and over `--lab`. |
| `--lab` | Use the lab values: every key kind counts, `software` too. For `verify`, a signed amendment can also relax the tag rule. |
| `--forbid-tag-relaxation` | With `--lab`, keep the tag rule strict. Without `--lab`, it changes nothing. |

Use `--lab` to check an Order or a publication for a lab agent or a lab Library Installer that accepts software keys.
Do not use `--lab` to check work for production computers.
For production, use the defaults, or give the same `--accept-kinds` as the policy of the readers.

Run `greenhold-sign --help` for all options.

## Greenhold.Manager

| Command | Job |
|---|---|
| `event-source create` | Register the event source `Greenhold Manager` in the Application log. Run it elevated. Restart the Manager afterwards. |
| `event-source remove` | Remove the event source. Stop the Manager first. |
| `support-bundle --out <folder> [--log <console capture>]` | Write a redacted bundle for support. It starts no web server. |

## greenhold-library

`greenhold-library` keeps a library in a folder, on a share or in Azure Blob.
It is in the `Greenhold.Library.Cli` folder of the release.
It never signs and holds no key.
`--library` takes a full path, a UNC path or an `https` address.
Run `greenhold-library --help` for all commands.

| Command | Job |
|---|---|
| `create --library <location> [--name <name>] [--installation <id>]` | Make a library. It prints the library ID and the installation ID. On the Greenhold server, it uses the installation of the root that setup holds, and says so. `--installation` names another installation. |
| `pin-root --library <location> [--root <root.public.json>]` | Pin the installation root on this computer. On the Greenhold server, it uses the root that setup holds, and says so. On other computers, `--root` is necessary. |
| `license --library <location>` | Show the license of the library. Without a license, it shows the days left. |
| `license-import --library <location> --file <license>` | Import a license into the library. |
| `add-package --library <location> --package <id> --name <name> [--winget \| --url <address>] [--installer-type <type>]` | Add a package. `--installer-type` picks one installer type when the source offers several. |
| `add-version --library <location> --package <id> --version <v> --file <file>` | Add a version by hand. It becomes a candidate. |
| `show --library <location>` | Show the packages, their versions and their candidates. |
| `refresh --library <location>` | Check the sources, store candidates and write a draft. It never publishes. |
| `draft --library <location> [--ready]` | Write the next draft and print the line to sign it. `--ready` adds the candidates whose cool-off time is over. |
| `publish --library <location> --file <signed file>` | Publish a signed publication. |
| `schedule --library <location> --service [--at <time>]` | Give the library to the refresh service on this server. Run it elevated. |
| `schedule --library <location> --at <time> --account <account>` | Register the refresh as a task in Task Scheduler, as an account that you choose. |
| `issue-read-access --library <address> <writer options> --out <file> [--valid-days 1-7]` | Write a read access for Library Installers on masters. |
| `publish-library-installer --library <location>` | Put the Library Installer set in the library. |
| `event-source create` | Register the event source `Greenhold Library`. |
| `support-bundle --out <folder> [--library <location>]` | Write a redacted bundle for support. |

| Exit code | Meaning |
|---|---|
| 0 | Done. |
| 1 | Refused or failed. The message has a code and a line that says what to do. |
| 2 | The command line is not valid. |
| 4 | A refresh finished, but some packages failed. |
| 5 | A refresh changed nothing, because another run holds the library. |

A command refuses an option that looks like a secret, for example `--password` or `--sas`.
