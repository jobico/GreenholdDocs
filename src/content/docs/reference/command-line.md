---
title: Command line
description: The main commands of the gateway, the agent and greenhold-sign.
---

Run the gateway and agent commands in an elevated prompt.

## Greenhold.Gateway

The program is in `C:\Program Files\Greenhold\Gateway`.

| Command | Job |
|---|---|
| `init --dns <name> [--ip <address>] [--accept-license]` | Make the channel authority, the listener certificate and the data folder. Name every host name and address that agents use. |
| `token new --name <machine> [--lifetime <d.hh:mm:ss>]` | Make a one-time enrollment token. |
| `agent list [--wide] [--json]` | List the devices and their connection state. |
| `agent show <device id>` | Show one device. |
| `agent revoke <device id>` | Revoke a device. |
| `license install --file <license> --root <root.public.json>` | Install a license. |
| `license show` | Show the installed license. |
| `database migrate [--connection-file <path>]` | Apply the database migrations. |
| `order add --release <file> --order <file> --content <file>` | Store a signed Release, a signed Order and the scripts. |
| `run list [--limit <n>]` | List the most recent Runs. |
| `run output <order id> [--device <device id>]` | Show what a Run wrote. |
| `audit list` | Show the audit trail. |
| `audit verify` | Check the hash chain of the audit trail. |
| `run` | Run the gateway in the console. Stop the service first. |
| `remove --yes [--delete-logs]` | Delete the authority, the certificates, the data folder and the event source. |
| `support-bundle --out <folder>` | Write a redacted bundle for support. It sends nothing. |

## Greenhold.Agent

The program is in `C:\Program Files\Greenhold\Agent`.

| Command | Job |
|---|---|
| `enroll [--token-file <file>]` | Enroll with a token. Without the option, it reads the token from standard input. |
| `status` | Show the policy, the enrollment and the service. |
| `run` | Run the agent in the console. |
| `install` | Install the Windows service. It does not start it. |
| `uninstall` | Stop and remove the service. |
| `remove-identity --yes` | Delete the key and the folder of the agent. |
| `seal --yes [--offline]` | Prepare a computer for an image. The gateway retires the device. Then the agent removes its keys and identity. |
| `support-bundle --out <folder>` | Write a redacted bundle for support. It sends nothing. |

## greenhold-sign

`greenhold-sign` is in the `Greenhold.SigningTool` folder of the release.
It takes a passphrase from an environment variable, from standard input or from a prompt.
It never takes a passphrase as an argument.

| Command | Job |
|---|---|
| `root-create --installation <id> --out <dir>` | Make the root key (keep it offline) and the public file. |
| `admin-create --admin-id <id> --name <name> --out <dir>` | Make an administrator key and a request. |
| `admin-certify --root <file> --request <file> --kind <kind> --out <file>` | Certify an administrator key with the root. |
| `sign --kind release, order or policy --draft <json> --admin-key <file> --cert <file> --out <file>` | Sign a draft. |
| `hash --file <signed Release>` | Show the hash that an Order names. |
| `verify --order <file> --release <file> --root <file> --device-id <id>` | Check an Order as an agent does. |
| `revoke --root <file> --key-id <id> --out <file>` | Revoke keys or certificates. |
| `key-id --cert <file>` | Show the ID of a certificate key. |

Run `greenhold-sign --help` for all options.
