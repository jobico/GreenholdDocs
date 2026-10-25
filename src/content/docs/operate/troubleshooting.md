---
title: Troubleshooting
description: The problems that are common in a first installation, each with the check and the fix.
---

Run the gateway and agent commands in an elevated prompt.
Each problem below has the symptom, a check and a fix.

## PostgreSQL has TLS turned off

**Symptom.** The setup wizard or the gateway refuses the database.
A new PostgreSQL on Windows has `ssl = off`.
Greenhold refuses a database without TLS.

**Check.**

```
psql -U postgres -c "SHOW ssl;"
```

The result must be `on`.

**Fix.**

1. Put `server.crt` and `server.key` in the data folder of PostgreSQL. Find the folder with `psql -U postgres -c "SHOW data_directory;"`.
2. Run `psql -U postgres -c "ALTER SYSTEM SET ssl = on"`.
3. Restart the PostgreSQL service.
4. Run `SHOW ssl;` again.

For a test environment, set the TLS check in the wizard to `Require`.
For production, use a certificate that the Greenhold server trusts and the check `VerifyFull`.
See [Install the server](/get-started/install-the-server/).

Greenhold also needs `password_encryption = 'scram-sha-256'`.
It refuses a server that asks for a clear-text password.

## The gateway listens on 127.0.0.1 only

**Symptom.** Agents on other computers cannot connect.
`Test-NetConnection` from an agent computer fails.

**Check.** Run this on the server:

```powershell
Get-NetTCPConnection -State Listen -LocalPort 8443,8444
```

The local address `127.0.0.1` means that only this computer can connect.

**Fix.**

1. Open **Greenhold Server Setup**.
2. In the gateway step, set the listen address to `0.0.0.0`, or to the address of the server.
3. Apply. The wizard writes the settings and restarts the gateway.
4. Run the check again.

To do it by hand, set these four values in `%ProgramData%\Greenhold\Gateway\appsettings.json`.
Then restart `GreenholdGateway`.

```json
{
  "Gateway": { "EnrollmentBindAddress": "0.0.0.0", "EnrollmentAllowAllInterfaces": true },
  "ChannelListener": { "BindAddress": "0.0.0.0", "AllowAllInterfaces": true }
}
```

## The firewall or NAT blocks the agents

**Symptom.** The gateway listens on the right address, but agents cannot connect.

**Check.** Run this on an agent computer:

```powershell
Test-NetConnection <gateway name> -Port 8443
Test-NetConnection <gateway name> -Port 8444
```

Both must show `TcpTestSucceeded : True`.
On the server, look for the rule:

```
netsh advfirewall firewall show rule name="Greenhold Agent Gateway"
```

**Fix.**

- The installer opens no port. Add a rule for the gateway program on ports 8443 and 8444:

  ```powershell
  New-NetFirewallRule -DisplayName 'Greenhold Agent Gateway' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8443,8444 -Program 'C:\Program Files\Greenhold\Gateway\Greenhold.Gateway.exe' -RemoteAddress <agent subnets>
  ```

- An agent behind NAT arrives with the address of the NAT router. Put the router address in `-RemoteAddress`. Do not put the subnet of the agent there.
- The name that agents use must resolve to the server. It must also be one of the `--dns` or `--ip` values of `init`. A missing name is a TLS failure that looks like a network fault.

## msiexec stops with error 2203

**Symptom.** `msiexec` shows error 2203, or 1619.
The MSI file was not found.

**Check.** The path is wrong. The MSI is not wrong.

**Fix.** Give the full path to the MSI:

```
msiexec /i C:\path\Greenhold-Agent-<version>-x64.msi /qn /norestart LICENSEACCEPTED=1 /l*v greenhold-agent-install.log
```

## msiexec stops with error 1603

**Symptom.** The install stops with 1603 and changes nothing.

**Check.** Read the log from `/l*v`. Search for `return value 3`. Two causes are common.

| Cause | Fix |
|---|---|
| The license is not accepted. A silent install needs `LICENSEACCEPTED=1`. | Add `LICENSEACCEPTED=1` in capitals. Windows Installer does not honor lower case here. |
| You install an older version over a newer one. | Uninstall the newer version. Then install the older one. |

## `token new` asks for a name

