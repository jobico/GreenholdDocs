---
title: Azure Blob libraries
description: Keep a library in an Azure Blob container, what to set up in Azure, and what is not supported yet.
---

A library can live in an Azure Blob container, or in a folder of one:

```
https://<account>.blob.core.windows.net/<container>[/<folder>]
```

The layout is the same as on a share.
The signed publication decides what a reader accepts.
Storage access decides who can read and change the files.

## What you need in Azure

| Item | Why |
|---|---|
| A storage account (StorageV2) without a hierarchical namespace. Turn **account key access off**, anonymous access off. Use https only and TLS 1.2. | Holds the container. Greenhold never uses an account key. |
| A private container | Holds the library. |
| An Entra ID app registration for the writer, with a certificate in `LocalMachine\My` whose private key is not exportable | The command line and the scheduled refresh sign in with it. A machine in Azure can use its managed identity instead. |
| **Storage Blob Data Contributor** on the container, for the writer | Reads and writes the library. |
| **Storage Blob Delegator** on the storage account, for the writer | Only to issue read access for image masters. |
| **Storage Blob Data Reader** on the container, for the managed identity of each image master | Only for masters that run in Azure. |

A role assignment can take several minutes.
Until then, every request fails with `403 AuthorizationPermissionMismatch`.

## The writer

```
greenhold-library <command> --library https://<account>.blob.core.windows.net/<container>/<folder> --tenant-id <tenant> --client-id <app> --certificate-thumbprint <thumbprint>
greenhold-library <command> --library https://<account>.blob.core.windows.net/<container> --managed-identity system
```

The three values of the certificate are identifiers, not secrets.
They can also be environment variables:
`GREENHOLD_LIBRARY_BLOB_TENANT_ID`, `GREENHOLD_LIBRARY_BLOB_CLIENT_ID` and `GREENHOLD_LIBRARY_BLOB_CERTIFICATE_THUMBPRINT`.

`--managed-identity` is `system`, or the client ID of a user-assigned identity.
The identity of an Azure VM works through its instance metadata service.

Without one of these, the command refuses a Blob library.
Greenhold never takes an account key, an SAS or a client secret as an option.
It refuses an address with a query string.

The scheduled refresh works the same way.
`greenhold-library schedule` puts the writer options in the task.
For a certificate, it gives the account of the task read access to the private key file and nothing more.
A key in a TPM or a smart card needs manual access in `certlm.msc`.

### Another cloud

The address must end in `.blob.core.windows.net`.
For a sovereign cloud, give its suffix with `--blob-host-suffix`, for example `.blob.core.usgovcloudapi.net`.
A certificate signs in at `https://login.microsoftonline.com`.
For another Entra ID cloud, use `--authority-host`:
`https://login.microsoftonline.us` or `https://login.chinacloudapi.cn`.

## Image masters: read access

A Library Installer only reads.
It has two ways to get in:

1. **A managed identity** for a master in Azure. Give it Storage Blob Data Reader on the container. Set `BlobAccess` to `managed-identity`. No secret is on the computer.
2. **A read access** for any other master. Make it with:

   ```
   greenhold-library issue-read-access --library <address> <writer options> --out <file> [--valid-days 1-7]
   ```

   The read access reads only, uses `https` only, and lasts one to seven days.
   The command writes it to a new file that only administrators and SYSTEM can read.
   Give the file to the master through a channel that only administrators reach.
   Set `BlobAccess` to `sas-file:<full path>`, or put the read access in the secret variable `GREENHOLD_LIBRARY_INSTALLER_SAS` and set `BlobAccess` to `sas-environment`.

The Library Installer refuses a read access that can do more than read, that is for one blob, that allows plain http, that is signed with the account key, that has expired, or that lasts more than seven days.

To end every read access that you issued, revoke the delegation keys of the account:

```
az storage account revoke-delegation-keys
```

Keep read accesses short.

## What each way gives

Every way keeps the integrity of the library.
A reader accepts a file only when the signed publication names it and its hash matches.
The ways differ in who can read the files:

| | Who can read the library | Secret on the master |
|---|---|---|
| Managed identity | Only identities with Storage Blob Data Reader | None |
| Read access | Whoever holds the file or variable, until it ends | Yes |

Greenhold does not offer anonymous read.

## Not supported yet

- An account key, an account SAS, a client secret and anonymous read.
- A storage account with a hierarchical namespace (Data Lake Storage).
- The managed identity of an Arc-enabled server, of App Service and of a workload identity.
- The interactive sign-in of an administrator for the command line.
- Reading an Azure Blob library from the agent. Agents read a folder or a share.
- Export of an Ivanti building block for a Blob library.
- `greenhold-sign` does not read a Blob library directly. Use the files for signing from the Manager.
