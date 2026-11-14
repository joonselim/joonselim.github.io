---
title: "Algorithms 01: Hash tables"
date: 2026-11-01 12:00:00
category: algorithms
description: How a hash table finds a key in one step, what happens on a collision, and why it grows. With interactive demos.
---

I recently had a coding interview. The problem was to implement a hash table with just two methods, `put` and `get`. I struggled.

I can't share the exact problem, but one question was this: "With your approach, memory will blow up at some point. How would you fix it?"

I couldn't find the answer there. The answer they expected was a 2D array, like `[1]: [1, 2, 3, 4]`. Each index holds a list of values. This is called **chaining**, and it comes up in Step 2 below.

So let's go through it from the start.

## Why a hash table

To find a key in a list, you check the items one by one. With a million items, that can be a million checks.

A hash table skips that. It turns the key into a number, and uses that number as an array index. So it jumps straight to the right spot. On average, that's **one check**, no matter how many items there are.

## Step 1: the hash function

A hash function turns a key into a number. The same key always gives the same number. Then `% N` folds that number into one of N buckets.

Type a key and switch between the two functions.

{% include tech/hash-table.html kind="fn" %}

**Sum** just adds the character codes. It is simple, but `listen` and `silent` end up in the same bucket, because order doesn't matter.

**× 31** multiplies by 31 before adding each character. Now order matters. Java's `String.hashCode()` works this way.

## Step 2: collisions

Two keys in the same bucket is a **collision**. You can't avoid it. There are more possible keys than buckets, so some keys must share.

There are two common fixes:

- **Chaining**: each bucket holds a list. Colliding keys line up in the same bucket.
- **Linear probing**: each bucket holds one key. If it's taken, try the next bucket.

Try both below. Insert keys, find them, delete them, and watch the orange collisions.

{% include tech/hash-table.html kind="table" %}

A few things to try:

- Add random fruits until two land in the same bucket. In chaining they stack. In probing one walks to the next free bucket.
- In linear probing, delete a key, then find a key that came after it. The ✕ is a **tombstone**. Without it, the search would hit an empty bucket and stop too early.
- Keep adding keys and watch the load factor.

## Step 3: load factor and resizing

**Load factor** = keys / buckets. As it grows, collisions grow too, and lookups get slower.

So when it passes a limit (often 0.75), the table **doubles** its buckets. Every key has to be hashed again, because `% 8` and `% 16` give different buckets.

Resizing touches every key, so it's slow, O(n). But it happens rarely, so on average inserting is still O(1).

One more thing: the hash function matters. In the worst case, every key lands in one bucket. Then the hash table is just a slow list, O(n).

## What I should have written

Here is `put` and `get` with chaining, in pseudocode.

```
buckets = 8 empty lists

put(key, value):
    i = hash(key) % len(buckets)
    for pair in buckets[i]:
        if pair.key == key:
            pair.value = value    # already here: update
            return
    buckets[i].append((key, value))
    if keys / len(buckets) > 0.75:
        double the buckets and put every key again

get(key):
    i = hash(key) % len(buckets)
    for pair in buckets[i]:
        if pair.key == key:
            return pair.value
    return nothing
```
