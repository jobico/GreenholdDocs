---
title: Create a library and add a package
description: Make a library, pin the root, add a package, refresh, sign the draft and publish it.
---

Do these steps with `greenhold-library` on the refresh computer.
Do the signing on your own computer with `greenhold-sign`.
Run `greenhold-library --help` for every command.

<<<<<<< HEAD
## Before you start

- Get `greenhold-library.exe`. It is in the folder `Greenhold.Library.Cli` of the release. Copy the folder to the refresh computer, for example to `C:\Program Files\Greenhold\Library`. Run the commands from that folder, or give the full path.
- Get `root.public.json` of your installation. On the Greenhold server, it is `C:\ProgramData\Greenhold\Gateway\root.public.json`.
- Check that the installation ID in `root.public.json` is a GUID. A library cannot use an installation ID that is not a GUID. Then make a new root with a GUID as installation ID, and use that root for the library and for the agents.
- For a package from WinGet or a URL, the refresh computer needs internet access.
=======
A library belongs to one installation.
The root of that installation signs it.
>>>>>>> dev/security-batch-2-docs

## 1. Create the library

### With the setup wizard

The setup wizard has a **Library** page.
It comes after the **License** page.

1. Select **Make a Library for this installation**.
2. Type the folder of the Library: a full path or a UNC path. The folder must be empty or hold a Library of this installation.
3. Optionally, type a name.
4. Continue to the review and select Apply.

