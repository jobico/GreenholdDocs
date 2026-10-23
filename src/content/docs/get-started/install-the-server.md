---
title: Install the server
description: Install the gateway and the Manager, and connect them with the setup wizard.
---

You install the server in two moves.
First, the installer puts the programs on the computer.
Second, the setup wizard connects them.

The server installer installs these parts:

| Part | Service | Account |
|---|---|---|
| Gateway | `GreenholdGateway` | LocalSystem |
| Manager (web console) | `GreenholdManager` | `NT SERVICE\GreenholdManager` |
| Setup wizard | none | none |

## 1. Prepare PostgreSQL

Do this before you start the wizard.
Your database administrator can do it.

### Install PostgreSQL (quick way)

Skip this step when your database administrator already runs PostgreSQL 18.

:::caution
Production databases usually run on a separate server.
A database administrator runs that server.
Use this quick way for a test server or a small installation only.
:::

```powershell
winget install --id PostgreSQL.PostgreSQL.18 -e --interactive
```

The installer asks you to set the password of the `postgres` superuser.
Type the password in the installer window.
Do not type it on a command line.

After the install:

- The service name is `postgresql-x64-18`. Check it in `services.msc`.
- `psql.exe` is in `C:\Program Files\PostgreSQL\18\bin`. Add this folder to the path for the session:

  ```powershell
  $env:Path += ';C:\Program Files\PostgreSQL\18\bin'
  ```

- A new PostgreSQL has TLS off, and Greenhold refuses it. Turn on TLS as the next section shows.
- The `psql` commands ask for the `postgres` password. Type it at the prompt.

### Turn on TLS

Find the data folder of PostgreSQL:

```
psql -U postgres -c "SHOW data_directory;"
```

In production, use a certificate that the Greenhold server trusts.
Your own certificate authority can issue it.
Put the certificate and its key in the data folder as `server.crt` and `server.key`.
Only the PostgreSQL service account can read the key file.
The name in the certificate must be the name that Greenhold uses to connect.

For a test environment, make a self-signed certificate.
Run this in PowerShell 7 as an administrator.
Set `$data` to the data folder:

```powershell
$name = 'db.example.com'
$key = [Security.Cryptography.RSA]::Create(3072)
$request = [Security.Cryptography.X509Certificates.CertificateRequest]::new("CN=$name", $key, 'SHA256', 'Pkcs1')
$san = [Security.Cryptography.X509Certificates.SubjectAlternativeNameBuilder]::new()
$san.AddDnsName($name)
$request.CertificateExtensions.Add($san.Build())
$certificate = $request.CreateSelfSigned([DateTimeOffset]::UtcNow.AddDays(-1), [DateTimeOffset]::UtcNow.AddYears(1))
Set-Content -LiteralPath "$data\server.crt" -Value $certificate.ExportCertificatePem() -Encoding ascii
Set-Content -LiteralPath "$data\server.key" -Value $key.ExportPkcs8PrivateKeyPem() -Encoding ascii
```

Then turn on TLS and restart PostgreSQL:

```
psql -U postgres -c "ALTER SYSTEM SET ssl = on"
Restart-Service postgresql-x64-18
psql -U postgres -c "SHOW ssl"
```

The last command must show `on`.
The name of the service is in `services.msc`.

In `pg_hba.conf`, allow the Greenhold hosts with `hostssl ... scram-sha-256` only.
Then reload PostgreSQL.

### Choose the TLS check

| Mode | Use |
|---|---|
| `VerifyFull` | Production. It checks the certificate and the name. |
| `Require` | Test environments only. It encrypts. It does not check who the server is. |

Greenhold refuses the modes `Disable`, `Allow` and `Prefer`.

:::caution
Greenhold accepts only SCRAM authentication.
A server that asks for a clear-text password never receives one.
:::

## 2. Prepare the identity provider

The Manager uses OpenID Connect for sign-in.
These steps are for Microsoft Entra ID.

1. In the Entra admin center, select **App registrations**, then **New registration**.
2. Select the platform **Web**.
3. Set the redirect URI to `https://<manager name>:<port>/signin-oidc`.
4. Copy the **Directory (tenant) ID** and the **Application (client) ID**.
5. The authority is `https://login.microsoftonline.com/<tenant id>/v2.0`.
6. Select **Certificates & secrets**, then **New client secret**. Copy the value at once.
7. Select **Token configuration**, then **Add groups claim**, then **Security groups**. Add it to the ID token.
8. Make a security group for the Greenhold administrators. Copy its object ID.

Entra sends group IDs, not names.
Members of this group are Administrators in the Manager.
Other people who sign in see the page "No access".

:::note
The client secret expires.
Make a new secret before the date.
After the date, nobody can sign in.
:::

