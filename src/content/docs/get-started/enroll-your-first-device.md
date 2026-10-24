---
title: Enroll your first device
description: Install the agent, make a token, enroll, and check the result.
---

The last page of the setup wizard shows the command line for the agent installer.
It uses the values of your server.

## 1. Install the agent

On the agent computer, open an elevated prompt.
Run the command that the wizard made:

```
msiexec /i C:\path\Greenhold-Agent-<version>-x64.msi /qn /norestart LICENSEACCEPTED=1 POLICYENROLLMENTURL="https://<name>:8444" POLICYCHANNELURL="https://<name>:8443" POLICYCHANNELAUTHORITY="<base64 DER of channel-authority.cer>" POLICYINSTALLATIONROOT="<policy value of root.public.json>" POLICYINSTALLATIONID="<installation id>" /l*v greenhold-agent-install.log
```

These are the POLICY values:

| Property | Value |
|---|---|
| `POLICYENROLLMENTURL` | `https://<gateway name>:8444` |
| `POLICYCHANNELURL` | `https://<gateway name>:8443` |
| `POLICYCHANNELAUTHORITY` | The gateway authority certificate, as base64 DER |
| `POLICYINSTALLATIONROOT` | The policy value of `root.public.json` |
| `POLICYINSTALLATIONID` | `installationId` from `root.public.json` |

:::caution[A software key needs one more property]
An agent accepts only hardware-backed keys by default: Windows Hello, passkey, security key and vault.
It refuses an Order that is signed with a software key.
The keys of Admin Tools and of the setup wizard are software keys.
For a lab, add this property to the command:

```
POLICYACCEPTEDKEYKINDS="software,windows-hello,passkey,security-key,vault"
```

The wizard adds it when you tick **My administrator's key is a software key (a lab)**.
Do not use software keys in production.
See [Strict defaults](/concepts/policy-for-agents/#strict-defaults).
:::

To get the authority certificate as base64, run this on the server:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes('C:\ProgramData\Greenhold\Gateway\channel-authority.cer'))
```

For many computers, deliver the same values with Group Policy or Intune.

:::note
Never put an enrollment token on a command line.
Every process on the computer can see a command line.
:::

## 2. Make a token

On the server, open an elevated PowerShell:

```powershell
cd "C:\Program Files\Greenhold\Gateway"
.\Greenhold.Gateway.exe token new --name PC-01 > token.txt
```

`--name` is required.
Use a pseudonym or the computer name.
The token is shown once.
It works for one enrollment attempt.
It lasts at most 7 days.
Use `--lifetime` to set a shorter life, for example `--lifetime 2:00:00`.

## 3. Enroll

Move `token.txt` to the agent computer over a protected route.
Enroll with the token on standard input.
Then delete the file:

```powershell
Get-Content token.txt | & "C:\Program Files\Greenhold\Agent\Greenhold.Agent.exe" enroll
Remove-Item token.txt
```

:::tip
Use standard input.
Do not use `--token-file`.
That option deletes its file after enrollment and can fail when it cannot delete.
:::

If enrollment fails, make a new token.
The first attempt uses up a token.

## 4. Check

On the agent computer:

```
Greenhold.Agent.exe status
```

On the server:

```
Greenhold.Gateway.exe agent list
```

The device appears in both places.
The Manager shows it too.
