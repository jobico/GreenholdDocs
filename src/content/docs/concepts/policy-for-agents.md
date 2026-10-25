---
title: Policy for agents
description: The policy values of an agent, where they come from, and what each one does.
---

The **policy** of an agent is a set of values on the computer of the agent.
The agent reads them when it starts.
The server cannot read, set or change them.
This is on purpose.
A person who takes over the server cannot weaken the rules that the agent applies.

An agent that has no usable policy does not run.
An agent with no installation root starts, but it refuses all work.

## Where the policy comes from

The agent reads its policy from this registry key:

```
HKLM\SOFTWARE\Policies\Greenhold\Agent
```

Group Policy or Intune writes the values.
Greenhold provides an administrative template for this: `Greenhold.admx` and `en-US\Greenhold.adml`.
The template stands alone.
It adds the category **Greenhold** to Computer Configuration.

:::caution
Only administrators and SYSTEM may write to the policy keys.
The programs trust what they find there.
:::

### Group Policy

1. Copy `Greenhold.admx` to the central store: `\\<domain>\SYSVOL\<domain>\Policies\PolicyDefinitions`. On one computer, copy it to `C:\Windows\PolicyDefinitions`.
2. Copy `Greenhold.adml` to the `en-US` folder beside it.
3. In the Group Policy Management Editor, open **Computer Configuration > Policies > Administrative Templates > Greenhold**.
4. Set the values. Link the GPO to the computers or to the OU of the image.
5. On an agent computer, run `Greenhold.Agent.exe status`. It shows the policy that the agent read. It stops with exit code 2 and names the value when a value is not usable.

### Intune

Import `Greenhold.admx` and `Greenhold.adml` as an administrative template.
Make a profile with **Imported administrative templates**.
Assign it to a device group.

:::note
Greenhold documents the Intune route from the Microsoft documentation only.
Check it on a test group before you rely on it.
The two list values (`Libraries` and `LibraryMinimumSequence`) may need Group Policy, the image or a script.
:::

### The properties of the agent MSI

The agent MSI can write the five values that a new agent needs.
It can also write the two values that relax the strict defaults.
Use this for a test computer.

| MSI property | Policy value |
|---|---|
| `POLICYENROLLMENTURL` | `GatewayEnrollmentUrl` |
| `POLICYCHANNELURL` | `GatewayChannelUrl` |
| `POLICYCHANNELAUTHORITY` | `ChannelAuthority` |
| `POLICYINSTALLATIONROOT` | `InstallationRootPublicKey` |
| `POLICYINSTALLATIONID` | `InstallationId` |
| `POLICYACCEPTEDKEYKINDS` | `AcceptedKeyKinds`, as a list with commas |
| `POLICYALLOWTAGRELAXATION` | `AllowTagRelaxation`: `1` or `0` |

The installer remembers the values that you give.
It writes them again when you repair or upgrade the agent without properties.
Group Policy that sets the same value overrides them at the next refresh.
Never give an enrollment token as a property.

## The values

### Gateway and trust

| Value | Type | What it does |
|---|---|---|
| `GatewayEnrollmentUrl` | text | The address of the enrollment listener: `https://<name>:8444`. Give the host and the port only. |
| `GatewayChannelUrl` | text | The address of the agent channel: `https://<name>:8443`. The name must be in the listener certificate of the gateway. |
| `ChannelAuthority` | text | The authority certificate of the gateway, as base64 DER. The agent trusts only this certificate for the gateway. It does not use the stores of the computer. |
| `InstallationRootPublicKey` | text | The public key of the installation root. Use the **Policy value** that `greenhold-sign root-create` prints. |
| `InstallationId` | text | The `installationId` from `root.public.json`. Set it when you set the root. Do not set one without the other. |

### Rules for Orders

| Value | Type | Default | What it does |
|---|---|---|---|
| `SecondSignerRule` | 0 or 1 | 1 | Two signers for an Order that targets a server, a tag, or more devices than `SecondSignerAbove`. |
| `SecondSignerAbove` | 1 to 100000 | 25 | The device count above which an Order needs two signers. |
| `AlwaysSecondSigner` | 0 or 1 | 0 | Two signers for every Order. |
| `AcceptedKeyKinds` | list | `windows-hello`, `passkey`, `security-key`, `vault` | The key kinds whose signatures count: `software`, `windows-hello`, `passkey`, `security-key`, `vault`. The default has no `software`. |
| `AllowTagRelaxation` | 0 or 1 | 0 | Whether a signed amendment can make a tag Order follow the device count. |
| `Tags` | list | none | The tags of this computer. An Order for a tag names this computer when it carries the tag. |
| `RunTimeoutMinutes` | 1 to 1440 | 60 | The time that one Run can take. The agent stops a Run that takes longer. |

