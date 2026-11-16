---
title: "worse_query and how SE is safe from it"
date: 2026-11-14 12:00:00
category: industry
description: Why worse_query can't reach Apple Pay cards in the Secure Element, why HCE apps are mostly fine, and why crypto wallets are the problem.
---

In the [last post](/posts/ios-flaw-exposing-crypto-wallet-keys/), I looked at worse_query, a flaw that lets one app reach other apps' files. So is Apple Pay safe? Yes.

## SE

Apple Pay cards live in the Secure Element (SE). The SE is a separate chip with its own processor and memory. It is not a file.

worse_query reaches files. So it can't reach the SE.

<figure class="post-figure">
  <img src="{{ '/assets/posts/se-is-not-approachable-by-worse-query/se-hce-crypto.png' | relative_url }}" alt="Sketch: worse_query cannot reach the key in the SE chip. It can read the key in an HCE bank app's files, but that key expires soon. It can read a seed phrase in a crypto wallet app's files, and that never expires">
</figure>

## HCE case

As I wrote in [SE vs HCE](/posts/se-vs-hce/), HCE has no security chip. The app holds the key itself, where software can reach it. So if the app saves the key in its files, worse_query can read it.

But most HCE payment apps use LUK (Limited Use Keys). A LUK works only for a few payments or a short time. Then the server sends a new one. The real card number isn't there either, only a token. So a stolen key is worth little.

## Crypto wallets

As I wrote in the last post, crypto wallets are the problem. If a wallet keeps its seed phrase (the list of words that can restore the whole wallet) in its own files, worse_query can read it.

So a crypto wallet can be emptied completely. I think that's why Binance sent this warning, not Visa.

## Sources

- [SE vs HCE](/posts/se-vs-hce/)
- [Apple Pay component security](https://support.apple.com/guide/security/apple-pay-component-security-sec2561eb018/web), Apple Platform Security
- [HCE Issuer Owned Wallets Overview](https://globalnetworkpublic1.americanexpress.com/globalnetwork/dam/jcr:3d13fb75-907a-4e55-8d99-582632631b8c/HCE%20Issuer%20Owned%20Wallets%20Overview.pdf), American Express
- [iPhone hacked: Binance warns of iOS flaw exposing crypto wallet keys](https://beinsure.com/news/iphone-hacked-ios-flaw-exposing-crypto-wallet-keys/), Beinsure
