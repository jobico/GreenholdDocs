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

## Remove the library from an agent

When an agent no longer needs the library, remove its entry from the policy:

```powershell
Remove-ItemProperty -Path 'HKLM:\SOFTWARE\Policies\Greenhold\Agent\Libraries' -Name '<library id>'
Restart-Service GreenholdAgent
```

If Group Policy sets the value, change the Group Policy instead.
