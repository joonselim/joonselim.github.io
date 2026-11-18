---
title: "My guess on the Apple Pay outage"
date: 2026-11-18 09:00:00 +0900
category: industry
description: Apple Pay online checkout failed in the Apple outage while tap to pay worked. My guess is that merchant validation broke.
---

Yesterday, Apple Pay, iCloud, the App Store and other Apple services failed at the same time due to an internal update ([9to5Mac](https://9to5mac.com/), [The Korea Daily](https://en.koreadaily.com/apple-outage-apple-pay-icloud-app-store-glitches/)). The most common symptom was account sign-in, where users were signed out of iCloud and could not sign back in.

---

At the same time, Apple Pay online checkout failed, while tap to pay in stores seemed to work. So my guess is that merchant sign-in was hit too, and that caused the Apple Pay error.

Below are the error cases by function.

| Where | What failed | Source |
| --- | --- | --- |
| Online checkout | **Payment failed, or button did not load** | [Kustom notice](https://isdown.app/status/kustom/incidents/688832-apple-pay-service-disruption) (archived) |
| Checkout start | **Payment failed or slow to start** | [Primer notice](https://outagedb.com/status/primer/2026-11-17-degraded-apple-pay-performance/) (archived) |
| During payment | **Stuck on "Processing", then timeout after about 30 s** | [Reddit](https://www.reddit.com/r/AppleCard/comments/1xyqxbt/problems_with_apple_services/), web, app or store unclear |
| eBay checkout | **Apple Pay option missing** | [Reddit](https://www.reddit.com/r/Ebay/comments/1xyrenr/apple_pay_missing_as_a_payment_method/), not confirmed by eBay |
| Tap to pay in stores | **Worked for some users** | [Reddit](https://www.reddit.com/r/apple/comments/1xyr1v3/apple_outages_megathread/), few reports |

Merchant sign-in is called merchant validation. Before the payment sheet opens, the shop's server proves to Apple who the shop is, with its own certificate. It is not the user's Apple Account, but it is still a sign-in check on Apple's servers. Tap to pay does not use it.

---

Here is the online flow, from Apple's [debugging guide](https://developer.apple.com/forums/thread/690047).

1. **Check.** The browser checks if Apple Pay is available. The shop shows the button.
2. **Start.** The user taps the button. The page starts an Apple Pay session.
3. **Validate merchant.** Safari gives a validation URL. The page sends it to the shop's server.
4. **Get a payment session.** The shop's server calls Apple's `paymentSession` with its certificate. Apple returns a session.
5. **Pay.** The payment sheet opens. The user approves with Face ID.
6. **Token.** The encrypted token goes to the payment processor.

I think step 4 broke. If Apple does not answer here, the sheet never opens. The user sees a spinner, then a timeout.

<figure class="post-figure">
  <img src="{{ '/assets/posts/apple-pay-outage/step-4.png' | relative_url }}" alt="Sketch: Safari sends the validation URL to the shop server, the shop server asks Apple's paymentSession for a session with its merchant cert, Apple does not answer and it times out, so the payment sheet never opens">
</figure>

---

In May, a developer reported the same kind of failure on this exact call ([forum thread](https://developer.apple.com/forums/thread/826597)).

|  | May 15, 2026 | Nov 17, 2026 |
| --- | --- | --- |
| Symptom | Timeouts, slow responses | Slow start, then timeout |
| Cause given | Server-side partial failure (Apple staff guess) | Internal update (Apple) |
| Status page | No incident | Updated late |

The pattern matches. When this one call stalls, online Apple Pay stops, even if everything else works.

Of course, this is a guess. Apple has not said which system failed. And a missing button (Kustom, eBay) happens at step 1, so step 4 does not explain it.

## Sources

- [Apple outage: Apple Pay, iCloud, and App Store hit by simultaneous glitches](https://en.koreadaily.com/apple-outage-apple-pay-icloud-app-store-glitches/), The Korea Daily
- Apple update error disrupts iCloud and Apple Pay, ChosunBiz EN
- iCloud, App Store, and other Apple services hit by ongoing outage, 9to5Mac
- [Apple Pay on the Web Debugging Guide](https://developer.apple.com/forums/thread/690047), Apple Developer Forums
- [ApplePay create-session API timing out](https://developer.apple.com/forums/thread/826597), Apple Developer Forums
- [Kustom: Apple Pay service disruption (archived)](https://isdown.app/status/kustom/incidents/688832-apple-pay-service-disruption)
- [Primer: degraded Apple Pay performance (archived)](https://outagedb.com/status/primer/2026-11-17-degraded-apple-pay-performance/)
- [r/Ebay: Apple Pay missing as a payment method](https://www.reddit.com/r/Ebay/comments/1xyrenr/apple_pay_missing_as_a_payment_method/)
- [r/AppleCard: Problems with Apple services](https://www.reddit.com/r/AppleCard/comments/1xyqxbt/problems_with_apple_services/)
- [r/apple: Apple outages megathread](https://www.reddit.com/r/apple/comments/1xyr1v3/apple_outages_megathread/)
