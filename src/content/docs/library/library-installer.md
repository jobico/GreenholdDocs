---
title: The Library Installer for images
description: Install packages from a library on an image master, without an agent.
---

`Greenhold.LibraryInstaller.exe` installs the packages of a library on the computer where it runs.
It needs no agent.
It runs on .NET Framework 4.7.2, so it needs nothing installed first.
The module `GreenholdLibrary` wraps it for Windows PowerShell 5.1.

```
Greenhold.LibraryInstaller.exe install --package 7zip.7zip --package Posit.RStudio
Greenhold.LibraryInstaller.exe install --all
Greenhold.LibraryInstaller.exe list
```

`install` needs an elevated prompt.
`list` changes nothing.

## What it trusts

It installs only what the signed publication of the library names.
It checks the publication against the installation root that the computer holds.
It never acts on other files in the library.

## Settings

Three settings tell it which library to use and whose signature to trust.
They come from the computer and never from the library.

| Setting | Policy value | Command line | Meaning |
|---|---|---|---|
| Library | `Library` | `--library` | A folder, a UNC path or an Azure Blob address. |
| Library ID | `LibraryId` | `--library-id` | The ID of the library. |
| Root | `Root` | `--root` | The public file of the installation root, on the local disk. |

Each setting comes from the first of these sources that gives it:

1. The policy key `HKLM\SOFTWARE\Policies\Greenhold\LibraryInstaller`. Group Policy or Intune sets it.
2. The command line.
3. The environment, for example `GREENHOLD_LIBRARY_INSTALLER_LIBRARY`.
4. The file `Greenhold.LibraryInstaller.json` beside the program.

The policy key wins.
If another source says something else, the Library Installer refuses to choose.

The root file must be on the local disk.
It must not be on a share, and it must not be inside the library.

## Which keys count

By default, the Library Installer accepts only signatures from hardware-backed keys:
`windows-hello`, `passkey`, `security-key` and `vault`.
It refuses a publication that is signed with a software key.
The agent uses the same default.

A software key is a file in the profile of the administrator.
Malware on that computer can use it to sign.
Use software keys for a lab or a test only.

To accept other key kinds, set `accepted-key-kinds`.
The setting comes from the same sources as the other settings, in the same order:

| Source | Name | Format |
|---|---|---|
| Policy | `AcceptedKeyKinds` (Group Policy: **Accepted signing key kinds** under **Greenhold Library Installer**) | One kind on each line. |
| Command line | `--accepted-key-kinds` | A list with commas, for example `software,windows-hello,passkey,security-key,vault`. |
| Environment | `GREENHOLD_LIBRARY_INSTALLER_ACCEPTED_KEY_KINDS` | A list with commas. |
| File | `acceptedKeyKinds` in `Greenhold.LibraryInstaller.json` | A text value: a list with commas. |

The kinds are `software`, `windows-hello`, `passkey`, `security-key` and `vault`.
Include `software` only on a lab computer.
To check a publication against these defaults before you publish it, use `greenhold-sign verify-publication`.
See [The defaults of verify and verify-publication](/reference/command-line/#the-defaults-of-verify-and-verify-publication).

## Azure Blob

For an Azure Blob library, set `BlobAccess`. See [Azure Blob libraries](/library/azure-blob/).

| Value | Reads as |
|---|---|
| `managed-identity` | The managed identity of the computer. It needs Storage Blob Data Reader on the container. |
| `sas-environment` | The read access in the variable `GREENHOLD_LIBRARY_INSTALLER_SAS`. |
| `sas-file:<full path>` | The read access in that file. Only administrators may open it. |

## How long a publication counts

The Library Installer refuses a publication after its validity ends.
It remembers the highest publication that it accepted.
It refuses an older one afterwards.

A new image master remembers nothing.
Set `--minimum-sequence` to the lowest sequence you accept.
Set `--max-age` to refuse a publication that is older than a given time.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Everything installed or was already installed. |
| 3010 | Installed. A restart is needed. |
| 1641 | Installed. An installer started a restart. |
| 1 | A package failed. The others ran. |
| 2 | The command line is not valid. |
| 3 | The library or the publication could not be read, or the computer is not set up. Nothing installed. |
| 4 | A package that you asked for is not published. |
| 5 | The prompt is not elevated. |

The Library Installer never restarts the computer.
Use your image pipeline for the restart.

## The work folder

The work folder is `%ProgramData%\Greenhold\LibraryInstaller`.
It holds the memory of the publications, the copies, the logs and the results.
Only administrators and SYSTEM may change it.

The Library Installer copies each installer, holds the copy open, checks its hash, and runs the held copy.

By default it keeps logs for 30 days (`log-days`) and results for 90 days (`result-days`).
These periods run only when an install runs.

:::tip
The logs and results name the master.
Delete `logs\` and `results\` in the work folder before you seal and capture the image.
Or set `log-days` and `result-days` to 1 on the master.
:::

## Put the Library Installer in the library

```
greenhold-library publish-library-installer --library <lib>
```

The command puts the Library Installer set in the library.
The set reaches image masters with the next publication that an administrator signs.
