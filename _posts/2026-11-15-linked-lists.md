---
title: "Linked lists"
date: 2026-11-15 09:00:00 +0900
category: cs-basics
description: Singly and doubly linked lists, and where they show up. With an interactive demo.
---

In my coding interview, when I was implementing a hash table, they told me I could use a linked list for it.

Honestly, I'm not a big fan of linked lists. I rarely use them at work, because they're slow. So unless I really have to save space (which has never happened), I tend to avoid even thinking about them.

But they keep getting mentioned in interviews, so let's go through them to refresh my knowledge.

---

A linked list is made of nodes. Each node holds a value and a pointer to the next node. So in memory, it is not stored side by side like an array, but scattered here and there.

A doubly linked list is the same, but each node also has a pointer to the previous node, so it can go either way.

## Linked list

Each node has only `next`. In a doubly linked list, it also has `prev`.

{% include tech/linked-list.html kind="list" %}

## LRU cache

An LRU cache keeps the most recently used items, and drops the oldest when full. It combines the [hash table](/posts/hash-tables/) from my last CS post with a doubly linked list.

- The hash table finds a node in O(1).
- The doubly linked list keeps the order. The most recent node sits at the front.
- Because the node knows its `prev`, moving it to the front or dropping the last one is O(1).

Here it is in pseudocode.

```
map = empty hash table          # key -> node
list = empty doubly linked list # front = most recent

get(key):
    if key not in map:
        return nothing
    node = map[key]
    move node to the front of list     # O(1): unlink with prev/next, relink at head
    return node.value

put(key, value):
    if key in map:
        node = map[key]
        node.value = value
        move node to the front of list
        return
    if size of map == capacity:
        last = list.tail
        remove last from list          # O(1) thanks to tail and prev
        delete map[last.key]
    node = new node(key, value)
    add node to the front of list
    map[key] = node
```
