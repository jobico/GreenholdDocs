---
title: Before you install
description: Prepare the installation root on an administrator computer.
---

Do these steps on an administrator computer, not on the server.
The server then receives only a public file.

## Install the Admin Tools

Install [Admin Tools](/get-started/admin-tools/) on the administrator computer.
It makes the root and the keys in a window.
The tool `greenhold-sign` does the same on the command line.
The steps below use `greenhold-sign`.

Admin Tools puts `greenhold-sign.exe` in this folder:

```
C:\Program Files\Greenhold\Admin Tools\greenhold-sign
```

Run it in PowerShell from that folder, or give the full path.

## Choose the installation ID

An installation ID names your Greenhold installation.
Choose it when you make the root.
You cannot change it later.

Use a GUID as the installation ID.
A library accepts only an installation ID that is a GUID.
Admin Tools and the setup wizard make a GUID for you.
On the command line, make one with PowerShell:

```powershell
[guid]::NewGuid().ToString()
```

A license is made for one installation ID.
Send the ID to your supplier when you ask for a license.

## Use without a license

You can start without a license.
For 90 days, all functions work within the starter allowance:

- Greenhold Dispatch enrolls up to 5 devices.
- Greenhold Library adds up to 5 packages to a library.

Revoked devices and removed packages stay in the count.

The 90 days start at the first start of the product.
If the installation root is older, the 90 days start at the date of the root.
A new database or a new library for the same root does not start a new period.
If the clock of a computer goes back more than 3 days, the period ends.

After the 90 days, new work stops:

- Greenhold Dispatch stops enrolling devices and refuses new Orders and Releases.
- Greenhold Library refuses new packages, new versions and publications that add versions.

These continue to work:

- Enrolled devices stay connected.
- Releases that are already deployed continue to run.
- You can read, audit, export, revoke devices and send Orders that only seal a device.
- You can clean up a library and use the versions that it already published.

Install a license to continue.
A license restores all functions at once.

### Where you see the days left

- The Manager shows the days left under **Library** and **Dispatch** in the sidebar.
- From 15 days before the end, the Manager shows a notice on every page.
- After the end, the Manager shows a banner. The banner says what stopped and how to request a license.
- `Greenhold.Gateway.exe license show` and `agent list` show the days left.
- `greenhold-library license` shows the days left of a library.
- The gateway and `greenhold-library` write a warning to the Windows Event Log at 15 days, at 1 day and at the end. See [Logs and support bundles](/operate/logs-and-support-bundles/).

To request a license, use [Admin Tools](/get-started/admin-tools/) or the License page of the setup wizard.

## Make the installation root

The installation root is a signing key.
Agents run an Order only when an administrator signed it with a key that the root certified.

1. Make the root on a USB drive:

   ```
   greenhold-sign root-create --installation <id> --out <root folder>
   ```

   You get `root.key.json` and `root.public.json`.
   The command prints the key ID of the root and the policy value for the agents.

2. Make the first administrator key in a folder on your own computer:

   ```
   greenhold-sign admin-create --admin-id admin-01 --name "Administrator 1" --out <key folder>
   ```

   You get `admin.key.json` and `admin.request.json`.
   The command prints the key ID of the administrator key.

3. Certify the administrator key with the root:

   ```
   greenhold-sign admin-certify --root <root folder>\root.key.json --request <key folder>\admin.request.json --kind software --out <key folder>\admin.cert
   ```

   The command shows the key ID in the request.
   Compare it with the key ID of step 2.
   Then confirm.

`greenhold-sign` asks for a passphrase when it needs one.
A passphrase has at least 10 characters.
The tool never takes a passphrase as an argument.
To give it without a prompt, set `GREENHOLD_ROOT_PASSPHRASE` for the root or `GREENHOLD_ADMIN_PASSPHRASE` for an administrator key.
Remove the variables when you are done:

```powershell
Remove-Item Env:GREENHOLD_*_PASSPHRASE
```

Use a pseudonym or a role name for the administrator ID and name.
Do not use a person's name.
Every signature keeps them for good.

:::caution
Keep `root.key.json` offline.
Make a backup of it.
Without it, nobody can sign an Order for this installation again.
Take only `root.public.json` to the server.
:::

## Make a second administrator key

Some Orders need two signers.
By default, an Order for a server needs two.
See [Second signer and tags](/dispatch/second-signer-and-tags/).
The second signer needs a different administrator ID and a different key.

1. The second administrator makes a key on their own computer:

   ```
   greenhold-sign admin-create --admin-id admin-02 --name "Administrator 2" --out <key folder 2>
   ```

2. The second administrator reads the key ID to the root holder, by phone or in person.
3. The root holder certifies the key:

   ```
   greenhold-sign admin-certify --root <root folder>\root.key.json --request <key folder 2>\admin.request.json --kind software --out <key folder 2>\admin.cert
   ```

4. The root holder compares the key ID that the command shows with the key ID that the administrator read.
5. The root holder sends `admin.cert` to the second administrator.

## Next

Read [Install the server](/get-started/install-the-server/).
