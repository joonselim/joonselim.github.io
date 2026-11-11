---
title: What's inside an Apple Wallet pass
description: Notes from studying the Wallet passes section of Apple's Human Interface Guidelines.
---

{% assign img = '/assets/posts/wallet-passes/' | relative_url %}

I've been studying Apple Pay and payment systems. I started with the Wallet passes section of Apple's [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/wallet) and put together a short video about what I learned.

A pass is a digital ticket or card you keep in Wallet, like a boarding pass, concert ticket, membership card, or coupon.

I used a concert ticket as an example to understand how a pass is organized. The main information goes on the front, with supporting details like the venue and seat below it. Less frequently needed information, such as terms and conditions, goes on the back.

<div class="frames two">
  <img src="{{ img }}s10.jpg" alt="The front of a concert ticket pass with its fields highlighted">
  <img src="{{ img }}s11.jpg" alt="The back of the pass with terms and conditions">
</div>

One thing I found interesting was the difference between pass fields and semantic tags. Fields control what appears on the pass and where. Semantic tags describe what the information means, such as the event's start time or location.

<div class="frames single">
  <img src="{{ img }}s12.jpg" alt="Pass fields versus semantic tags">
</div>

There's also more to think about after someone adds a pass. Details may change, the pass may become relevant at a particular time or place, and eventually it expires. A boarding pass, for example, needs to stay useful when the gate changes.

<div class="frames single">
  <img src="{{ img }}s22.jpg" alt="A gate change updating on a boarding pass">
</div>

The design guidelines were straightforward: keep the front simple, make the text easy to read, and avoid putting text inside images. Wording also needs to work across devices, including Apple Watch.

<div class="frames two">
  <img src="{{ img }}s25.jpg" alt="A cluttered pass front versus a clean one">
  <img src="{{ img }}s27.jpg" alt="Text baked into an image versus a real text field">
</div>

Going through this made me pay more attention to what belongs on a pass and when someone needs it. Next, I'd like to look at the Apple Pay payment flow.
