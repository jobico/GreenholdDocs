---
title: First steps
description: The whole path from a new server to a script that runs and a package that installs, in order, with a link to each step.
---

This page shows the whole path in order.
Each step has one line and a link to the page with the details.
Do the steps from top to bottom.

## Prepare on your own computer

1. Check what you need: PostgreSQL 18 with TLS, a DNS name, an identity provider app and a certificate. See [Requirements](/get-started/requirements/).
2. Install Admin Tools on your own computer, not on the server. See [Admin Tools](/get-started/admin-tools/).
3. Make the installation root, your administrator key and its certificate. See [Before you install](/get-started/before-you-install/).
4. Optional: request a license for the installation ID. See [Admin Tools](/get-started/admin-tools/#2-request-a-license).

## Install the server

5. Prepare PostgreSQL, the identity provider and the Manager certificate. See [Install the server](/get-started/install-the-server/#1-prepare-postgresql).
6. Run the server installer. See [Run the installer](/get-started/install-the-server/#4-run-the-installer).
7. Run the setup wizard and import `root.public.json`. See [Run the setup wizard](/get-started/install-the-server/#5-run-the-setup-wizard).
8. Open the Manager and sign in once.

## Enroll the first device

9. Install the agent with the command line from the last page of the wizard. See [Enroll your first device](/get-started/enroll-your-first-device/).
10. Make a token on the server and enroll the device with it. See [Enroll](/get-started/enroll-your-first-device/#3-enroll).
11. Write down the device ID and whether the device is a server. See [Check](/get-started/enroll-your-first-device/#4-check).

## Run a script with Dispatch

12. Find out if the Order needs two signers. A server needs two. See [Second signer and tags](/dispatch/second-signer-and-tags/).
13. If it does, make a second administrator key. See [Make a second administrator key](/get-started/before-you-install/#make-a-second-administrator-key).
14. Write the script, sign a Release and an Order, store them on the gateway and read the output. See [Run a PowerShell script on a device](/dispatch/run-a-powershell-script/).

## Install a package with Library

15. Get `greenhold-library` and create a library for your installation ID. See [Create a library and add a package](/library/create-a-library/).
16. Pin the root, add a package, refresh, sign the draft and publish it. See [Pin the root](/library/create-a-library/#2-pin-the-root).
17. Tell the agent where the library is. See [Tell the agent where the library is](/library/install-a-package/#1-tell-the-agent-where-the-library-is).
18. Write the content of the Action, sign a Release and an Order, store them and read the output. See [Install a package on a device](/library/install-a-package/).
19. Remove the package again. See [Remove a package from a device](/library/remove-a-package/).

## When a step fails

- An agent that refuses an Order reports a code. See [What the agent checks](/dispatch/orders-and-releases/#what-the-agent-checks).
- For other problems, see [Troubleshooting](/operate/troubleshooting/).
