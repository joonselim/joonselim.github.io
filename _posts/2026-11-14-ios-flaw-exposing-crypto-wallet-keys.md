---
title: "iOS flaw exposing crypto wallet keys"
date: 2026-11-14 10:00:00
category: industry
description: What worse_query is, how a path can escape the iOS sandbox, and why crypto wallets need to be careful.
---

A [Beinsure article](https://beinsure.com/news/iphone-hacked-ios-flaw-exposing-crypto-wallet-keys/) says Binance warned iPhone users about an iOS flaw that can expose crypto wallet keys. The flaw is called worse_query, and it was made by security researchers forcequit and 0xjohnny.

## What worse_query is

worse_query lets one app reach files it has no permission for, like other apps' data folders and shared App Group folders. On iOS 27, it also reaches some system folders.

It is still a sandbox escape. It doesn't get kernel access, and it is not a jailbreak. But it looks quite dangerous. Just like WQ Files, a file manager built on worse_query, it can read, write, and delete other apps' files.

Here is the [proof of concept](https://github.com/forcequitOS/worse_query).

## Why the path escapes

The worse_query repo doesn't explain how it works. But [airlift](https://github.com/0xjohnnydev/airlift), an earlier sandbox escape for iOS 27.0, explains its own case well. It is a different bug, but it shows how a path can get out.

On iPhone, AirTraffic syncs media like Books from a paired Mac. It may only move files inside the Media folder. So before each move, it checks one thing: does the destination path start with `/var/mobile/Media/`?

The problem is that it checks only the path text, not where the path really leads.

1. **`..` in the path.** The source path can contain `..`, which means "go up one folder."
2. **Symbolic links.** A symbolic link is a file that points to another folder. The path text can say Media, while the link inside it points to `/var/tmp`.

So airlift first moves a symbolic link into Media. Then it moves a file through that link. The path text still starts with Media, so the check passes. But the file lands in `/var/tmp`, outside Media.

<figure class="post-figure">
  <img src="{{ '/assets/posts/ios-flaw-exposing-crypto-wallet-keys/path-escape.png' | relative_url }}" alt="Sketch: a file moves into a symbolic link inside Media. The path text /var/mobile/Media/link/file passes the check, but the link points outside, so the file ends up in /var/tmp">
</figure>

---

Apple Wallet is safe, because the card keys are in the Secure Element, a physically separate chip. However, crypto wallets can be a problem, just like the Beinsure article said. [Here is why.](/posts/se-is-not-approachable-by-worse-query/)

## Sources

- [iPhone hacked: Binance warns of iOS flaw exposing crypto wallet keys](https://beinsure.com/news/iphone-hacked-ios-flaw-exposing-crypto-wallet-keys/), Beinsure, 14 November 2026
- [worse_query](https://github.com/forcequitOS/worse_query), GitHub
- [airlift](https://github.com/0xjohnnydev/airlift), GitHub
