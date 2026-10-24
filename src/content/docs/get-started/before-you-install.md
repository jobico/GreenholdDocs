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