**Symptom.** `Greenhold.Gateway.exe token new` stops and asks for `--name`.

**Fix.** Always give `--name`. Use a pseudonym or the name of the computer:

```powershell
.\Greenhold.Gateway.exe token new --name PC-01 > token.txt
```

The token is shown once.
It works for one enrollment attempt.
It lasts at most 7 days.

## Enrollment fails

**Symptom.** `Greenhold.Agent.exe enroll` fails, or the device is not in `agent list`.

**Check.**

```
Greenhold.Agent.exe status
```

Check that the policy is complete. Check the connection to port 8444.
After enrollment, `status` shows `Connected: yes`. If it shows `no`, it says why, and when the gateway last answered.
The `Agent log` line shows where the log is.

**Fix.**

- Give the token on standard input. Do not use `--token-file`. That option deletes its file after enrollment and can fail when it cannot delete.

  ```powershell
  Get-Content token.txt | & "C:\Program Files\Greenhold\Agent\Greenhold.Agent.exe" enroll
  Remove-Item token.txt
  ```

- The first attempt uses up the token, whatever the result. After a failure, make a new token.
- Never put a token on a command line.
- The device must have the five policy values. See [Policy for agents](/concepts/policy-for-agents/).

## The agent service does not start

**Symptom.** After 30 seconds, Windows logs the errors 7000 and 7009 for `GreenholdAgent`.
The service stays stopped.

**Check.**

```
Greenhold.Agent.exe status
```

**Fix.** Set the policy first. A service with no usable policy does not answer the Service Control Manager.
Then put the token in `%ProgramData%\Greenhold\Agent\enrollment-token` and run `Start-Service GreenholdAgent`.

## The Manager shows a 503 page

**Symptom.** Every address of the Manager shows one page with the status 503.

**Meaning.** Sign-in is not complete.
The page names the settings that are missing.
It never prints a value.

**Check.** Read the page. Compare the names with the settings file:

```
%ProgramData%\Greenhold\Manager.appsettings.json
```

**Fix.** Set the missing items. They are the authority, the client ID, the secret, and the administrator group.
Restart `GreenholdManager`.
You can also run **Greenhold Server Setup** again and apply the Manager step.

## The client secret expired

**Symptom.** Nobody can sign in to the Manager.

**Cause.** A client secret of the identity provider has an end date. After that date, nobody can sign in.

**Fix.**

1. In the Entra admin center, make a new client secret for the app registration.
2. Write the new value in the secret file that `Manager:Identity:ClientSecretFile` names. Only administrators, SYSTEM and `NT SERVICE\GreenholdManager` can open this file.
3. Write the expiry date of the new secret in `Manager:Identity:ClientSecretExpires`, as `yyyy-MM-dd`. Or run the setup wizard again and type the date on the Manager page.
4. Restart the service:

   ```powershell
   Restart-Service GreenholdManager
   ```

