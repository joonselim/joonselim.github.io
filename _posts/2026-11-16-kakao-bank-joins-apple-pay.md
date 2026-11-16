---
title: "In Korea, Kakao Bank joins Apple Pay"
date: 2026-11-16 09:00:00 +0900
category: industry
description: Kakao Bank brings Apple Pay to its debit cards, and who pays the fee for an Apple Pay payment in Korea.
---

Today, [Kakao Bank started supporting Apple Pay in Korea](https://www.etnews.com/20261116000304). It is the first new issuer since Hyundai Card brought Apple Pay to Korea in March 2023.

So let's use this chance to look at how Apple Pay fees work in Korea. Kakao Bank has no credit card of its own, so for now it supports only debit cards. For credit, let's look at Hyundai Card.

---

## The fee

Apple does not charge the shopper or the merchant. It charges the card issuer. In the US, this is 0.15% per credit payment. In Korea, the number is not public, but the industry estimate for Hyundai Card is also about 0.15%. Apple Pay also needs a token from Visa or Mastercard, which costs about 2 cents per payment.

Here is a $100 payment at a small shop in Korea:

|  | Shopper pays | Shop gets | Issuer keeps | Apple | Visa / Mastercard |
| --- | --- | --- | --- | --- | --- |
| Cash | $100 | $100 | - | - | - |
| Credit card | $100 | $99.60 | $0.40 | - | - |
| Apple Pay (credit) | $100 | $99.60 | about $0.23 | about $0.15 | about $0.02 |
| Debit card | $100 | $99.85 | $0.15 | - | - |
| Apple Pay (debit) | $100 | $99.85 | $0.13 minus Apple's fee | not public | about $0.02 |

For shops with sales up to 300 million won a year, the government caps the fee at 0.40% for credit cards and 0.15% for debit cards. Kakao Bank's Apple fee is not public. In the US, Apple takes half a cent per debit payment. Other processing costs are left out.

<figure class="post-figure">
  <img src="{{ '/assets/posts/kakao-bank-joins-apple-pay/who-pays.png' | relative_url }}" alt="Sketch: you pay 10,000 won, the shop pays the normal merchant fee to the card company, and the card company pays Apple about 0.15% and Visa or Mastercard about 30 won for the token">
</figure>

## Sources

- [etnews: Kakao Bank Apple Pay launch](https://www.etnews.com/20261116000304)
- [Digital Transactions: issuer Apple Pay contract terms](https://www.digitaltransactions.net/issuers-apple-pay-pact-assigns-remarkable-authority-to-card-networks-as-well-as-apple/)
- [Money Today: Apple Pay fee and token cost](https://www.mt.co.kr/finance/2025/03/18/2025031810270584961)
- [Financial Services Commission: 2025 preferential merchant fee rates](https://www.fsc.go.kr/po010107/83999?curPage=54)
