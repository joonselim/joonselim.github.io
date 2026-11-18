---
title: "SHA-1 in a .pkpass (Apple Wallet)"
categories: [wallet-pay, cs-basics]
description: Apple Wallet passes still use SHA-1. Why a .pkpass needs a hash at all, what SHA-1 does step by step, and why Apple hasn't moved to SHA-256.
redirect_from:
  - /posts/tech-notes-01-sha-1/
---

Apple Wallet adds a pass from a `.pkpass` file. (Apple Pay cards, like credit cards, are added a different way.)

When a pass is added and used, Wallet checks a `manifest.json` file. This file uses **SHA-1**.

## .pkpass

A pass is a `.pkpass` file. It is just a zip with a few files inside:

- `pass.json`: the pass content, like the event name and your seat
- logo images (`.png`)
- `manifest.json`: the **SHA-1 hash** of every file above
- `signature`: the issuer's signature on `manifest.json`

```json
{
  "pass.json": "8d9c0b6e3f...",
  "icon.png":  "2a71f0c94b...",
  "logo.png":  "f05e19d2a8...",
  ...
}
```

---

A pass is a ticket. If you could open `pass.json` and change seat 8 to VIP, the ticket would be worthless. So the iPhone has to check that nothing changed after the issuer made the pass.

Signing every file one by one would be messy. So the issuer signs **only `manifest.json`**. The manifest holds the hash of every file, so protecting the manifest protects everything.

When you add a pass, the iPhone checks it in reverse:

1. Is the signature on `manifest.json` valid, and from a certificate Apple issued?
2. Does the SHA-1 of every file match the value in the manifest?

If you change one character in `pass.json`, its SHA-1 changes completely. It no longer matches the manifest, and Wallet says "Cannot add pass." If you also update the manifest, the signature breaks instead.

## How SHA-1 works

1. Turn the text into bits.
2. Pad it to a 512-bit block, with the original length at the end.
3. Cut the block into 16 words, then stretch them to 80 words.
4. Mix five 32-bit boxes for 80 rounds.
5. Add the starting values back. The five boxes together are the 160-bit hash.

A hash is **not encryption**. Encryption can be undone with a key, but a hash has no key, and no one can undo it.

{% include wallet/sha1-walkthrough.html %}

Step 6 is the important part. Change one character and about **half of the 160 bits** flip. This is the avalanche effect. It is why a single edit in `pass.json` can't hide.

---

In 2017, Google broke SHA-1. They made two different PDFs with the same SHA-1.

Breaking it is still not free. It takes a lot of GPUs, about $11,000 to $45,000 of rented GPU time by a 2020 estimate.

## So why not SHA-256?

Apple hasn't said why. This is my guess.

**It's not about computing cost.** SHA-256 is cheap, and iPhones have hardware for it. Hashing a few small files takes no time either way.

**It's about the cost of change.** The `.pkpass` format dates back to Passbook in iOS 6 (2012). Airlines, ticket sellers, and coffee shops all built tools that write SHA-1 manifests. Switching would mean every pass generator updates, and Wallet supports both formats for years. That's a big cost.

**And the gain is small.** The attacks on SHA-1 are **collision** attacks. The attacker makes *both* files, so they share one hash. But in a pass, the issuer makes the files and signs them. An outside attacker who wants to swap `pass.json` must hit a hash that already exists. That is a **second preimage** attack, and it is still far out of reach for SHA-1. The only one who could make two colliding passes is the issuer, who can sign anything anyway.

So my guess: high cost to switch, small risk to stay. For now, that math favors SHA-1.

## Sources

- [Building a pass](https://developer.apple.com/documentation/walletpasses/building-a-pass), Apple Developer
- [SHAttered](https://shattered.io/), Google and CWI Amsterdam, 2017
- [SHA-1 is a Shambles](https://sha-mbles.github.io/), Leurent and Peyrin, 2020
