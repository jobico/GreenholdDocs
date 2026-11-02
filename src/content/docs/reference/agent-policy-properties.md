---
title: Agent policy properties
description: All 16 POLICY properties of the agent installer. For each one, its registry value, its form, its default and what it does. Also the rules for upgrade, repair and uninstall, and the Install the agent page of the Manager.
---

The agent installer has 16 `POLICY...` properties.
Each one writes one policy value for the agent.
They are for a test computer or a small site.
For many computers, set the policy with Group Policy or Intune.
See [Policy for agents](/concepts/policy-for-agents/).

This page is for version 0.1.8.
For the other properties and the `msiexec` switches, see [Installer properties](/reference/installer-properties/).

:::danger[Never put an enrollment token on the command line]
There is no property for the enrollment token.
Every process on the computer can see a command line, and the installer log keeps it.
See [Enroll your first device](/get-started/enroll-your-first-device/#3-enroll).
:::

## The rules

- **A value is written only when it is given.** The installer writes nothing for a property that you do not give. The agent then uses its own default.
- **A value is remembered.** The installer keeps a copy of each value that it writes.
- **An upgrade or a repair keeps the value that Group Policy holds at that moment.** The installer does not write the remembered value over it. See [Upgrade and repair](#upgrade-and-repair).
- **The installer does not put back a value that was removed.** It forgets that value.
- **Uninstall removes the values.** Group Policy writes them again at its next refresh.
- **Group Policy and Intune win.** Their value replaces the value of the installer at their next refresh.

Every value is written as text (`REG_SZ`) in this key:

```
HKLM\SOFTWARE\Policies\Greenhold\Agent
```

This is the key that Group Policy and Intune write.
The agent reads the text in the same way as the number or the list that Group Policy writes.
A value that the agent cannot read stops the agent at start. The agent log names the value.

An empty property counts as not given.
You cannot remove a value with an empty property.
Put a value in double quotes when it has a space or a semicolon.

## The 16 properties

### The gateway and the trust

| Property | Registry value | Form | Default | What it does |
|---|---|---|---|---|
| `POLICYENROLLMENTURL` | `GatewayEnrollmentUrl` | `https://<name>:<port>` | None | The address of the enrollment listener. The usual port is 8444. |
| `POLICYCHANNELURL` | `GatewayChannelUrl` | `https://<name>:<port>` | None | The address of the agent channel. The usual port is 8443. The name must be one that the gateway certificate holds. |
| `POLICYCHANNELAUTHORITY` | `ChannelAuthority` | Base64 of a DER certificate | None | The authority certificate of the gateway. The agent trusts only this certificate for the gateway. |
| `POLICYINSTALLATIONROOT` | `InstallationRootPublicKey` | `alg:base64` entries, separated by semicolons | None | The public keys of the installation root. Use the **Policy value** that `greenhold-sign root-create` prints. |
| `POLICYINSTALLATIONID` | `InstallationId` | Text, at most 128 characters | None | The ID of the installation. Use `installationId` from `root.public.json`. |

- Give the root and the installation ID together, or give neither. The agent refuses one without the other.
- An agent without a root starts, but it refuses all work.
- An address has the host and the port only. The agent refuses `http`, a path, a query, a fragment and a user name.
- The authority must be a CA certificate, and it must not contain a private key.
- For the details and the commands that get these values, see [Installer properties](/reference/installer-properties/#the-policy-properties).

### Rules for Orders

| Property | Registry value | Form | Default | What it does |
|---|---|---|---|---|
| `POLICYACCEPTEDKEYKINDS` | `AcceptedKeyKinds` | List of key kinds, separated by commas | `tpm`, `passkey`, `security-key`, `vault` | The kinds of administrator key whose signatures count. The kinds are `software`, `tpm`, `passkey`, `security-key` and `vault`. The value replaces the whole list. |
| `POLICYALLOWTAGRELAXATION` | `AllowTagRelaxation` | `0` or `1` | `0` | `1` lets a signed amendment make an Order for a tag follow the device count. |
| `POLICYSECONDSIGNERRULE` | `SecondSignerRule` | `0` or `1` | `1` | `1`: an Order for a server, a tag, or more devices than `POLICYSECONDSIGNERABOVE` needs two signers. |
| `POLICYALWAYSSECONDSIGNER` | `AlwaysSecondSigner` | `0` or `1` | `0` | `1`: every Order needs two signers. |
| `POLICYSECONDSIGNERABOVE` | `SecondSignerAbove` | A number, 1 to 100000 | 25 | The device count above which an Order needs two signers. |
| `POLICYTAGS` | `Tags` | Tags, separated by commas. Each tag has at most 128 characters and no control characters. | None | The tags of this computer. An Order for a tag names this computer when it has the tag. |

- Without `POLICYACCEPTEDKEYKINDS`, the agent refuses a signature by a software key. A software key is a file in the profile of the administrator. Malware on that computer can use it to sign Orders. Accept it for a lab only.
- Give every kind that you accept in `POLICYACCEPTEDKEYKINDS`. With `software` alone, the agent refuses an Order that a TPM key signed.
- A kind that the agent does not know stops the agent at start. A list with no kind stops it too.
- `POLICYALLOWTAGRELAXATION=1`, `POLICYSECONDSIGNERRULE=0` and a `POLICYSECONDSIGNERABOVE` above 25 make the rules weaker than the defaults.

See [Second signer and tags](/dispatch/second-signer-and-tags/).

### Runs, libraries and logs

| Property | Registry value | Form | Default | What it does |
|---|---|---|---|---|
| `POLICYRUNTIMEOUTMINUTES` | `RunTimeoutMinutes` | A number, 1 to 1440 | 60 | The time in minutes that one Run can take. The agent stops a Run that takes longer. |
| `POLICYLIBRARYMAXAGEDAYS` | `LibraryMaxAgeDays` | A number, 1 to 3660 | No limit | The agent refuses a library publication that is older than this number of days. |
| `POLICYREFUSEAUTOMATICPUBLICATIONS` | `RefuseAutomaticPublications` | `0` or `1` | `0` | `1`: the agent reads only what administrators signed. It refuses automatic library publications. |
| `POLICYFAILEDRUNLOGDAYS` | `FailedRunLogDays` | A number, 1 to 365 | 14 | The number of days that the agent keeps the logs of a failed Run. |
| `POLICYFAILEDRUNLOGCOUNT` | `FailedRunLogCount` | A number, 1 to 1000 | 20 | The largest number of failed Runs whose logs the agent keeps. It keeps the newest. |

A value outside its range stops the agent at start.
`Greenhold.Agent.exe status` names the value.

### A value that has no property

`LibraryMinimumSequence` has no installer property.
It is one value for each library, and Group Policy writes it as a list.
Set it with Group Policy, Intune or the registry.
See [Policy for agents](/concepts/policy-for-agents/#the-values).

## Where the installer remembers the values

The installer keeps a copy of each value that it writes in its own key:

```
HKLM\SOFTWARE\Greenhold\Installer\Agent
```

The name of the copy is `Policy` followed by the name of the registry value.
For example, `POLICYTAGS` is remembered as `PolicyTags`, and `POLICYENROLLMENTURL` as `PolicyEnrollmentUrl`.
The installation root is remembered as `PolicyInstallationRoot`.

## Upgrade and repair

An upgrade or a repair without a property does this for each value that the installer wrote before:

1. It reads the value that is in `HKLM\SOFTWARE\Policies\Greenhold\Agent` now.
2. When nobody changed the value, the installer writes it again. It is the remembered value.
3. When Group Policy changed the value, the installer keeps the value of Group Policy as it is. A number stays a number.
4. When the value is gone, the installer does not write it again, and it forgets the value. This is also true when you deleted the value by hand. To write it again, give its property again.

Other rules:

- A property that you give replaces that one value. The installer keeps the other values.
- A value that only Group Policy wrote is not taken over by the installer.
- `LICENSEACCEPTED` and `STARTSETUP` are not remembered. Give them again for each install.

## Uninstall

The uninstall removes the values that the installer wrote or kept.
This is also true when Group Policy changed them since.
It also removes the remembered values.

Group Policy writes its values again at its next refresh.
Run `gpupdate /force` to apply the policy at once.
Until then, an agent that you install again without `POLICY...` properties has no address and no root, and it does not start.

For a computer that gets its policy from Group Policy or Intune, install the agent without `POLICY...` properties.

## The Install the agent page of the Manager

The Manager can make the install command for you.
Open **Dispatch > Devices > Install the agent**.
Only administrators can open it.

**What the Manager fills in**

- The addresses of the gateway. You can change them on the page, for example to use another DNS name.
- The authority certificate of the gateway.
- The installation root and the installation ID.

The Manager takes the authority and the root only from the files that setup made. It never takes them from the form.

The page shows the **key ID** of the installation root and the installation ID.
Compare them with the values that Greenhold Admin shows for your installation before you use the command.
If they are not the same, do not use the command.
The agent trusts only the root in its policy.

**What the page asks for**

- The key kinds that the agent accepts. If you tick none, the agent uses its default: hardware-backed keys only.
- The second signer rules, and the number of devices for one signer.
- Tag relaxation.
- The tags of the devices.
- The run time limit.
- The oldest library publication, and automatic library publications.
- How long the agent keeps the logs of failed Runs.

A setting that you leave empty, or at **Agent default**, is not written.
The page checks each value against the limits of the agent.
A tag has only the letters A to Z and a to z, the digits 0 to 9, spaces, and the characters `. _ : -`.
The page makes no command for another character.

**Warnings**

The page shows a warning above the command for each value that is weaker than the default of the agent:

- The agent accepts signatures by software keys.
- A signed amendment can relax the rule for tags.
- The second signer rule is off.
- One administrator alone can sign an Order for more than 25 devices.

The `.cmd` file has each warning as a `rem WARNING:` line.
Make sure that you chose these values yourself.

**Run the command**

- Choose **Show the command**. The page makes a command only from its own form.
- Run the command in **Command Prompt**, not in PowerShell. Use an elevated prompt, in the folder that holds the agent MSI.
- Or download `Install-GreenholdAgent.cmd` and put it in the same folder as the MSI. Run it as administrator. It finds the MSI and writes its log in its own folder.
- To enroll the agent at the same time, give the `.cmd` file a token file: `Install-GreenholdAgent.cmd token.txt`. The file holds one token from the **Add devices** page. A name without a folder is read from the folder of the `.cmd` file. The agent deletes the file after it enrolls, and its service starts.
- If the enrollment fails, the `.cmd` file says that the token file is still there. Delete it.

No command and no `.cmd` file holds a token.
Keep the `.cmd` file where only administrators can change it.
It decides which gateway and which root the agent trusts.

See also [Add devices](/manager/add-devices/).
