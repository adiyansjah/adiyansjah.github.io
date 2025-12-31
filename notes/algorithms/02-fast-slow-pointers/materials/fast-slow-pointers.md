# Fast and Slow Pointers

### Table of Contents

# 1. Introduction

## What is the Fast and Slow Pointers Technique?

The **Fast and Slow Pointers** technique (also known as **Floyd's Tortoise and Hare Algorithm**) uses two pointers that traverse a sequence at different speeds:

| Pointer | Speed | Movement |
| --- | --- | --- |
| 🐢 Slow | 1 step | `slow = slow.next` |
| 🐇 Fast | 2 steps | `fast = fast.next.next` |

This simple difference in speed creates powerful properties that help solve a variety of problems efficiently.

## Core Intuition: Why Do Different Speeds Help?

> 💡 The Running Track Analogy
> 
> 
> Imagine two runners on a circular track. One runs twice as fast as the other. If they start together and keep running:
> 
> - On a **linear track**: The fast runner reaches the end first (no meeting)
> - On a **circular track**: The fast runner will eventually "lap" and catch up to the slow runner
> 
> **This is the key insight: Different speeds reveal cyclic behavior!**
> 

**Think about it this way:**

| Structure | What Happens | Result |
| --- | --- | --- |
| 📏 Linear | Fast pointer reaches the end | No cycle detected |
| 🔄 Cyclic | Fast pointer catches slow pointer | Cycle detected! |

## Mathematical Proof: Why Do They Meet?

```
Setup:
├── Slow moves 1 step per iteration
├── Fast moves 2 steps per iteration
└── Both are inside a cycle of length C

Relative Speed Analysis:
├── Fast gains on slow by (2 - 1) = 1 step each iteration
├── If fast is D steps behind slow, it takes D iterations to catch up
└── Since cycle length is finite, fast WILL catch slow within C iterations

Key Insight:
Once both pointers enter the cycle, the gap decreases by 1 each step.
They MUST meet before fast completes another full lap!

```

## When to Use Fast and Slow Pointers

> 🎯 Problem Indicators — Keywords to Watch For
> 

| Keyword/Phrase | Likely Application |
| --- | --- |
| `cycle`, `circular`, `loop` | Cycle detection |
| `middle`, `halfway`, `center` | Middle finding |
| `nth from end`, `kth from last` | Finding position without knowing length |
| `repeated`, `duplicate` | Cycle in value space |
| `infinite loop`, `terminates?` | Cycle detection |
| `constant space` + `linked list` | Many fast/slow applications |
| `palindrome` + `linked list` | Middle + reverse pattern |

## Time & Space Complexity Benefits

| Approach | Time | Space | Notes |
| --- | --- | --- | --- |
| HashSet (visited tracking) | O(n) | O(n) | Stores all visited nodes |
| **Fast/Slow Pointers** | O(n) | **O(1)** ✨ | No extra storage needed! |
| Array marking (if possible) | O(n) | O(1)* | Modifies input |

> ⭐ Key Benefit
> 
> 
> Fast/slow achieves O(1) space WITHOUT modifying the input!
> 

# 2. Pattern Variations

## Common Applications & Complexity

The fast and slow pointer technique can be applied to solve different types of problems. Each variation uses the same core concept but with slight modifications to achieve specific goals.

| Operation | Time | Space |
| --- | --- | --- |
| Cycle Detection | O(n) | O(1) |
| Find Cycle Entry | O(n) | O(1) |
| Find Middle | O(n) | O(1) |
| Nth from End | O(n) | O(1) |
| Palindrome Check | O(n) | O(1) |

### Variation 1: Cycle Detection

**Goal:** Determine if a cycle exists in a linked list or sequence.

```
Linear (No Cycle):           Cyclic:
1 → 2 → 3 → 4 → NULL         1 → 2 → 3 → 4
                                 ↑       ↓
                                 7 ← 6 ← 5

```

**How it works:** If fast reaches `NULL`, no cycle. If fast meets slow, cycle exists.

### Variation 2: Cycle Entry Point (Floyd's Algorithm Phase 2)

**Goal:** Find the exact node where the cycle begins.

> 📋 Two-Phase Approach
> 
> 1. **Phase 1:** Detect cycle (find meeting point)
> 2. **Phase 2:** Find entry point (reset one pointer to head)

### Variation 3: Middle Finding

**Goal:** Find the middle element of a linked list in one pass.

```
List: 1 → 2 → 3 → 4 → 5

When fast reaches end, slow is at middle!

Odd length:  1 → 2 → [3] → 4 → 5     → Middle is 3
Even length: 1 → 2 → [3] → 4         → Middle is 3 (first middle)
             1 → 2 → 3 → [4]         → Middle is 4 (second middle)

```

> 💡 Why It Works
> 
> 
> Fast travels 2x the distance. When fast finishes, slow is at 1/2.
> 

### Variation 4: Nth from End

**Goal:** Find the nth node from the end without knowing list length.

**Approach:** Move fast pointer `n` steps ahead first, then move both together.

```jsx
Find 2nd from end in: 1 → 2 → 3 → 4 → 5

Step 1: Move fast 2 steps ahead

        slow            fast
         ↓               ↓
         1 → 2 → 3 → 4 → 5

Step 2: Move both until fast reaches end

                     slow      fast
                      ↓         ↓
          1 → 2 → 3 → 4 → 5 → NULL

Result: slow points to 4 (2nd from end) ✓
```

### Variation 5: Palindrome Check

**Goal:** Check if a linked list is a palindrome using O(1) space.

> 📋 Approach
> 
> 1. Find middle using fast/slow
> 2. Reverse second half
> 3. Compare first half with reversed second half
> 4. *(Optional)* Restore the list

# 3. Code Templates

### Template 1: Cycle Detection

```python
def has_cycle(head: ListNode) -> bool:
    """
    Detect if a linked list has a cycle.

    Returns: True if cycle exists, False otherwise
    """
    # Edge case: empty list or single node without cycle
    if not head or not head.next:
        return False

    # Initialize pointers
    slow = head
    fast = head

    # Traverse with different speeds
    while fast and fast.next:
        slow = slow.next          # Move slow by 1
        fast = fast.next.next     # Move fast by 2

        # If they meet, cycle exists
        if slow == fast:
            return True

    # Fast reached end, no cycle
    return False

```

> 📌 Key Points
> 
> - Check `fast and fast.next` to avoid null pointer errors
> - Pointers start at the same position (head)
> - Meeting means cycle; reaching `NULL` means no cycle

### Template 2: Find Cycle Entry Point

```python
def detect_cycle_entry(head: ListNode) -> ListNode:
    """
    Find the node where the cycle begins.

    Returns: The entry node of cycle, or None if no cycle
    """
    if not head or not head.next:
        return None

    # Phase 1: Detect cycle and find meeting point
    slow = head
    fast = head

    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next

        if slow == fast:
            # Cycle detected! Now find entry point
            break
    else:
        # No cycle (fast reached end)
        return None

    # Phase 2: Find cycle entry
    # Reset one pointer to head, keep other at meeting point
    slow = head

    while slow != fast:
        slow = slow.next
        fast = fast.next  # Both move at same speed now!

    return slow  # This is the cycle entry point

```

> 📌 Key Points
> 
> - Phase 2 uses **SAME speed** for both pointers
> - The meeting point in Phase 2 is the cycle entry
> - Math proof explained in Section 7

### Template 3: Find Middle Element

```python
def find_middle(head: ListNode) -> ListNode:
    """
    Find the middle node of a linked list.
    For even length, returns the FIRST middle node.

    Example: 1→2→3→4 returns node 2
             1→2→3→4→5 returns node 3
    """
    if not head:
        return None

    slow = head
    fast = head

    # Check fast.next.next for "first middle" behavior
    while fast.next and fast.next.next:
        slow = slow.next
        fast = fast.next.next

    return slow

def find_middle_second(head: ListNode) -> ListNode:
    """
    Find the middle node of a linked list.
    For even length, returns the SECOND middle node.

    Example: 1→2→3→4 returns node 3
             1→2→3→4→5 returns node 3
    """
    if not head:
        return None

    slow = head
    fast = head

    # Slightly different condition
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next

    return slow

```

> 📌 Key Points
> 
> 
> 
> | Condition | Even-Length Result |
> | --- | --- |
> | `while fast.next and fast.next.next` | First middle |
> | `while fast and fast.next` | Second middle |

### Template 4: Nth Node from End

```python
def find_nth_from_end(head: ListNode, n: int) -> ListNode:
    """
    Find the nth node from the end of the list.
    n=1 means the last node, n=2 means second to last, etc.

    Returns: The nth node from end, or None if n exceeds list length
    """
    if not head or n <= 0:
        return None

    slow = head
    fast = head

    # Move fast pointer n steps ahead
    for _ in range(n):
        if not fast:
            return None  # n is larger than list length
        fast = fast.next

    # Move both pointers until fast reaches the end
    while fast:
        slow = slow.next
        fast = fast.next

    return slow

```

> 📌 Key Points
> 
> - Create a "gap" of `n` nodes between slow and fast
> - When fast hits `NULL`, slow is at the nth from end
> - Useful for "remove nth from end" problems too

### Template 5: Palindrome Linked List

```python
def is_palindrome(head: ListNode) -> bool:
    """
    Check if a linked list is a palindrome using O(1) extra space.

    Example: 1→2→2→1 returns True
             1→2→3 returns False
    """
    if not head or not head.next:
        return True

    # Step 1: Find the middle
    slow = head
    fast = head

    while fast.next and fast.next.next:
        slow = slow.next
        fast = fast.next.next

    # Step 2: Reverse the second half
    second_half_start = reverse_list(slow.next)

    # Step 3: Compare both halves
    first_half = head
    second_half = second_half_start
    result = True

    while second_half:
        if first_half.val != second_half.val:
            result = False
            break
        first_half = first_half.next
        second_half = second_half.next

    # Step 4 (Optional): Restore the list
    slow.next = reverse_list(second_half_start)

    return result

def reverse_list(head: ListNode) -> ListNode:
    """Helper function to reverse a linked list."""
    prev = None
    current = head

    while current:
        next_node = current.next
        current.next = prev
        prev = current
        current = next_node

    return prev

```

> 📌 Key Points
> 
> - Combines multiple techniques: middle finding + reversal + comparison
> - Optional restoration maintains list integrity
> - Works for both odd and even length lists

# 4. Visual Walkthrough

### Scenario 1: No Cycle — Fast Reaches End

```
Initial State:

    1 → 2 → 3 → 4 → 5 → NULL
    ↑
  slow
  fast

Step 1:

    1 → 2 → 3 → 4 → 5 → NULL
        ↑   ↑
      slow fast

Step 2:

    1 → 2 → 3 → 4 → 5 → NULL
            ↑       ↑
          slow    fast

Step 3:

    1 → 2 → 3 → 4 → 5 → NULL
                ↑        ↑
              slow     fast (fast.next is NULL)

✅ Loop ends: fast reached end → NO CYCLE
```

### Scenario 2: Cycle Exists — Pointers Meet

```
List with cycle (4 → 2):

    1 → 2 → 3 → 4
        ↑       ↓
        └───────┘

Initial:

    1 → 2 → 3 → 4 ─┐
    ↑   ↑          ↓
  slow  |          |
  fast  └──────────┘

Step 1: slow → 2, fast → 3

    1 → 2 → 3 → 4 ─┐
        ↑   ↑      ↓
      slow fast    |
        └──────────┘

Step 2: slow → 3, fast → 2 (went 4→2)

    1 → 2 → 3 → 4 ─┐
        ↑   ↑      ↓
      fast slow    |
        └──────────┘

Step 3: slow → 4, fast → 4
    1 → 2 → 3 → 4 ─┐
        ↑       ↑  ↓
        |     slow |
        └──── fast ┘

🎯 THEY MEET! → CYCLE DETECTED
```

### Scenario 3: Finding Cycle Entry Point (Phase 2)

```
List: 1 → 2 → 3 → 4 → 5 → 6
              ↑           ↓
              └───────────┘

Cycle entry is node 3. Cycle length is 4.

┌─────────────────────────────────────────┐
│ Phase 1: Detect cycle, find meeting pt  │
└─────────────────────────────────────────┘
    → slow and fast will meet somewhere inside the cycle

┌─────────────────────────────────────────┐
│ Phase 2: Find entry point               │
└─────────────────────────────────────────┘
    → Reset slow to head (node 1)
    → Keep fast at meeting point
    → Move BOTH at speed 1
    → They meet at node 3 (the entry!)
```

### Scenario 4: Finding Middle Element

```
┌─────────────────────────────────────────┐
│ ODD LENGTH: 1 → 2 → 3 → 4 → 5           │
└─────────────────────────────────────────┘

Step 0:     1 → 2 → 3 → 4 → 5 → NULL
            ↑
          slow, fast

Step 1:     1 → 2 → 3 → 4 → 5 → NULL
                ↑   ↑
              slow fast

Step 2:     1 → 2 → 3 → 4 → 5 → NULL
                    ↑       ↑
                  slow    fast

✅ fast.next.next is NULL, loop ends
   Middle = slow = node 3

┌─────────────────────────────────────────┐
│ EVEN LENGTH: 1 → 2 → 3 → 4              │
└─────────────────────────────────────────┘

Using "first middle" (fast.next and fast.next.next):
    → Stops at slow = node 2

Using "second middle" (fast and fast.next):
    → Stops at slow = node 3

```

# 5. Core Problems & Solutions

### Problem 1: Linked List Cycle

> 🏷️ `LeetCode 141` | `Easy`
> 

**Problem:** Given the head of a linked list, determine if the linked list has a cycle.

**Why Fast/Slow:** Classic cycle detection. If there's a cycle, the faster pointer will eventually catch up to the slower one.

```python
class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        if not head or not head.next:
            return False

        slow = head
        fast = head

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

            if slow == fast:
                return True

        return False

```

**Dry Run**

```
Input: 3 → 2 → 0 → -4 (cycle: -4 → 2)
              ↑        ↓
              └────────┘

Initial: slow=3, fast=3
Step 1:  slow=2, fast=0
Step 2:  slow=0, fast=2 (fast went -4→2)
Step 3:  slow=-4, fast=-4

slow == fast → Return True ✓

```

</details>

### Problem 2: Linked List Cycle II

> 🏷️ `LeetCode 142` | `Medium`
> 

**Problem:** Given a linked list, return the node where the cycle begins. If there is no cycle, return null.

**Why Fast/Slow:** Phase 1 detects the cycle, Phase 2 finds the exact entry point using the mathematical property of distances.

```python
class Solution:
    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if not head or not head.next:
            return None

        # Phase 1: Find meeting point
        slow = fast = head

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

            if slow == fast:
                # Phase 2: Find cycle entry
                slow = head
                while slow != fast:
                    slow = slow.next
                    fast = fast.next
                return slow

        return None

```

**Dry Run**

```
Input: 3 → 2 → 0 → -4
           ↑        ↓
           └────────┘

Cycle entry is node 2.

Phase 1:
  Step 1: slow=2, fast=0
  Step 2: slow=0, fast=2
  Step 3: slow=-4, fast=-4 ✓ They meet at -4

Phase 2:
  Reset slow to head (3), keep fast at -4
  Step 1: slow=2, fast=2 ✓ They meet at 2

Return node 2 (the cycle entry) ✓

```

### Problem 3: Middle of Linked List

> 🏷️ `LeetCode 876` | `Easy`
> 

**Problem:** Given the head of a singly linked list, return the middle node. If there are two middle nodes, return the second middle node.

**Why Fast/Slow:** When fast completes the list, slow is exactly at the halfway point.

```python
class Solution:
    def middleNode(self, head: Optional[ListNode]) -> Optional[ListNode]:
        slow = head
        fast = head

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

        return slow

```

**Dry Run:**

```
Input: 1 → 2 → 3 → 4 → 5

Step 0: slow=1, fast=1
Step 1: slow=2, fast=3
Step 2: slow=3, fast=5
Step 3: fast.next is NULL, loop ends

Return slow = node 3 ✓

---

Input: 1 → 2 → 3 → 4 → 5 → 6

Step 0: slow=1, fast=1
Step 1: slow=2, fast=3
Step 2: slow=3, fast=5
Step 3: slow=4, fast=NULL (beyond 6)

Return slow = node 4 ✓ (second middle)

```

### Problem 4: Happy Number

> 🏷️ `LeetCode 202` | `Easy`
> 

**Problem:** A happy number is defined by: replace the number by the sum of squares of its digits. Repeat until it equals 1 (happy) or loops endlessly (not happy).

**Why Fast/Slow:** The sequence either reaches 1 or enters a cycle. This is cycle detection in a **number sequence**, not a linked list!

```python
class Solution:
    def isHappy(self, n: int) -> bool:
        def get_next(num: int) -> int:
            """Calculate sum of squares of digits."""
            total = 0
            while num > 0:
                digit = num % 10
                total += digit * digit
                num //= 10
            return total

        slow = n
        fast = get_next(n)

        while fast != 1 and slow != fast:
            slow = get_next(slow)
            fast = get_next(get_next(fast))

        return fast == 1

```

**Dry Run:**

```
Input: n = 19

Sequence: 19 → 82 → 68 → 100 → 1 ✓
          1²+9²=82, 8²+2²=68, 6²+8²=100, 1²+0²+0²=1

fast reaches 1 → Return True (Happy Number!) 🎉

---

Input: n = 2

Sequence: 2 → 4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4 (cycle!)

Eventually slow and fast meet inside the cycle.

fast != 1 and slow == fast → Return False ✗
```

### Problem 5: Find the Duplicate Number

> 🏷️ `LeetCode 287` | `Medium`
> 

**Problem:** Given an array of `n + 1` integers where each integer is in `[1, n]`, find the duplicate WITHOUT modifying the array and using O(1) space.

> 🧠 Key Insight
> 
> 
> Treat the array as a "linked list" where each value points to the next index. A duplicate creates a cycle, and the duplicate value IS the cycle entry point!
> 

```python
class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        # Phase 1: Find the meeting point in the cycle
        slow = nums[0]
        fast = nums[0]

        while True:
            slow = nums[slow]           # Move one step
            fast = nums[nums[fast]]     # Move two steps
            if slow == fast:
                break

        # Phase 2: Find the cycle entrance (the duplicate)
        slow = nums[0]
        while slow != fast:
            slow = nums[slow]
            fast = nums[fast]

        return slow

```

**Dry Run:**

```
Input: nums = [1, 3, 4, 2, 2]
       Index:  0  1  2  3  4

Treating values as "next pointers":
  Index 0 → Index 1 (value 1)
  Index 1 → Index 3 (value 3)
  Index 2 → Index 4 (value 4)
  Index 3 → Index 2 (value 2)
  Index 4 → Index 2 (value 2)  ← Two indices point to 2!

Visualize as linked list:
  0 → 1 → 3 → 2 → 4
              ↑   ↓
              └───┘

Phase 1:
  slow = 1, fast = 1 (both start at nums[0])
  Iteration 1: slow = 3, fast = 2
  Iteration 2: slow = 2, fast = 2
  slow == fast == 2 → Meeting point found

Phase 2:
  Reset slow to nums[0] = 1, keep fast = 2
  Iteration 1: slow = 3, fast = 4
  Iteration 2: slow = 2, fast = 2
  slow == fast == 2 → Return 2 (the duplicate!) ✓

```

### Problem 6: Palindrome Linked List

> 🏷️ `LeetCode 234` | `Medium`
> 

**Problem:** Given the head of a singly linked list, return true if it is a palindrome.

**Why Fast/Slow:** Use fast/slow to find the middle, then reverse the second half to compare. Achieves O(1) space!

```python
class Solution:
    def isPalindrome(self, head: Optional[ListNode]) -> bool:
        if not head or not head.next:
            return True

        # Step 1: Find the middle (end of first half)
        slow = head
        fast = head

        while fast.next and fast.next.next:
            slow = slow.next
            fast = fast.next.next

        # Step 2: Reverse second half
        second_half = self.reverseList(slow.next)

        # Step 3: Compare halves
        first_half = head
        while second_half:
            if first_half.val != second_half.val:
                return False
            first_half = first_half.next
            second_half = second_half.next

        return True

    def reverseList(self, head: ListNode) -> ListNode:
        prev = None
        curr = head
        while curr:
            next_temp = curr.next
            curr.next = prev
            prev = curr
            curr = next_temp
        return prev

```

**Dry Run:**

```
Input: 1 → 2 → 2 → 1

Step 1: Find middle
  Middle (end of first half) = node 2 (first one)

Step 2: Reverse second half (after slow)
  Second half: 2 → 1 becomes 1 → 2

  Now we have:
  First half:  1 → 2
  Second half: 1 → 2 (reversed)

Step 3: Compare
  1 == 1 ✓
  2 == 2 ✓

Return True (Palindrome!) ✓
```

# 6. Edge Cases Checklist

### Always Test These Scenarios

| Edge Case | Example | What to Check |
| --- | --- | --- |
| Empty list | `head = None` | Return early, avoid null pointer |
| Single node | `1 → NULL` | Often trivially true/false |
| Two nodes | `1 → 2 → NULL` | Boundary for middle finding |
| Two nodes with cycle | `1 ↔ 2` | Cycle at start |
| Self-loop | `1 ↺` | Simplest cycle case |
| Cycle at head | `1 → 2 → 3 → 1` | Entry point is head |
| Cycle in middle | `1 → 2 → 3 → 4 → 2` | Entry point is not head |
| Odd length | `1 → 2 → 3` | Middle is clear |
| Even length | `1 → 2 → 3 → 4` | Which middle? |
| Long tail before cycle | `1→2→3→4→5→6→4` | Long linear part |
| Small cycle | Length 1 or 2 | Still works? |

### Code Snippets for Edge Cases

```python
# Empty or single node
if not head or not head.next:
    return False  # or True, or None, depending on problem

# Before moving fast.next.next, always check:
while fast and fast.next:  # Prevents null pointer!
    # safe to access fast.next.next here

# For "first middle" in even lists:
while fast.next and fast.next.next:
    # stops earlier, giving first middle

# For "second middle" in even lists:
while fast and fast.next:
    # stops later, giving second middle
```

# 7. The Math Behind It

### Why Do Fast and Slow Pointers Meet Inside a Cycle?

```
Variables:
├── L = distance from head to cycle entry
├── C = cycle length
└── k = distance from cycle entry to meeting point

When slow enters the cycle:
├── Slow has traveled: L steps
├── Fast has traveled: 2L steps
└── Fast's position in cycle: L mod C steps ahead of entry

Inside the cycle:
├── Fast is some distance behind slow (wrapping around)
├── Each step, fast gains 1 on slow
└── After at most C steps, they meet!

🎯 Key: The cycle has finite length, so fast WILL catch slow.
```

### Why Does Phase 2 Find the Cycle Entry?

> 🧠 This is the Beautiful Part
> 

```
At the meeting point:
├── Slow traveled: L + k steps
└── Fast traveled: L + k + nC steps (same path + n complete cycles)

Since fast travels twice as fast:
    2(L + k) = L + k + nC
    L + k = nC
    L = nC - k
    L = (n-1)C + (C - k)

What does this mean?
├── L = (n-1) complete cycles + (C - k) remaining steps
└── (C - k) is the distance from meeting point TO cycle entry!
```

### The Magic of Phase 2

```
If we:
1. Put one pointer at HEAD
2. Keep one pointer at MEETING POINT
3. Move both at the SAME SPEED

They will meet at the CYCLE ENTRY! 🎯

Why?
├── Pointer from head travels L steps to reach entry
├── Pointer from meeting travels (C-k) + (n-1)C steps to reach entry
└── These are equal! L = (n-1)C + (C-k)
```

### Visual Proof

```
             L              k
    HEAD ─────────→ ENTRY ─────→ MEETING
                      ↑            ↓
                      └────────────┘
                          C - k

Distance from HEAD to ENTRY: L
Distance from MEETING to ENTRY (forward): C - k

We proved: L ≡ (C - k) modulo complete cycles

So both pointers reach ENTRY at the same time! ✓

```

> 💡 The Key Takeaway
> 
> 
> Don't memorize formulas. Remember:
> 
> - Phase 1 meeting point has a special distance relationship with entry
> - In Phase 2, equal speeds from head and meeting point guarantee meeting at entry
> - Trust the algorithm; it's been proven for 50+ years!

# 8. Tricks & Patterns to Remember

### Recognition Signals

```
┌─────────────────────────────────────────────────────────────────┐
│                   FAST/SLOW TRIGGER WORDS                       │
├─────────────────────────────────────────────────────────────────┤
│ "cycle"        │ "circular"      │ "loop"          │ "repeated" │
│ "middle"       │ "halfway"       │ "center"        │ "median"   │
│ "nth from end" │ "kth from last" │ "without length"│            │
│ "constant O(1) space" + linked list operations                  │
│ "duplicate in range [1,n]" + cannot modify array                │
│ "infinite"     │ "terminates"    │ "converges"     │            │
└─────────────────────────────────────────────────────────────────┘
```

### Common Mistakes and How to Avoid Them

**Mistake 1: Null Pointer Exception**

```python
# WRONG - will crash if fast is at last node
while fast.next:
    fast = fast.next.next  # 💥 Crash!

# ✅ CORRECT - check both fast and fast.next
while fast and fast.next:
    fast = fast.next.next  # Safe!
```

**Mistake 2: Off-by-One in Middle Finding**

```python
# Gets FIRST middle for even length
while fast.next and fast.next.next:
    ...

# Gets SECOND middle for even length
while fast and fast.next:
    ...
```

> 💡 Remember: "Problem says second middle? Use fast and fast.next"
> 

Mistake 3: Forgetting Phase 2

```python
# ❌ INCOMPLETE - only detects cycle
if slow == fast:
    return True  # Found cycle, but WHERE?

# ✅ COMPLETE - finds the exact entry point
if slow == fast:
    slow = head
    while slow != fast:
        slow = slow.next
        fast = fast.next
    return slow  # This is the entry!
```

**Mistake 4: Wrong Pointer Comparison**

```python
# ❌ WRONG - comparing values
if slow.val == fast.val:  # Different nodes can have same value!

# ✅ CORRECT - comparing node references
if slow == fast:  # Same actual node object
```

### Memory Tricks & Mnemonics

| Mnemonic | Meaning |
| --- | --- |
| 🐢🐇 **"Tortoise and Hare"** | Tortoise = 1 step, Hare = 2 steps. In a loop, hare catches tortoise! |
| 🏃 **"Circular Track Rule"** | No loop? Hare falls off. Loop? Hare catches up. |
| 🔢 **"Phase 2 Same Speed"** | Phase 1: Different speeds to DETECT. Phase 2: Same speeds to LOCATE. |
| 📍 **"Meeting Point Magic"** | Reset + same speed = entry point |
| 🎯 **"Fast Checks, Slow Marks"** | Fast validates path exists. Slow marks answer position. |

### Quick Decision Tree

```
Is there a cycle/loop involved?
├── YES → Fast/slow for cycle detection
│         └── Need entry point? Add Phase 2
│
├── Need middle element?
│   └── YES → Fast/slow, fast travels 2x
│
├── Need nth from end without length?
│   └── YES → Gap technique (move fast n ahead first)
│
├── Linked list palindrome with O(1) space?
│   └── YES → Middle + reverse + compare
│
└── Array with values in [1,n], find duplicate, O(1) space?
    └── YES → Treat array as implicit linked list!
```

# 9. Comparison with Related Patterns

### Fast/Slow vs Two Pointers (Opposite Ends)

| Aspect | Fast/Slow | Two Pointers (Opposite) |
| --- | --- | --- |
| **Pointer Init** | Both at start | One at start, one at end |
| **Movement** | Same direction, diff speed | Opposite directions |
| **Data Structure** | Linked list, sequences | Arrays (need random access) |
| **Use Cases** | Cycles, middle, nth from end | Two sum, container, palindrome (array) |
| **Key Insight** | Speed difference reveals cycles | Shrinking window finds pairs |

```
Fast/Slow:                  Two Pointers (Opposite):
→ → → → → → →               ← ← ← ● → → →
slow  fast                  left    right
(same direction)            (opposite directions)
```

### Fast/Slow vs HashSet Approach

| Aspect | Fast/Slow | HashSet |
| --- | --- | --- |
| **Space** | O(1) ✨ | O(n) |
| **Time** | O(n) | O(n) |
| **Can Find Entry?** | Yes (Phase 2) | Yes (first repeat) |
| **Modifies Input?** | No | No |
| **Code Complexity** | More complex | Simpler |
| **Interview Impression** | Shows algorithmic skill 💪 | Shows practical approach |

```python
# HashSet approach (simpler but O(n) space)
def has_cycle_hashset(head):
    seen = set()
    while head:
        if head in seen:
            return True
        seen.add(head)
        head = head.next
    return False

# Fast/Slow approach (O(1) space, more impressive)
def has_cycle_fast_slow(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow == fast:
            return True
    return False

```

### Fast/Slow vs Marking Visited

| Aspect | Fast/Slow | Marking Visited |
| --- | --- | --- |
| **Space** | O(1) | O(1) |
| **Modifies Input?** | No ✨ | YES |
| **Reversible?** | N/A | Sometimes |
| **Works on Arrays?** | Limited | Common |
| **When to Use** | Can't modify input | Allowed to modify |

### **When to Use Which?**

```
┌─────────────────────────────────────────────────────────────────┐
│                    PATTERN SELECTION GUIDE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  "Cycle in linked list?"                                        │
│       └── Fast/Slow (classic application)                       │
│                                                                 │
│  "O(1) space constraint + cycle/middle/nth?"                    │
│       └── Fast/Slow                                             │
│                                                                 │
│  "Find pair in sorted array?"                                   │
│       └── Two Pointers (opposite ends)                          │
│                                                                 │
│  "Subarray/substring with condition?"                           │
│       └── Sliding Window                                        │
│                                                                 │
│  "Quick implementation, space doesn't matter?"                  │
│       └── HashSet                                               │
│                                                                 │
│  "Array can be modified?"                                       │
│       └── Consider marking approach                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