The wizard makes the Library for the installation of the root from the earlier steps.
It also pins that root on the server.
You do not type an installation ID.
Then continue at [3. Add a package](#3-add-a-package).

The wizard never overwrites a Library:

- If the folder holds a Library of this installation, the wizard only pins the root.
- If the folder holds a Library of another installation, the wizard stops and changes nothing.
- If the folder holds other files, the wizard stops.

The account that runs the wizard needs write access to the folder or the share.
For a local folder, the wizard refuses a link in the path.
It also refuses a folder that an account other than Administrators, SYSTEM or the account that runs the wizard owns.

Make a library on Azure Blob in the Manager. See [Azure Blob libraries](/library/azure-blob/).

### On the command line

```
greenhold-library create --library \\files\library --name "Library"
```

`--library` is a full path or a UNC path.
A relative path is refused.
The command prints the ID of the library and its **installation ID**.

On the Greenhold server, `create` uses the installation of the root that setup holds.
The command prints the installation ID and the key ID that it used.
Compare the key ID with the key ID of the root holder.

Run the command as an administrator on the server.
Other accounts cannot read the root that setup holds.
If the file of that root is not protected, the command ignores it, says why, and continues as on another computer.

On another computer, give the installation ID with `--installation`.
Find it in `root.public.json`, as the value of `installationId`.
The ID is a GUID, for example `6757bb89-1258-40a6-b363-6930cd246c3f`.
`--installation` always wins over the root that setup holds.

Without `--installation` and without the root of setup, the library gets a new installation ID.
Then make a root for that ID.
Nothing can be published until that installation has a root and an administrator key.
Make them with `greenhold-sign root-create --installation <id>`, `admin-create` and `admin-certify`.
See [Before you install](/get-started/before-you-install/) or [Admin Tools](/get-started/admin-tools/).

## 2. Pin the root

The setup wizard does this step when it makes the Library.

On the Greenhold server:

```
greenhold-library pin-root --library \\files\library
```

The command pins the root that setup holds.
It prints the installation ID and the key ID that it used.

On another computer:

```
greenhold-library pin-root --library \\files\library --root root.public.json
```

Get `root.public.json` from the root holder through a channel that the writers of the library cannot change.
`--root` always wins over the root that setup holds.

Compare the key ID that the command prints with the key ID of the root holder.
A root of another installation is refused.

## 3. Add a package

Choose a source for each package.

```
greenhold-library add-package --library <lib> --package 7zip.7zip --name "7-Zip" --winget --installer-type wix
greenhold-library add-package --library <lib> --package Contoso.Tool --name "Tool" --url https://contoso.example/tool.msi --installer-type msi
greenhold-library add-package --library <lib> --package Contoso.Internal --name "Internal tool"
```

| Source | Option | Notes |
|---|---|---|
| WinGet | `--winget` | Reads the signed index of WinGet. `--installer-type` picks one type when the manifest has several. |
| URL | `--url` | The address must be `https`. |
| PowerShell module | Set in the catalog of the library | Evergreen, Nevergreen or VcRedist. |
| None | No option | You add each version by hand. |

:::caution
Evergreen and Nevergreen run code that they fetch.
They run it as the account of the scheduled refresh.
Give that account no other rights.
:::

To add a version by hand:

```
greenhold-library add-version --library <lib> --package Contoso.Internal --version 1.2.0 --file tool.exe --installer-type exe --silent "/quiet"
```

A version that you add by hand is a candidate, like one from a refresh.

## 4. Refresh

```
greenhold-library refresh --library <lib>
```

The refresh checks every source, stores new versions as candidates and checks the signature of each installer.
It writes a draft of the next publication with the candidates that are ready.
A candidate is ready when its cool-off time is over.
A refresh never publishes.

Without a pinned root, the refresh stores candidates and drafts nothing.

To see the packages and their versions:

```
greenhold-library show --library <lib>
```

A package with a new version shows a candidate, for example `7-Zip (7zip.7zip)` with the candidate `26.05`.

:::note
Some WinGet packages offer more than one installer type.
Then the refresh fails with a message such as `7zip.7zip offers 2 matching installers`.
Give `--installer-type` in `add-package`, for example `wix` for an MSI.
:::

To refresh every day, schedule it:

```
greenhold-library schedule --library <lib> --at 02:00 --account <account>
```

Use a group managed service account, or a dedicated account that does nothing else.
The account needs the right "Log on as a batch job".
Never use SYSTEM, your own account or an administrator account.
Run `schedule` in an elevated prompt.

## 5. Draft

```
greenhold-library draft --library <lib> [--ready]
```

The command drafts the next publication from the current one.
`--ready` adds every candidate whose cool-off time is over.
For the first publication, use `--ready`.
It lists every field that differs.
It prints the `greenhold-sign` command to run.
With nothing to change, it drafts a renewal.

The draft is in `<library>\publication\draft.json`.
The content of the draft is in `<library>\publication\content\<sha256>.json`.
The `<sha256>` is the value of `content.hash` in `draft.json`.
To read it in PowerShell:

```powershell
(Get-Content -Raw <library>\publication\draft.json | ConvertFrom-Json).content.hash
```

## 6. Sign

Sign on your own computer:

```
greenhold-sign sign --kind publication --draft <library>\publication\draft.json --content <library>\publication\content\<sha256>.json --library <library> --root root.public.json --state <your folder> --admin-key admin.key.json --cert admin.cert --out publication.signed
```

The tool lists every change and asks you to confirm.
Then it asks for your passphrase.
`--yes` confirms without a question.
`--state` is a folder on your own computer.
Never put it in the library.
It keeps your memory of the publications that you saw.
Add `--first` for the first publication.
`--valid-days` sets the validity: 180 days by default, 366 at most.

For a library on Azure Blob, use the files for signing from the Manager. See [Azure Blob libraries](/library/azure-blob/).

## 7. Publish

```
greenhold-library publish --library <lib> --file publication.signed
```

The command prints the sequence of the publication and the signer, for example `Published publication 1 ... signed by admin-01`.
The command refuses a signature that the pinned root does not vouch for.
It refuses a draft that another publication overtook. Draft again.

Sign a renewal before the validity ends.
A reader stops to accept a publication after its end.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Done. |
| 1 | Refused or failed. The message has a code and a line "What to do". |
| 2 | The command line is not valid. |
| 4 | A refresh ended with packages that failed. |
| 5 | A refresh changed nothing, because another run holds the library. |

Every command takes `--json` for a result that a script can read.
A command never takes a secret as an option.

## Next

- [Install a package on a device](/library/install-a-package/)
- [The automatic publisher](/library/automatic-publisher/)
