---
title: "Creating an Apple Pay session"
date: 2026-11-18 13:00:00 +0900
category: wallet-pay
description: How a shop builds Apple Pay on the web, from the button to the token, following Apple's docs.
---

In my [last post](/posts/apple-pay-outage/), I guessed that step 4, getting a payment session, broke. So let's look at how a shop actually builds Apple Pay on the web, following [Apple's docs](https://developer.apple.com/documentation/applepayontheweb/creating-an-apple-pay-session).

Here is the whole flow. Step through it, then switch to Outage.

{% include tech/apple-pay-flow.html %}

---

## 1. Check

First, the page checks if the browser has the Apple Pay JS API, and if the device can pay.

```js
if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
  // show the Apple Pay button
}
```

There is also `applePayCapabilities(merchantIdentifier)`. It asks Apple Pay servers if the user has a card in Wallet. So if a shop uses it, even showing the button depends on Apple's servers.

## 2. Create the session

The session can only be created when the user taps the button. Outside a tap, it throws "Must create a new ApplePaySession from a user gesture handler". It also throws on an insecure page, or if the request is invalid (for example, a total of zero).

```js
button.onclick = () => {
  const request = {
    countryCode: 'US',
    currencyCode: 'USD',
    supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
    merchantCapabilities: ['supports3DS'],
    total: { label: 'My Store', amount: '10.00' },
  };
  const session = new ApplePaySession(3, request);
  // handlers below
  session.begin();
};
```

`begin()` shows the payment sheet and starts merchant validation.

## 3. Validate the merchant

Right after `begin()`, `onvalidatemerchant` is called. The page asks its own server for a merchant session, and passes it back.

```js
session.onvalidatemerchant = async () => {
  const res = await fetch('/apple-pay/session', { method: 'POST' });
  session.completeMerchantValidation(await res.json());
};
```

The shop's server calls Apple's Payment Session endpoint with mutual TLS, using its merchant identity certificate.

```bash
curl --cert merchant_id.pem --key merchant_id.key \
  -H 'Content-Type: application/json' \
  -d '{
    "merchantIdentifier": "merchant.com.example.mystore",
    "displayName": "MyStore",
    "initiative": "web",
    "initiativeContext": "mystore.example.com"
  }' \
  https://apple-pay-gateway.apple.com/paymentSession
```

Apple returns an opaque session object. It can be used only once, and it expires after five minutes. This request must come from the server, never from the browser.

This is the call I guessed broke in the outage. Until `completeMerchantValidation` gets a session, the user can't approve the payment.

## 4. Authorize

The user approves with Face ID. Then `onpaymentauthorized` gets the encrypted token. The page sends it to the payment processor, and reports the result.

```js
session.onpaymentauthorized = async (event) => {
  const ok = await sendToProcessor(event.payment.token);
  session.completePayment(ok ? ApplePaySession.STATUS_SUCCESS : ApplePaySession.STATUS_FAILURE);
};
```

`completePayment` must be called within 30 seconds. After that, the sheet says the payment couldn't be completed.

---

## Back to the outage

One report said the payment was stuck on "Processing", then timed out after about 30 seconds. That matches the 30 second limit of `onpaymentauthorized`, which comes after Face ID. So if that was on the web, merchant validation worked for that user, and it was the payment itself that stalled.

## Sources

- [Creating an Apple Pay session](https://developer.apple.com/documentation/applepayontheweb/creating-an-apple-pay-session), Apple Developer Documentation
- [Checking for Apple Pay availability](https://developer.apple.com/documentation/applepayontheweb/checking-for-apple-pay-availability), Apple Developer Documentation
- [Providing merchant validation](https://developer.apple.com/documentation/applepayontheweb/providing-merchant-validation), Apple Developer Documentation
- [Requesting an Apple Pay payment session](https://developer.apple.com/documentation/applepayontheweb/requesting-an-apple-pay-payment-session), Apple Developer Documentation
- [onpaymentauthorized](https://developer.apple.com/documentation/applepayontheweb/applepaysession/onpaymentauthorized), Apple Developer Documentation
