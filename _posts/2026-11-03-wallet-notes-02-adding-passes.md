---
title: "Pay Notes 02: Adding passes"
category: pay-notes
description: How a pass gets into Wallet, and the rules Apple's Human Interface Guidelines set for each way in.
---

There are four ways a pass gets into Wallet, and Apple's [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/wallet) have a rule for each one.

<figure class="post-figure">
  <img src="{{ '/assets/posts/wallet-notes-02/ways.png' | relative_url }}" alt="Sketch of four ways a pass gets into Wallet: in the app with one tap, from the web or another device with one suggestion, automatically after saying yes once, and from an email or web page with an Add to Apple Wallet badge">
</figure>

## One tap

The simplest case is a purchase in your app. Someone buys a ticket, the system shows a sheet with the pass, and one tap adds it.

For things that happen again and again, like checking in for a flight, people can say yes once. After that, new passes are added in the background, and Wallet lets them know.

If someone wants to look at the pass first, the app can show it on its own screen with an Add to Apple Wallet button.

## Made somewhere else

Sometimes the pass is made on a website or on another device. Then the app can suggest adding it the next time people open it. If they say no, it shouldn't ask again.

## Groups

A trip with a connection means two boarding passes. They should be added together, so nobody has to do it twice.

## Button and link

People change their minds, or remove a pass and want it back later. So the Add to Apple Wallet button should appear wherever that pass shows up in the app. Emails and web pages can use the badge.

Once the pass is in Wallet, the app can offer a link that jumps right to it, like View in Wallet.

## What I took away

Add it once, add it together, and never nag. Most of these rules are about getting the pass to people without getting in their way.

<figure class="post-figure">
  <img src="{{ '/assets/posts/wallet-notes-02/rules.png' | relative_url }}" alt="Sketch of three rules: add it once with one tap, add connecting boarding passes together, and never nag after someone says not now">
</figure>

**Video:** [Wallet Notes 02 on YouTube](https://youtube.com/shorts/g2HgOZN8Gto)
