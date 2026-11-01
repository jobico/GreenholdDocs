---
title: Remove a package from a device
description: How to uninstall a package that an InstallPackage Order installed.
---

Greenhold has no Action that uninstalls a package yet.
Uninstall the package with the uninstaller of the package itself.

## Uninstall an MSI package

An MSI package has a product code.
The uninstall entry of the package holds it.
This example removes 7-Zip.
Run it in an elevated PowerShell on the device:

```powershell
$entry = Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*' |
  Where-Object { $_.DisplayName -like '7-Zip*' } | Select-Object -First 1
$code = [regex]::Match($entry.UninstallString, '\{[0-9A-Fa-f-]+\}').Value
Start-Process msiexec.exe -ArgumentList '/x', $code, '/qn', '/norestart' -Wait
```

Then check that the files of the package are gone.
For 7-Zip, `C:\Program Files\7-Zip\7z.exe` is gone.

## Uninstall on many devices

Put the same commands in a script.
Send the script with a `RunScript` Order.
See [Run a PowerShell script on a device](/dispatch/run-a-powershell-script/).

## Stop new installs

An Order runs once.
A device does not install the package again by itself.
To stop new installs from the library, do not sign new Orders for the package.

## Stop delivering the library

When devices no longer need the library, remove its entry from `Gateway:LibraryDelivery` in `%ProgramData%\Greenhold\Gateway\appsettings.json` on each gateway node.
Then restart the gateway:

```powershell
Restart-Service GreenholdGateway
```

At start, the gateway forgets the library and delivers none of its files.
A device that gets a job for the library refuses it with code 50.
The agent has no setting for the library.
If an earlier version left a `Libraries` value in the policy of the agent, the agent does not read it. You can remove it.
