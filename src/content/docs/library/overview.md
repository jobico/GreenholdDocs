---
title: Greenhold Library
description: What Greenhold Library does, where it keeps packages, and which parts of Greenhold use it.
---

Greenhold Library is a signed package library for Windows software.
It keeps installers and the rules to install them.
An administrator signs the list of versions that the library offers.
A computer installs only what that signed list names.

Library is one of two Greenhold products.
The other is [Greenhold Dispatch](/dispatch/overview/).
Library works with Dispatch, and it also works alone.

## What it does

- It finds new versions of your software from WinGet, a fixed URL, or a PowerShell module.
- It downloads them and checks their signatures.
- It writes a draft of the next publication.
- It keeps the files in a folder, on a file share, or in Azure Blob.
- It offers a version to a computer only after an administrator signed it, or after the automatic publisher signed an update that the administrator approved.

## Where it keeps packages

| Place | Address |
|---|---|
| Folder or file share | A full path or a UNC path |
| Azure Blob | `https://<account>.blob.core.windows.net/<container>[/<folder>]` |

## Who uses a library

| User | What it does |
|---|---|
| Agent | Installs a package when a signed Order has an `InstallPackage` Action. See [Install a package on a device](/library/install-a-package/). |
| Library Installer | Installs packages on an image master. It needs no agent. See [The Library Installer for images](/library/library-installer/). |
| Manager | Shows each library: the overview, the draft, the publication and the last refresh. The Manager does not sign. |

:::note
Without a license, you can add at most 5 packages to a library, for 90 days.
After the 90 days, the library refuses new packages, new versions and publications that add versions.
A license removes these limits.
See [Use without a license](/manager/license/#use-without-a-license).
:::

## The command line

The program `greenhold-library` creates a library, adds packages, runs the refresh and publishes.
It never signs and holds no key.
An administrator signs with `greenhold-sign` on their own computer.

## Where to go next

- [Libraries and packages](/library/libraries-and-packages/)
- [Create a library and add a package](/library/create-a-library/)
- [Install a package on a device](/library/install-a-package/)
- [The Library Installer for images](/library/library-installer/)
- [Azure Blob libraries](/library/azure-blob/)
- [The automatic publisher](/library/automatic-publisher/)
