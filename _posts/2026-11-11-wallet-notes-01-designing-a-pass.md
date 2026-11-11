---
title: "Wallet Notes 01: Designing a pass"
description: Notes from studying the Wallet passes section of Apple's Human Interface Guidelines.
---

{% assign img = '/assets/posts/wallet-passes/' | relative_url %}

I've been studying Apple Pay and payment systems. I started with the Wallet passes section of Apple's [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/wallet) and put together a short video about what I learned.

## What a pass is

A pass is a digital ticket or card you keep in Wallet, like a boarding pass, concert ticket, membership card, or coupon.

## Anatomy of a pass

I used a concert ticket as an example to understand how a pass is organized. The main information goes on the front, with supporting details like the venue and seat below it. Less frequently needed information, such as terms and conditions, goes on the back.

{% include wallet/pass-anatomy.html %}

## Fields and semantic tags

One thing I found interesting was the difference between pass fields and semantic tags. Fields control what appears on the pass and where. Semantic tags describe what the information means, such as the event's start time or location.

<div class="frames single">
  <img src="{{ img }}s12.jpg" alt="Pass fields versus semantic tags">
</div>

## After a pass is added

There's also more to think about after someone adds a pass. Details may change, the pass may become relevant at a particular time or place, and eventually it expires. A boarding pass, for example, needs to stay useful when the gate changes.

<div class="frames two">
  <img src="{{ img }}s20.jpg" alt="Added: one tap to add, related passes added as a group, and no asking again after a decline">
  <img src="{{ img }}s21.jpg" alt="Relevant: the pass appears on the Lock Screen at the right time and place">
  <img src="{{ img }}s22.jpg" alt="Updated: a gate change from B12 to C4, for time-critical info only, never marketing">
  <img src="{{ img }}s23.jpg" alt="Expired: an expiration date hides old passes, and removing a pass asks first">
</div>

## Design rules

The design guidelines were straightforward: keep the front simple, make the text easy to read, and avoid putting text inside images. Wording also needs to work across devices, including Apple Watch.

<div class="frames two">
  <img src="{{ img }}s25.jpg" alt="Clean: a front crowded with text versus a simple front">
  <img src="{{ img }}s26.jpg" alt="Contrast: low-contrast text versus readable white text">
  <img src="{{ img }}s27.jpg" alt="No text in images: a SALE image versus an image with a separate text field">
  <img src="{{ img }}s28.jpg" alt="Every device: 'Slide to view' works on iPhone but not on Apple Watch">
</div>

## What's next

Going through this made me pay more attention to what belongs on a pass and when someone needs it. Next, I'd like to look at the Apple Pay payment flow.

**Video:** [Wallet Notes 01 on YouTube](https://youtube.com/shorts/-ApgO4RqhOs)