:::tip
With the expiry date, the Manager warns you 30 days before the date.
See the card **Sign-in secret** on the status page, and the events 5501 to 5503.
See [The expiry date of the secret](/get-started/install-the-server/#the-expiry-date-of-the-secret).
:::

## The gateway does not start

**Symptom.** `GreenholdGateway` stops soon after it starts.

**Check.** Stop the service. Run the gateway in the console to see the message:

```powershell
Stop-Service GreenholdGateway
cd "C:\Program Files\Greenhold\Gateway"
.\Greenhold.Gateway.exe run
```

Exit code 2 is common. These are the causes:

| Message | Fix |
|---|---|
| The database cannot be reached, or the connection asks for something other than TLS and SCRAM. | Check the connection file and the database. |
| The schema version is not the one that this build expects. | Run the database migrations. See [Upgrade Greenhold](/operate/upgrade-greenhold/). |
| A data folder or a connection file that other users can open. | Remove the access of other users. For a file, run `icacls <file> /inheritance:r`. Then grant access to administrators and SYSTEM. |
| The gateway is not initialised. | Run `init`. See [Install the server](/get-started/install-the-server/). |

The two programs use the same ports.
Start the service again after your check.

## A device is revoked or its certificate expired

**Symptom.** An agent does not connect.
`agent list` shows `revoked` or the agent has stopped.

**Cause.** There are four causes: you revoked the device, the gateway suspected a clone, the agent was sealed for an image, or the certificate of the agent expired.

**Fix.** There is no way to restore a revoked device.
Enroll the computer again:

1. On the agent computer, run `Greenhold.Agent.exe remove-identity --yes`.
2. Make a new token on the server.
3. Enroll with the token on standard input.

The computer becomes a new device.
Always seal an image before you capture it.
A clone of an unsealed image is refused.

## The agent refuses an Order with code 14

**Symptom.** `run list` shows refusal code 14 for an Order.

**Cause.** The policy of the agent does not accept the kind of the signing key.
By default, an agent accepts only hardware-backed keys.
A key file from Greenhold Admin or `greenhold-sign admin-create` is a software key. A key in the TPM or on a security key is not.

**Fix.** For a lab, add `software` to `AcceptedKeyKinds`.
The value replaces the default list. It does not add to it. Give the full list, on the device, as administrator:

```powershell
New-ItemProperty -Path HKLM:\SOFTWARE\Policies\Greenhold\Agent -Name AcceptedKeyKinds -PropertyType MultiString -Value software,windows-hello,passkey,security-key,vault -Force
Restart-Service GreenholdAgent
```

A refused Order stays refused. Send the job again.
See [Strict defaults](/concepts/policy-for-agents/#strict-defaults).
For production, sign with a hardware-backed key.

## A job waits for the library

**Symptom.** A job that installs a package does not run on a device.
In the Manager, the device's Run shows **Waiting for the library** and "Waiting: the device cannot reach the library at" the library's path.
`%ProgramData%\Greenhold\Agent\agent.log` shows `LibraryUnreachableException` with the library path.

**Cause.** The agent reads the library from the path in its `Libraries` policy, as SYSTEM.
The device cannot open that path. Examples: the path is a folder on the server, not on the device.
Or the device is not in the domain of the server, so it has no account for the share.

**Fix.**

| Device | Fix |
|---|---|
| In the same domain as the library | Share the library folder. Give the computer account of the device (`DOMAIN\NAME$`) or a group of devices read access. Set the `Libraries` value of the device to the UNC path. |
| Not in the domain | Copy the library folder to the device. Set the `Libraries` value to that folder. The copy is safe: the agent checks each file against the signed publication. The agent does not read a library from Azure Blob yet. |

Then run `Restart-Service GreenholdAgent`. The agent takes the job again within 30 minutes.
When the device can read the library, the Run starts and the waiting message goes away.
A later version of Greenhold delivers the package files through the gateway, so a device does not need access to the library.

## A package install fails with 1303 or 1603

**Symptom.** A Run fails with exit code 1603. The Run's output shows the lines of the installer log around the action that failed, and each error line.
One of them is `Error 1303. The installer has insufficient privileges to access this directory`, for example `C:\Program Files\7-Zip`.
The folder does not exist, and an administrator can make folders in `C:\Program Files`.

The whole installer log stays on the device for 14 days, in `%ProgramData%\Greenhold\Agent\run-logs`.
The Run's summary names the folder.

**Cause.** Software on the device blocks the folders of that app. Common examples:

- FSLogix App Masking: a rule hides the app's folders. Hidden folders cannot be made, also not by SYSTEM.
- Ivanti Application Control or Workspace Control: a rule blocks the app.

**Check.** On the device, as administrator:

```powershell
Select-String -Path 'C:\Program Files\FSLogix\Apps\Rules\*.fxr' -Pattern '7-Zip' -SimpleMatch -Encoding Unicode
```

**Fix.** Remove the rule (the `.fxr` file and its `.fxa` file), or change it so that it does not apply to SYSTEM. Then send the job again.

## New work stops after 90 days

**Symptom.** The gateway refuses to enroll a device or to store a new Order.
Or `greenhold-library` refuses a new package or a publication.
The message says that the free period is over.

**Cause.** No license is installed, and the 90 days without a license are over.

**Fix.** Request a license with Greenhold Admin, the setup wizard or the License page of the Manager.
Install it on the server with `Greenhold.Gateway.exe license install`, or in the setup wizard.
Import it in a library with `greenhold-library license-import --library <location> --file <license>`.
A license restores all functions at once.
See [Use without a license](/manager/license/#use-without-a-license).
