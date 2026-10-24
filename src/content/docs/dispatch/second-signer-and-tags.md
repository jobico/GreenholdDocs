---
title: Second signer and tags
description: When an Order needs two administrators, how to add the second signature, and what a tag does.
---

Some Orders need two signers.
The two signers must have different administrator IDs and different keys.
The policy of the agent decides when an Order needs a second signer.

## When an Order needs two signers

| Policy value | Effect |
|---|---|
| `SecondSignerRule` | The Order needs two signers when the agent is a server, when the Order names a tag, or when the Order names more devices than `SecondSignerAbove`. |
| `SecondSignerAbove` | The device count for the rule above. The default is 25. The count is for one Order. |
| `AlwaysSecondSigner` | Every Order needs two signers. |
| `AllowTagRelaxation` | A signed amendment with two signers can make a tag Order follow the device count. |

:::caution
The limit of 25 devices catches mistakes.
It does not stop an administrator who splits one rollout into many small Orders.
To stop this, turn on `AlwaysSecondSigner`.
:::

See [Policy for agents](/concepts/policy-for-agents/) to set these values.

## Add the second signature

The first administrator signs the Order.
The second administrator adds a signature with their own key:

```
greenhold-sign sign --add-to order.signed --admin-key admin-02.key.json --cert admin-02.cert --out order2.signed
```

The hash of the Order does not change.
Store `order2.signed` on the gateway with `order add`.

To see what an agent will do, use `greenhold-sign verify`.
The options `--second-signer-above`, `--always-second-signer` and `--no-second-signer` set the policy for the check.

## Tags

A tag is a text that the local policy of a computer gives to it.
Group Policy or Intune sets the `Tags` value.
An Order that names a tag names every device that carries the tag.

An agent cannot count the devices of a tag.
For this reason, an Order for a tag needs two signers.

```json
"targets": { "tag": "lab" }
```

:::note
The gateway does not route Orders for a tag yet.
The command `order add` refuses an Order that names a tag.
Name the device IDs in the Order.
:::
