---
title: Certificates
description: Which certificates may come from your own certificate authority.
---

Greenhold uses several certificates.
Your own certificate authority (for example AD CS) can issue most of them.
It must not issue two of them.

| Certificate | From your own CA? | Reason |
|---|---|---|
| Manager HTTPS | Yes | Browsers must trust it. The Manager account must read its private key. |
| Manager data protection | Yes | It protects only the cookies and forms of the Manager. |
| Code signing for releases | Yes | It shows who published a file. Your clients trust your CA. |
| Blob writer for the Library storage | Yes | It is a login to your storage. It is not a trust anchor of Greenhold. |
| PostgreSQL server | Yes | Greenhold checks it with `VerifyFull`. |
| **Agent channel authority** | **No** | `Greenhold.Gateway init` makes it. Its key cannot be exported. Every agent trusts only this one. |
| **Installation root** | **No** | You make it with `greenhold-sign root-create` and keep it offline. |

:::caution
Do not replace the channel authority with a certificate from your own CA.
Then anyone that your CA can issue for could pretend to be the gateway.
:::

:::caution
Do not make the installation root with your own CA.
Then the administrators of that CA could take control of every computer in the domain.
:::
