---
title: Create a library and add a package
description: Make a library, pin the root, add a package, refresh, sign the draft and publish it.
---

Do these steps with `greenhold-library` on the refresh computer.
Do the signing on your own computer with `greenhold-sign`.
Run `greenhold-library --help` for every command.

## 1. Create the library

```
greenhold-library create --library \\files\library --name "Library"
```

`--library` is a full path or a UNC path.
A relative path is refused.
The command prints the ID of the library and its **installation ID**.

Nothing can be published until that installation has a root and an administrator key.
Make them with `greenhold-sign root-create --installation <id>`, `admin-create` and `admin-certify`.
See [Before you install](/get-started/before-you-install/) or [Admin Tools](/get-started/admin-tools/).

## 2. Pin the root

```
greenhold-library pin-root --library \\files\library --root root.public.json
```

Get `root.public.json` from the root holder through a channel that the writers of the library cannot change.
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
It lists every field that differs.
It prints the `greenhold-sign` command to run.
With nothing to change, it drafts a renewal.

## 6. Sign

Sign on your own computer:

```
greenhold-sign sign --kind publication --draft <library>\publication\draft.json --content <library>\publication\content\<sha256>.json --library <library> --root root.public.json --state <your folder> --admin-key admin.key.json --cert admin.cert --out publication.signed
```

The tool lists every change before it asks for your passphrase.
`--state` is a folder on your own computer.
It keeps your memory of the publications that you saw.
Add `--first` for the first publication.
`--valid-days` sets the validity: 180 days by default, 366 at most.

For a library on Azure Blob, use the files for signing from the Manager. See [Azure Blob libraries](/library/azure-blob/).

## 7. Publish

```
greenhold-library publish --library <lib> --file publication.signed
```

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
