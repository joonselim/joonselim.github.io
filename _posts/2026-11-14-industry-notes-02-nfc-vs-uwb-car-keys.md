---
title: "Industry Notes 02: NFC vs UWB car keys"
category: industry-notes
description: How iPhone car keys work over NFC and over UWB, and why most automakers now choose UWB.
---

<figure class="post-figure">
  <a href="https://developer.apple.com/videos/play/wwdc2020/10006/"><img src="{{ '/assets/posts/industry-notes-02/wwdc20-car-keys.jpg' | relative_url }}" alt="WWDC20 session: Introducing Car Keys"></a>
</figure>

In 2020, Apple let the iPhone open car doors with NFC ([WWDC20: Introducing Car Keys](https://developer.apple.com/videos/play/wwdc2020/10006/)). In 2021, it added UWB.

Today, let's look at NFC and UWB.

## NFC vs UWB

| | NFC | UWB (passive entry) |
|---|---|---|
| Standard | CCC Digital Key Release 2.0 | CCC Digital Key Release 3.0 |
| How it works | Tap the device on the car | The car needs extra UWB radios to measure how far the device is |
| In Wallet | iOS 13.6, July 2020. BMW was first | BMW iX first, then Genesis GV60 (May 2022) |
| Unlock | Hold iPhone or Apple Watch near the door handle | Walk up with the device in a pocket or bag. Some cars wait until you pull the handle |
| Start | Place iPhone in the key reader, then press start | Start once the device is inside |
| Lock | Hold the device near the door handle | Can lock when you walk away |
| Devices | iPhone XS or later, iPhone SE (2nd gen), Apple Watch Series 5 or later | iPhone 11 or later (not SE 2nd or 3rd gen, not 16e), Apple Watch Series 6 or later |
| Downside | Take the device out and tap it every time | Does not work when the battery is dead |

Today, most automakers choose UWB, including the 2026 Toyota RAV4 and Rivian.

NFC is easy to build and easy to use. UWB uses two radios. First, the phone and the car check the key over Bluetooth Low Energy (BLE). Then they start a secure ranging session over UWB. With UWB, the car can measure the distance to the phone accurately and securely, so it knows where the key is.

This came out of relay attacks, which use a signal extender to unlock cars from a distance ([example](https://www.youtube.com/watch?v=5mdU4ksOc2w&t=84s)).

<figure class="post-figure">
  <img src="{{ '/assets/posts/industry-notes-02/nfc-vs-uwb.png' | relative_url }}" alt="Sketch: with NFC you tap the phone at the door handle at very short range, with UWB BLE checks the key and UWB measures the distance while the phone stays in your pocket">
</figure>

## Sources

- [WWDC20: Introducing Car Keys](https://developer.apple.com/videos/play/wwdc2020/10006/)
- [Apple Support: Add your car key to Apple Wallet](https://support.apple.com/en-vn/118271)
- [CCC: Digital Key Release 3.0 (Business Wire)](https://www.businesswire.com/news/home/20210713005019/en)
- [MacRumors: Genesis GV60 with UWB Car Key](https://www.macrumors.com/2022/05/17/genesis-gv60-car-key-ultra-wideband/)
