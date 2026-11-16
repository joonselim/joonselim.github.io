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

An LRU cache keeps the most recently used items, and drops the oldest when full.

- The hash table finds a node in O(1).
- The doubly linked list keeps the order. The most recent node sits at the front.
- Because the node knows its `prev`, moving it to the front or dropping the last one is O(1).

LeetCode has [a problem](https://leetcode.com/problems/lru-cache/) for this.

Whether it's `get` or `put`, the used node always has to move to the front of the list. So it's easier to implement `_remove` and `_add_to_front` first, then build `get` and `put` on top of them.

```python
class Node:
    def __init__(self, key: int, value: int):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.seq = {}
        self.head = Node(0, 0)
        self.tail = Node(0, 0)

        self.head.next = self.tail
        self.tail.prev = self.head

    def _add_to_front(self, node):
        first = self.head.next
        node.next = first
        node.prev = self.head
        self.head.next = node
        first.prev = node

    def _remove(self, node):
        before = node.prev
        after = node.next
        before.next = after
        after.prev = before

    def get(self, key: int) -> int:
        if key not in self.seq:
            return -1
        node = self.seq[key]
        self._remove(node)
        self._add_to_front(node)
        return node.value

    def put(self, key: int, value: int) -> None:
        if key in self.seq:
            node = self.seq[key]
            self._remove(node)
            node.value = value
            self._add_to_front(node)
        else:
            node = Node(key, value)
            self._add_to_front(node)
            self.seq[key] = node
            if len(self.seq) > self.capacity:
                oldest = self.tail.prev
                self._remove(oldest)
                del self.seq[oldest.key]
```
