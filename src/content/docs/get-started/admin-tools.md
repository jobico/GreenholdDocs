---
title: Admin Tools
description: The program for an administrator's own computer that makes the root and the keys, and writes the license request.
---

Greenhold Admin Tools is a Windows program for **your own computer**.
It is available from version 0.1.3.
Use it before you install the server.

It does these jobs:

- It makes the installation root.
- It makes administrator keys.
- It certifies the keys with the root.
- It revokes keys.
- It writes a license request.

:::caution
Never install Admin Tools on the Greenhold server.
The root and the keys must not be on a computer that other people can use.
:::

## Install

Download `Greenhold-AdminTools-<version>-x64.msi`.
It is a separate file from the server installer.
It installs for all users of the computer.
It adds one Start menu shortcut.
It adds no service, no firewall rule and no change to PATH.
It also installs `greenhold-sign.exe`.

Only an administrator of the computer can install it.
You do not need administrator rights to use it.

Remove it in Windows Settings.
Your root, keys, certificates and requests stay.
They are your files.

## The steps

The Home page of the program shows the steps in order.

### 1. Make the installation root

Open **Installation root**.
The page makes your installation ID.
Your license is for this ID.

1. Type a passphrase of at least 10 characters twice. Nobody can reset it.
2. Choose a folder on a USB drive. Keep the drive offline and make a second copy.
3. Choose **Make the root**.

You get two files:

- `root.key.json` is the private key, encrypted with your passphrase. It stays offline.
- `root.public.json` is the public part. The server and the agents use it. It holds no secret.

The page shows the key ID of the root and the policy value for the agents.
The program never overwrites a root or a key.

### 2. Request a license

Open **License request**.
The page reads the installation ID from `root.public.json`.

1. Choose the products.
2. Type the number of devices.
3. Choose **Trial** or **License**.
4. Choose **Save request file** and send the file to your supplier.

The file holds no personal data.
You get a license file back.
Without a license, Greenhold works for 90 days, with up to 5 devices and 5 packages.
A trial file works for the period that it states.
See [Use without a license](/get-started/before-you-install/#use-without-a-license).

### 3. Make an administrator key

Open **Administrator keys** and choose **Make a key**.

1. Type an ID that is a role, such as `release-admin-1`, and a name. Do not use the name of a person. Every signature keeps them.
2. Type a passphrase twice. You type it each time you sign.
3. Choose a folder on your own computer. Do not use the drive of the root.

You get `<id>.key.json` and `<id>.request.json`.
The key file stays with you.
Send the request file to the root holder.

The page shows your key ID in large type.
Read it aloud to the root holder, by phone or in person.
Do not use email or chat.

### 4. Certify the key

The root holder does this step with the USB drive.

1. Open **Administrator keys**. Choose **Certify** on the key that waits.
2. Compare the key ID in the request with the key ID that the administrator reads aloud.
3. If they are the same, tick **The key IDs are the same**.
4. Choose how long the certificate is valid: 1 to 6 months.
5. Type the passphrase of the root and choose **Certify with the root**.

The certificate is a `.cert` file with no secret in it.
Send it to the administrator.

### Renew and revoke

The list shows the status of each key: waiting, certified, expires soon, expired, or revoked.

- **Renew** certifies the same key again. The key ID does not change.
- **Revoke** makes the root sign the next revocation list. Each list holds all keys of the earlier lists.

Admin Tools does not yet give the revocation list to the agents.

## What the program keeps

- It keeps your passphrase only while you press the button.
- It writes no log.
- It keeps the names of the last folders in your profile. Nothing else.
- It makes key files that only you and administrators can read.

## Not yet

- Signing a Release or an Order in the window. Use `greenhold-sign sign`.
- Windows Hello and security keys.

## The same, on the command line

`greenhold-sign` does the same jobs on the command line.
Use it in scripts.
Files from one tool work in the other.

| In the window | `greenhold-sign` |
|---|---|
| Make the root | `root-create --installation <id> --out <folder>` |
| Make a key | `admin-create --admin-id <id> --name "<name>" --out <folder>` |
| Certify | `admin-certify --root root.key.json --request <id>.request.json --kind software --out <id>.cert` |
| Revoke | `revoke --root root.key.json --key-id <id> --out revocations.txt` |

`greenhold-sign` also signs Releases, Orders and publications.
A passphrase is never an option.
Set `GREENHOLD_ROOT_PASSPHRASE` or `GREENHOLD_ADMIN_PASSPHRASE`, or type it when asked.

## Next

Read [Before you install](/get-started/before-you-install/).
