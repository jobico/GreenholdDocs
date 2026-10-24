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

## Choose the installation ID

An installation ID names your Greenhold installation.
Choose it when you make the root.
You cannot change it later.

A license is made for one installation ID.
Send the ID to your supplier when you ask for a license.

:::tip
A license is optional.
Without a license, Greenhold works for 5 devices.
:::

## Make the installation root

The installation root is a signing key.
Agents run an Order only when an administrator signed it with a key that the root certified.

1. Make the root:

   ```
   greenhold-sign root-create --installation <id> --out <folder>
   ```

2. Make the first administrator key:

   ```
   greenhold-sign admin-create --admin-id admin-01 --name "Administrator 1" --out <folder>
   ```

3. Certify the administrator key with the root:

   ```
   greenhold-sign admin-certify --root root.key.json --request admin.request.json --kind software --out admin.cert
   ```

`greenhold-sign` asks for a passphrase when it needs one.
It never takes a passphrase as an argument.

Use a pseudonym or a role name for the administrator ID and name.
Do not use a person's name.
Every signature keeps them for good.

:::caution
Keep `root.key.json` offline.
Make a backup of it.
Without it, nobody can sign an Order for this installation again.
Take only `root.public.json` to the server.
:::

## Next

Read [Install the server](/get-started/install-the-server/).
