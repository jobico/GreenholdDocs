---
title: Run output and retention
description: How the agent runs a script, where the output goes, how to read it, and how long the gateway keeps it.
---

## How the agent runs a script

The agent runs each script with Windows PowerShell 5.1:

```
powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File <script> -Name:value
```

It runs the Actions in order.
It stops at the first Action that does not end with exit code 0.
The whole Run must end within `RunTimeoutMinutes`.
The default is 60 minutes.

A script declares its values in `param()`.
Each value arrives as one string.
It never arrives as code.

## Where the output goes

The agent sends the output to the gateway while the script writes it.
One Run keeps at most 1 Mi characters of output.
The agent keeps output that the gateway cannot take yet.
It sends that output when a session opens again.

## Read the result

Run these commands in an elevated prompt on the gateway computer:

```powershell
.\Greenhold.Gateway.exe run list --limit 50
.\Greenhold.Gateway.exe run output <order id> --device <device id>
```

`run list` shows the state of each Run, the exit code and the refusal code of the agent.
`run output` shows what the Run wrote.
The gateway replaces control characters.
If the output is gone, `run output` says so.

:::caution
The output of a script can hold secrets.
The gateway does not write Run output in its log.
The database keeps the output.
Do not print secrets in a script.
:::

## Retention

The gateway deletes old data by these default periods:

| Setting | Default | What goes |
|---|---|---|
| `--run-output-days` | 90 | The output of a Run, after it finished. |
| `--run-days` | 365 | The Run itself: state, exit code and summary. |

A Run goes only after its Order has expired.
Show the periods and change them with these commands:

```powershell
.\Greenhold.Gateway.exe database retention
.\Greenhold.Gateway.exe database retention set --run-output-days 90 --run-days 365
```

`--run-output-days` is 7 to 3653.
`--run-days` is 30 to 3653 and at least the value of `--run-output-days`.
See [Command line](/reference/command-line/) for the other periods.
