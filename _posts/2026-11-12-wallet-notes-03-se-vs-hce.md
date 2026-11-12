---
title: "Industry Notes 01: SE vs HCE"
category: industry-notes
description: Why Apple keeps iPhone NFC closed in the UK, and how a Secure Element compares to Host Card Emulation.
---

A [Consumer Voice article](https://consumervoice.uk/big-tech/apple-pay-rival-apps/) says Apple has not opened iPhone NFC in the UK, even though it already opened it in the EU. In the EU, PayPal, Klarna, and others already launched their own tap-to-pay wallets.

Apple gives two reasons: security risk and fees. The fees are probably the bigger fight here, and that's a whole long story. For now, let's look at the security part.

## SE: how Apple Pay works

Apple uses an SE (Secure Element). It is a separate security chip, apart from the main chip. The card token and the payment key live inside it.

It is hard to break with software attacks. The SE has its own processor and memory, and iOS cannot read them. iOS can only send fixed requests like "make a payment." There is no request like "give me the key."

Each time you pay, the SE makes a one-time cryptogram and sends it to the terminal. The Face ID result that triggers this also goes from the Secure Enclave to the SE, encrypted with a key only those two share. So even if iOS is hacked, it is very hard to leak the key or fake a payment.

## HCE: what the article asks for

The UK regulator (CMA) wants Apple to also allow HCE (Host Card Emulation). HCE has no security chip. An app emulates the card by itself. So the key, the token, and the cryptogram all sit in memory that software can reach.

<figure class="post-figure">
  <img src="{{ '/assets/posts/wallet-notes-03/se-vs-hce.png' | relative_url }}" alt="Sketch: with SE the key sits in a separate chip that iOS can only send requests to, with HCE it sits inside a bank app on iOS where malware can reach it">
</figure>

This opens up three risks:

1. **Key theft.** If a jailbreak or malware gets in, the key can be stolen.
2. **Face ID bypass.** The app checks Face ID itself, so a weak app can let a payment go through without it.
3. **Third-party security.** Each app follows its maker's security level, not Apple's. Apple cannot guarantee it.

<figure class="post-figure">
  <img src="{{ '/assets/posts/wallet-notes-03/hce-risks.png' | relative_url }}" alt="Sketch: three HCE risks, key theft from app memory, Face ID checked by the app instead of the chip, and security that differs from bank to bank">
</figure>

Of course, Google Wallet already runs on HCE. Its security model is weaker *relatively*, but it is not weak. Keys expire after a few payments, so a stolen key is worth little.

## Sources

- [Apple Pay rival apps](https://consumervoice.uk/big-tech/apple-pay-rival-apps/), Consumer Voice
- [CMA outlines proposals to unlock contactless technology on Apple iPhone](https://gov.uk/government/news/cma-outlines-proposals-to-unlock-contactless-technology-on-apple-iphone), GOV.UK, 20 October 2026