See [Orders and Releases](/dispatch/orders-and-releases/).

### Strict defaults

An agent without `AcceptedKeyKinds` and `AllowTagRelaxation` uses the strict defaults:

- Only signatures from hardware-backed keys count: Windows Hello, passkey, security key and vault.
- A signed amendment cannot relax the tag rule.

The agent refuses an Order that is signed with a software key.
A key file from Greenhold Admin, a key from `greenhold-sign admin-create` without `--store tpm` or `--store smartcard`, and the key that the setup wizard makes are software keys.

A software key is a file in the profile of the administrator.
Malware on that computer can use it to sign Orders.
Use software keys for a lab or a test only.
Do not use them in production.

To relax the defaults for a lab, do one of these steps:

- Give the properties to the agent MSI:

  ```
  POLICYACCEPTEDKEYKINDS="software,windows-hello,passkey,security-key,vault"
  ```

  Add `POLICYALLOWTAGRELAXATION=1` only if you use signed amendments that relax the tag rule.
- Set the policy **Accepted signing key kinds** with Group Policy or Intune. Type one kind on each line, and include `software`.
- Set the policy **Allow signed amendments to relax the tag rule** to **Enabled** only if you need it.

At the end, the setup wizard shows the command for the agent installer.
Above the command is the box **My administrator's key is a software key (a lab)**.
When you tick it, the command includes `POLICYACCEPTEDKEYKINDS`.
When the wizard made the key on the server, the box is ticked and you cannot clear it.

An agent that has these values in its policy keeps them after an upgrade.
An agent without them uses the strict defaults after an upgrade.

To test an Order against the strict defaults before you send it, use `greenhold-sign verify`.
See [The defaults of verify and verify-publication](/reference/command-line/#the-defaults-of-verify-and-verify-publication).

### Libraries

| Value | Type | What it does |
|---|---|---|
| `Libraries` | list of ID and location | The libraries that an `InstallPackage` Action can use. Each entry has the library ID and a folder or a share. The agent refuses a library that is not in the list. |
| `LibraryMinimumSequence` | list of ID and number | The lowest publication sequence to accept for a library. Use it for an agent that starts with no memory, for example on a new image. |
| `LibraryMaxAgeDays` | 1 to 3660 | The agent refuses a publication that is older than this number of days. |
| `RefuseAutomaticPublications` | 0 or 1 | 1 refuses publications that the automatic publisher signed. The agent then uses the last publication that administrators signed. |

See [Libraries and packages](/library/libraries-and-packages/).

## Other policy keys

Other programs read their own keys:

| Key | Program | Examples of values |
|---|---|---|
| `HKLM\SOFTWARE\Policies\Greenhold\LibraryInstaller` | Library Installer | `Library`, `LibraryId`, `Root`, `MinimumSequence`, `MaxAge`, `Work`, `BlobAccess`, `BlobHostSuffix`, `RefuseAutomaticPublications`, `AcceptedKeyKinds`, `LogDays`, `ResultDays` |
| `HKLM\SOFTWARE\Policies\Greenhold\Library` | Computers that fill a library: `greenhold-library` and the automatic publisher | `OfflineRevocation`, `RefuseAutomaticPublications`, `AllowedInternalAddresses` |

The Library Installer also accepts only hardware-backed keys by default.
See [Which keys count](/library/library-installer/#which-keys-count).

The policy of the Library Installer wins over its command line, its environment and its file.
A value that conflicts is refused.

## What the console warns about

The Manager and the command `agent show` compare the policy that an agent reports with the recommended policy.
They show one warning for each weaker value.
They only warn.
They never refuse an agent.

The recommended policy for production is this:

| Value | Recommended |
|---|---|
| `SecondSignerRule` | On. |
| `AlwaysSecondSigner` | On when more than 25 devices are enrolled. |
| `SecondSignerAbove` | 25 or less. |
| `AcceptedKeyKinds` | Hardware kinds only. Leave out `software`. |
| `AllowTagRelaxation` | Off. |
| `InstallationRootPublicKey`, `InstallationId` | Set. |

:::tip
Set every security value on purpose.
Do not depend on the default of a value.
:::

What an agent reports is its own word.
The agent applies its own policy, whatever it reports.