## 3. Get the Manager certificate

Import a certificate with its private key into **Local Computer > Personal**.
Browsers must trust it.
Your own certificate authority can issue it.
See [Certificates](/concepts/certificates/).

The Manager account must read the private key.
To grant it:

1. Run `certlm.msc`.
2. Right-click the certificate.
3. Select **All Tasks > Manage Private Keys > Add**.
4. Add `NT SERVICE\GreenholdManager` with **Read**.

The setup wizard grants this access for you.

For a test environment only, the wizard can make a self-signed certificate.
Browsers do not trust it.

## 4. Run the installer

Check the files first.
`SHA256SUMS.txt` lists every file of the release:

```powershell
Get-FileHash .\Greenhold-Server-<version>-x64.msi
Get-AuthenticodeSignature .\Greenhold-Server-<version>-x64.msi
```

Double-click `Greenhold-Server-<version>-x64.msi`.
Read the license agreement.
Accept it to continue.
The last dialog offers to start the setup wizard.

For a silent install, run this as an administrator:

```
msiexec /i C:\path\Greenhold-Server-<version>-x64.msi /qn /norestart LICENSEACCEPTED=1 /l*v C:\Windows\Temp\greenhold-server.log
```

Use the full path to the MSI.

The installer does these things:

- It starts no service. The services need setup first.
- It opens no firewall port.
- It makes no certificate and no database.

## 5. Run the setup wizard

Start **Greenhold Server Setup** from the Start menu.
You can run it again at any time.
It shows what is done and changes only what you change.

1. **Before you start.** The wizard checks the requirements. Each line says Ready, Note, Optional or Needed.
2. **Database.** Select *Set it up for me* and give a PostgreSQL account that can create databases and roles. Or select *My database administrator already ran bootstrap.sql* and give the three connection files. The wizard makes a UTF8 database and three roles. It generates a password for each role. It migrates the schema. **Save bootstrap.sql** writes the script for your database administrator.
3. **Agent gateway.** Enter the names and addresses that agents use. Enter the listen address and ports. Choose whether to add a firewall rule. See the next sections.
4. **Installation root.** Select *Import* and give `root.public.json`. Do not give `root.key.json`.
5. **License.** Choose none, a license file, or a request file.
6. **Manager.** Enter the address, the authority, the client ID, the client secret, the administrator group and the certificate.
7. **Review and apply.** The review lists every change. Nothing changes before you select Apply. Then the services start and the health page checks them.

:::caution
The wizard can make the root on the server for a small environment.
Then anyone who takes over the server can sign Orders until the private keys leave it.
Prefer to make the root on an administrator computer.
:::

After the wizard finishes, open the Manager and sign in once.
This proves that the identity provider works.

### Bind addresses

The gateway listens on `127.0.0.1` until you say otherwise.
Agents on other computers cannot connect to it.

| Setting | Value |
|---|---|
| Listen address | `0.0.0.0` for all adapters, or the address of this server |
| Channel port | 8443 |
| Enrollment port | 8444 |

The wizard writes these settings and restarts the gateway.
Check the result:

```powershell
Get-NetTCPConnection -State Listen -LocalPort 8443,8444
```

If the address is `127.0.0.1`, agents on other computers cannot connect.

The name that agents use must resolve to this server.
Test it from an agent computer:

```powershell
Test-NetConnection <name> -Port 8443
Test-NetConnection <name> -Port 8444
```

Both must show `TcpTestSucceeded : True`.

### Firewall and NAT

The installer opens no port.
You decide whether the wizard adds a rule.
The rule admits only the gateway program on ports 8443 and 8444.
Limit it to the subnets of your agents.

To add the rule yourself:

```powershell
New-NetFirewallRule -DisplayName 'Greenhold Agent Gateway' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8443,8444 -Program 'C:\Program Files\Greenhold\Gateway\Greenhold.Gateway.exe' -RemoteAddress 10.20.0.0/16
```

:::note
An agent behind NAT arrives with the address of the NAT router.
Put the router address in the rule.
Do not put the agent subnet in the rule.
:::

Offer only port 8443 to the internet.
Keep port 8444 on the internal network.
Open it only while you enroll devices.
Never offer the Manager to the internet.

### Where the settings of this computer are

| Program | File |
|---|---|
| Gateway | `%ProgramData%\Greenhold\Gateway\appsettings.json` |
| Manager | `%ProgramData%\Greenhold\Manager.appsettings.json` |

An upgrade or an uninstall removes the `appsettings.json` beside the programs.
It never touches these two files.
Restart a service after you change its settings.

## Next

Read [Enroll your first device](/get-started/enroll-your-first-device/).
