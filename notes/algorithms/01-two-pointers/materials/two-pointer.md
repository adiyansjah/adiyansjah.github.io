# Two Pointers

### Table of Contents

# 1. Introduction

## What is Two Pointers?

The **Two Pointers** technique uses two variables (pointers) that traverse a data structure—typically an array or string—to solve problems efficiently.

> 💡 Core Idea
> 
> 
> Instead of using nested loops `O(n²)`, we strategically move two pointers based on certain conditions to achieve `O(n)` time complexity.
> 

**Simple Analogy:**

Think of two people searching a bookshelf. Instead of one person checking every book against every other book, two people start at different positions and coordinate their search.

## When to Use It

**Problem Indicators**

Look for these keywords in problem statements:p

| Keyword | Typical Problem |
| --- | --- |
| `sorted array` | Two Sum II |
| `find a pair` | Pair with target sum |
| `in-place` | Remove duplicates |
| `reverse` | Reverse string |
| `palindrome` | Valid palindrome |
| `subarray / substring` | Minimum window |
| `merge two arrays` | Merge sorted arrays |
| `cycle detection` | Linked list cycle |
| `remove element` | Remove element |
| `container / water` | Container with most water |

**Use It When**

- Array/String is **sorted** (or can be sorted)
- Finding **pairs or triplets** with certain properties
- Doing something **in-place** with O(1) space
- **Comparing elements** from both ends
- **Partitioning** an array
- Detecting **cycles** in linked lists

## Complexity Benefits

| Approach | Time | Space | Verdict |
| --- | --- | --- | --- |
| Brute Force | O(n²) | O(1) | ❌ Slow |
| Hash Map | O(n) | O(n) | ⚠️ Extra space |
| Two Pointers | O(n) | O(1) | ✅ Optimal |

> 🎯 Key Insight
> 
> 
> Two Pointers gives you the best of both worlds — **linear time AND constant space!**
> 

# 2. Pattern Variations

## **Six Core Variations of the Two Pointers Technique**

The Two Pointers pattern isn't just one approach—it's a family of related techniques that solve different types of problems. Understanding these variations will help you quickly identify which approach to use for a given problem. Each variation has its own pointer movement pattern, initialization strategy, and typical use cases.

| # | Variation | Movement | Key Use Case |
| --- | --- | --- | --- |
| 1 | Opposite Direction | → ← toward center | Pairs, palindrome check |
| 2 | Same Direction (Slow-Fast) | → → same direction | Remove elements, cycles |
| 3 | Two Different Arrays | → → on separate arrays | Merge, intersection |
| 4 | Expand from Center | ← → outward from center | Longest palindrome |
| 5 | Three-Way Partitioning | Three pointers | Dutch National Flag |
| 6 | Backward Fill | ← fill from end | Merge without extra space |

### Variation 1: Opposite Direction

**Pointers start at opposite ends and move toward each other**

```jsx
Array: [ 1,  2,  3,  4,  5,  6, 7 ]
         ↑                      ↑
        left                  right

→ Pointers move TOWARD each other until they meet
```

**Use Cases:**

- Finding pairs in sorted array
- Checking palindromes
- Container with most water
- Reversing arrays
- Binary search variations

**Movement Rules:**

- `left` starts at index `0`
- `right` starts at index `n - 1`
- Move one or both pointers based on condition
- Stop when `left >= right`

### Variation 2: Same Direction (Slow-Fast)

**Both pointers move in the same direction at different speeds**

```
Array: [ 1,  2,  2,  3,  3,  3,  4 ]
         ↑   ↑
        slow fast

→ Both move RIGHT, fast explores ahead
```

**Use Cases:**

- Removing duplicates from sorted array
- Removing specific elements
- Linked list cycle detection (Floyd's algorithm)
- Finding middle of linked list
- Partitioning arrays

**Movement Rules:**

- Both start at beginning (or `slow=0`, `fast=1`)
- `fast` explores ahead
- `slow` marks position for valid elements
- Stop when `fast` reaches the end

### Variation 3: Two Different Arrays

**Each pointer traverses its own array**

```
Array A: [ 1,  3,  5,  7 ]
           ↑
           i

Array B: [ 2,  4,  6,  8 ]
           ↑
           j

→ Compare elements, move pointer(s) based on comparison

```

**Use Cases:**

- Merging sorted arrays
- Finding intersection of arrays
- Comparing sorted sequences

**Movement Rules:**

- Each pointer starts at beginning of its array
- Compare elements, move pointer(s) based on comparison
- Stop when either pointer reaches its array's end

### Variation 4: Expand from Center

**Pointers start at center and expand outward**

```jsx
String: "b a b a d"
             ↑
           center
          ↙     ↘
         L       R

→ Expand outward while characters match
```

**Use Cases:**

- Longest palindromic substring
- Shortest palindrome
- Count palindromic substrings

**Movement Rules:**

- Start with center position(s)
- `left` moves left, `right` moves right
- Continue while elements match
- Handle both odd and even length cases

### Variation 5: Three-Way Partitioning

**Three pointers partition array into three sections**

```
Array: [ 2,  0,  2,  1,  1,  0 ]
         ↑               ↑   ↑
        low             mid high

→ Partition into: [0s] [1s] [2s]
```

**Use Cases:**

- Dutch National Flag (Sort Colors)
- Partition array around pivot
- Three-way quicksort partition
- Segregate negative/zero/positive

**Movement Rules:**

- `low` = boundary of first section
- `mid` = current element being examined
- `high` = boundary of third section
- Process until `mid > high`

### Variation 6: Backward Fill

**Fill result from end to avoid overwriting**

```
nums1: [ 1,  2,  3,  0,  0,  0 ]
                 ↑           ↑
                 p1        write

nums2: [ 2,  5,  6 ]
                 ↑
                 p2

→ Compare from end, write larger values first
```

**Use Cases:**

- Merge sorted array in-place
- Squares of sorted array
- Any problem where you need to fill without overwriting

**Movement Rules:**

- Pointers start at end of valid data
- Write position starts at end of result space
- Compare and write larger/appropriate element
- Move pointers backward

# 3. Code Templates

### Template 1: Opposite Direction

```python
def opposite_direction(arr, target):
    """
    Use for: Two Sum II, Valid Palindrome, Container With Most Water
    """
    left = 0
    right = len(arr) - 1

    while left < right:
        current = arr[left] + arr[right]  # or other calculation

        if current == target:
            return [left, right]  # found answer
        elif current < target:
            left += 1   # need larger value
        else:
            right -= 1  # need smaller value

    return None  # no solution
```

> 🔑 Key Decisions
> 
> 1. **Init:** `left = 0`, `right = len(arr) - 1`
> 2. **Loop:** `while left < right` (most common)
> 3. **Move:** Based on comparison with target
> 4. **Stop:** Pointers meet or cross

### Template 2: Same Direction (Slow-Fast)

```python
def same_direction(arr):
    """
    Use for: Remove Duplicates, Remove Element, Move Zeroes
    """
    if not arr:
        return 0

    slow = 0  # position for next valid element

    for fast in range(len(arr)):
        if arr[fast] != arr[slow]:  # or some condition
            slow += 1
            arr[slow] = arr[fast]

    return slow + 1  # length of valid portion
```

**Alternative with explicit fast pointer:**

```python
def same_direction_v2(arr, val):
    """
    Remove all instances of val in-place
    """
    slow = 0
    fast = 0

    while fast < len(arr):
        if arr[fast] != val:  # valid element
            arr[slow] = arr[fast]
            slow += 1
        fast += 1  # fast ALWAYS moves

    return slow
```

> 🔑 Key Decisions
> 
> 1. **Slow:** Marks boundary of processed/valid elements
> 2. **Fast:** Explores and finds elements to process
> 3. **Condition:** What makes an element "valid"?
> 4. **Return:** Usually new length or slow position

### Template 3: Two Arrays

```python
def two_arrays(arr1, arr2):
    """
    Use for: Merge Sorted Arrays, Intersection of Arrays
    """
    i, j = 0, 0
    result = []

    while i < len(arr1) and j < len(arr2):
        if arr1[i] < arr2[j]:
            result.append(arr1[i])
            i += 1
        elif arr1[i] > arr2[j]:
            result.append(arr2[j])
            j += 1
        else:  # equal
            result.append(arr1[i])
            i += 1
            j += 1

    # Handle remaining elements
    while i < len(arr1):
        result.append(arr1[i])
        i += 1

    while j < len(arr2):
        result.append(arr2[j])
        j += 1

    return result
```

> 🔑 Key Decisions
> 
> 1. **Two pointers:** One for each array
> 2. **Compare:** Which element is smaller/equal/larger?
> 3. **Move:** Pointer of array with smaller element
> 4. **Cleanup:** Don't forget remaining elements!

### Template 4: Expand from Center

```python
def expand_from_center(s, left, right):
    """
    Expand outward while characters match.
    Use for: Longest Palindromic Substring, Count Palindromes
    """
    while left >= 0 and right < len(s) and s[left] == s[right]:
        left -= 1
        right += 1
    
    # Return the valid palindrome bounds (after loop, pointers are 1 step beyond)
    return left + 1, right - 1

def longest_palindrome(s):
    """
    Find longest palindromic substring
    """
    if not s:
        return ""
    
    start, end = 0, 0
    
    for i in range(len(s)):
        # Odd length palindrome (single center)
        l1, r1 = expand_from_center(s, i, i)
        
        # Even length palindrome (double center)
        l2, r2 = expand_from_center(s, i, i + 1)
        
        # Update if we found longer palindrome
        if r1 - l1 > end - start:
            start, end = l1, r1
        if r2 - l2 > end - start:
            start, end = l2, r2
    
    return s[start:end + 1]
```

> 🔑 Key Decisions
> 
> 1. **Center:** Try each position as potential center
> 2. **Two Cases:** Handle both odd (single center) and even (double center) lengths
> 3. **Expand:** Move outward while characters match
> 4. **Bounds:** Track start and end of longest found

### Template 5: Three-Way Partitioning (Dutch National Flag)

```python
def three_way_partition(arr, pivot):
    """
    Partition array into three sections: [< pivot] [== pivot] [> pivot]
    Use for: Sort Colors, Partition Around Pivot
    """
    low = 0              # boundary of "less than" section
    mid = 0              # current element
    high = len(arr) - 1  # boundary of "greater than" section
    
    while mid <= high:
        if arr[mid] < pivot:
            # Move to "less than" section
            arr[low], arr[mid] = arr[mid], arr[low]
            low += 1
            mid += 1
        elif arr[mid] > pivot:
            # Move to "greater than" section
            arr[mid], arr[high] = arr[high], arr[mid]
            high -= 1
            # Don't increment mid - need to check swapped element
        else:
            # Equal to pivot, already in correct section
            mid += 1
    
    return arr
```

**Sort Colors (0, 1, 2):**

```python
def sort_colors(nums):
    """
    Sort array of 0s, 1s, and 2s in-place
    LeetCode #75
    """
    low = 0              # next position for 0
    mid = 0              # current position
    high = len(nums) - 1 # next position for 2
    
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 2:
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1
        else:  # nums[mid] == 1
            mid += 1
```

> 🔑 Key Decisions
> 
> 1. **Three Sections:** `[0..low-1]` < pivot, `[low..mid-1]` == pivot, `[high+1..n-1]` > pivot
> 2. **Don't Move Mid After High Swap:** The swapped element hasn't been checked yet
> 3. **Loop Condition:** `while mid <= high` (not `<`)
> 4. **Result:** Array partitioned in-place

### Template 6: Backward Fill

```python
def backward_fill(nums1, m, nums2, n):
    """
    Merge nums2 into nums1 without extra space.
    Fill from the end to avoid overwriting.
    Use for: Merge Sorted Array
    """
    p1 = m - 1           # last element in nums1's data
    p2 = n - 1           # last element in nums2
    write = m + n - 1    # write position (end of nums1)
    
    while p2 >= 0:
        if p1 >= 0 and nums1[p1] > nums2[p2]:
            nums1[write] = nums1[p1]
            p1 -= 1
        else:
            nums1[write] = nums2[p2]
            p2 -= 1
        write -= 1
    
    # No need to handle remaining p1 - already in place
```

**Squares of Sorted Array (Backward Fill):**

```python
def sorted_squares(nums):
    """
    Return squares in sorted order.
    Largest squares are at the ends (due to negatives).
    """
    n = len(nums)
    result = [0] * n
    left, right = 0, n - 1
    write = n - 1  # fill from end
    
    while left <= right:
        left_sq = nums[left] ** 2
        right_sq = nums[right] ** 2
        
        if left_sq > right_sq:
            result[write] = left_sq
            left += 1
        else:
            result[write] = right_sq
            right -= 1
        write -= 1
    
    return result
```

> 🔑 Key Decisions
> 
> 1. **Write Position:** Start at end of result space
> 2. **Direction:** Move backward (decrement write position)
> 3. **Compare:** Pick larger/appropriate element first
> 4. **Advantage:** Avoids overwriting unprocessed elements

### Template 7: Three Pointers (Triplets)

```python
def three_pointers(arr, target):
    """
    Use for: 3Sum, 3Sum Closest
    Fix one element, use two pointers for the rest
    """
    arr.sort()  # usually need sorted array
    result = []

    for i in range(len(arr) - 2):
        # Skip duplicates for first element
        if i > 0 and arr[i] == arr[i-1]:
            continue

        left = i + 1
        right = len(arr) - 1

        while left < right:
            total = arr[i] + arr[left] + arr[right]

            if total == target:
                result.append([arr[i], arr[left], arr[right]])

                # Skip duplicates
                while left < right and arr[left] == arr[left + 1]:
                    left += 1
                while left < right and arr[right] == arr[right - 1]:
                    right -= 1

                left += 1
                right -= 1
            elif total < target:
                left += 1
            else:
                right -= 1

    return result
```

### Template 8: Linked List Intersection

```python
def get_intersection_node(headA, headB):
    """
    Find the node where two linked lists intersect.
    Use for: Intersection of Two Linked Lists (LC #160)
    
    Trick: When pointer reaches end, redirect to other list's head.
    Both pointers travel same total distance: lenA + lenB
    """
    if not headA or not headB:
        return None
    
    ptrA = headA
    ptrB = headB
    
    # They will meet at intersection or both become None
    while ptrA != ptrB:
        # Move to next, or switch to other list's head
        ptrA = ptrA.next if ptrA else headB
        ptrB = ptrB.next if ptrB else headA
    
    return ptrA  # Either intersection node or None
```

**Visualization:**

```python
List A:      a1 → a2 ↘
                      c1 → c2 → c3
List B: b1 → b2 → b3 ↗

ptrA path: a1 → a2 → c1 → c2 → c3 → (switch) → b1 → b2 → b3 → c1 ✓
ptrB path: b1 → b2 → b3 → c1 → c2 → c3 → (switch) → a1 → a2 → c1 ✓

Both travel: lenA + lenB = lenB + lenA
They meet at c1!
```

> 🔑 Key Insight
> 
> 
> By switching lists when reaching the end, both pointers travel the same total distance and will meet at the intersection point (or both become None if no intersection).
> 

# 4. Problems & Solutions

### 4.1 Opposite Direction Problems

- 🟢 **Two Sum II — Sorted Array**
    
    `LeetCode #167`
    
    **Problem:** Given a sorted array, find two numbers that add up to target.
    
    > 💡 Intuition
    > 
    > 
    > Since sorted: sum too small → need bigger number (move left). Sum too big → need smaller number (move right).
    > 
    
    **Visualization:**
    
    ```jsx
    Target = 9
    
    [2, 3, 4, 5, 6, 7]
     ↑              ↑
     L              R
    
    2 + 7 = 9 ✓ Found!
    
    ```
    
    **Solution:**
    
    ```python
    def two_sum(numbers: list[int], target: int) -> list[int]:
        left, right = 0, len(numbers) - 1
    
        while left < right:
            current_sum = numbers[left] + numbers[right]
    
            if current_sum == target:
                return [left + 1, right + 1]  # 1-indexed
            elif current_sum < target:
                left += 1
            else:
                right -= 1
    
        return []
    
    ```
    
    **Dry Run:**
    
    ```jsx
    numbers = [2, 7, 11, 15], target = 9
    
    Step 1: L=0, R=3 → 2 + 15 = 17 > 9 → R--
    Step 2: L=0, R=2 → 2 + 11 = 13 > 9 → R--
    Step 3: L=0, R=1 → 2 + 7  = 9  ✓ → return [1, 2]
    ```
    
- 🟢 **Valid Palindrome**
    
    `LeetCode #125`
    
    **Problem:** Check if string is palindrome (alphanumeric only).
    
    > 💡 Intuition
    > 
    > 
    > Palindrome reads same forward and backward. Compare from opposite ends, moving inward.
    > 
    
    **Solution:**
    
    ```python
    def is_palindrome(s: str) -> bool:
        left, right = 0, len(s) - 1
    
        while left < right:
            # Skip non-alphanumeric
            while left < right and not s[left].isalnum():
                left += 1
            while left < right and not s[right].isalnum():
                right -= 1
    
            # Compare (case-insensitive)
            if s[left].lower() != s[right].lower():
                return False
    
            left += 1
            right -= 1
    
        return True
    ```
    
    **Dry Run:**
    
    ```jsx
    s = "racecar"
    
    Step 1: L=0, R=6 → 'r' == 'r' ✓
    Step 2: L=1, R=5 → 'a' == 'a' ✓
    Step 3: L=2, R=4 → 'c' == 'c' ✓
    Step 4: L=3, R=3 → L >= R → STOP
    
    Return True ✓
    ```
    
- 🟡 **Container With Most Water**
    
    `LeetCode #11`
    
    **Problem:** Find two lines that form container holding most water.
    
    > 💡 Intuition
    > 
    > 
    > Area = width × min(heights). Start with max width, then find taller lines by moving the shorter one.
    > 
    
    **Visualization:**
    
    ```jsx
    Height: [1, 8, 6, 2, 5, 4, 8, 3, 7]
             ↑                       ↑
             L                       R
    
    Area = min(1, 7) × 8 = 8
    Move L (shorter) to potentially find larger area
    ```
    
    **Solution:**
    
    ```python
    def max_area(height: list[int]) -> int:
        left, right = 0, len(height) - 1
        max_water = 0
    
        while left < right:
            width = right - left
            h = min(height[left], height[right])
            max_water = max(max_water, width * h)
    
            # Move the shorter line
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1
    
        return max_water
    ```
    
    > ❓ Why move the shorter line?
    > 
    > 
    > Moving the taller line can only decrease or maintain area (width shrinks, height still limited by shorter). Moving shorter has a chance of finding taller.
    > 
- 🟡 **3Sum**
    
    `LeetCode #15`
    
    **Problem:** Find all unique triplets that sum to zero.
    
    > 💡 Intuition
    > 
    > 
    > Sort array. Fix one number, use two pointers to find pairs summing to its negative.
    > 
    
    **Solution:**
    
    ```python
    def three_sum(nums: list[int]) -> list[list[int]]:
        nums.sort()
        result = []
    
        for i in range(len(nums) - 2):
            # Skip duplicates
            if i > 0 and nums[i] == nums[i-1]:
                continue
    
            # Early exit: smallest positive means no solution
            if nums[i] > 0:
                break
    
            target = -nums[i]
            left, right = i + 1, len(nums) - 1
    
            while left < right:
                total = nums[left] + nums[right]
    
                if total == target:
                    result.append([nums[i], nums[left], nums[right]])
    
                    # Skip duplicates
                    while left < right and nums[left] == nums[left + 1]:
                        left += 1
                    while left < right and nums[right] == nums[right - 1]:
                        right -= 1
    
                    left += 1
                    right -= 1
                elif total < target:
                    left += 1
                else:
                    right -= 1
    
        return result
    ```
    
- 🔴 **Trapping Rain Water**
    
    `LeetCode #42`
    
    **Problem:** Calculate how much rain water can be trapped.
    
    > 💡 Intuition
    > 
    > 
    > Water at position = min(max_left, max_right) - height. Track max heights from both sides with two pointers.
    > 
    
    **Visualization:**
    
    ```jsx
             │
         │   │ │   │
     │   │ │ │ │ │ │ │
    ─┴───┴─┴─┴─┴─┴─┴─┴─
    
    Height: [0,1,0,2,1,0,1,3,2,1,2,1]
    Water:   0 0 1 0 1 2 1 0 0 1 0 0  = 6 units
    
    ```
    
    **Solution:**
    
    ```python
    def trap(height: list[int]) -> int:
        if not height:
            return 0
    
        left, right = 0, len(height) - 1
        left_max, right_max = height[left], height[right]
        water = 0
    
        while left < right:
            if left_max < right_max:
                left += 1
                left_max = max(left_max, height[left])
                water += left_max - height[left]
            else:
                right -= 1
                right_max = max(right_max, height[right])
                water += right_max - height[right]
    
        return water
    
    ```
    
    > 🎯 Key Insight
    > 
    > 
    > Process the side with smaller max because we KNOW water level there is limited by that side (other side is at least as tall).
    > 

### 4.2 Same Direction Problems

- 🟢 **Remove Duplicates from Sorted Array**
    
    `LeetCode #26`
    
    **Problem:** Remove duplicates in-place, return new length.
    
    > 💡 Intuition
    > 
    > 
    > Slow marks where next unique goes. Fast finds unique elements.
    > 
    
    **Visualization:**
    
    ```jsx
    Before: [  1,  1,  2,  2,  2,  3 ]
               ↑   ↑
             slow fast
    
    After:  [1, 2, 3, _, _, _] → return 3
    ```
    
    **Solution:**
    
    ```python
    def remove_duplicates(nums: list[int]) -> int:
        if not nums:
            return 0
    
        slow = 0
    
        for fast in range(1, len(nums)):
            if nums[fast] != nums[slow]:
                slow += 1
                nums[slow] = nums[fast]
    
        return slow + 1
    ```
    
    **Dry Run:**
    
    ```jsx
    nums = [1, 1, 2, 2, 3]
    
    fast=1: nums[1]=1 == nums[0]=1 → skip
    fast=2: nums[2]=2 != nums[0]=1 → slow=1, nums[1]=2
    fast=3: nums[3]=2 == nums[1]=2 → skip
    fast=4: nums[4]=3 != nums[1]=2 → slow=2, nums[2]=3
    
    Result: [1, 2, 3, _, _] → return 3
    ```
    
- 🟢 **Move Zeroes**
    
    `LeetCode #283`
    
    **Problem:** Move all zeroes to end, maintain order of non-zeros.
    
    > 💡 Intuition
    > 
    > 
    > Slow = position for next non-zero. Fast finds non-zeros. Swap when found.
    > 
    
    **Solution:**
    
    ```python
    def move_zeroes(nums: list[int]) -> None:
        slow = 0
    
        for fast in range(len(nums)):
            if nums[fast] != 0:
                nums[slow], nums[fast] = nums[fast], nums[slow]
                slow += 1
    ```
    
    ---
    
- 🟢 **Middle of Linked List**
    
    `LeetCode #876`
    
    **Problem:** Find the middle node of a linked list.
    
    > 💡 Intuition
    > 
    > 
    > When fast reaches end, slow is at middle (fast moves 2× speed).
    > 
    
    **Solution:**
    
    ```python
    def middle_node(head):
        slow = fast = head
    
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
    
        return slow
    ```
    
- 🟢 **Linked List Cycle Detection**
    
    `LeetCode #141`
    
    **Problem:** Detect if linked list has a cycle.
    
    > 💡 Intuition
    > 
    > 
    > Floyd's Tortoise and Hare — slow moves 1 step, fast moves 2 steps. If cycle exists, they'll meet.
    > 
    
    **Visualization:**
    
    ```jsx
         ┌─────────────┐
         ↓             │
    1 → 2 → 3 → 4 → 5 ─┘
    
    Slow: 1 → 2 → 3 → 4 → 5 → 3 → 4...
    Fast: 1 → 3 → 5 → 4 → 3 → 5 → 4...
    
    They meet at 4!
    ```
    
    **Solution:**
    
    ```python
    def has_cycle(head) -> bool:
        if not head or not head.next:
            return False
    
        slow = fast = head
    
        while fast and fast.next:
            slow = slow.next        # 1 step
            fast = fast.next.next   # 2 steps
    
            if slow == fast:
                return True
    
        return False
    ```
    
- **🟡 Linked List Cycle II — Find Cycle Start**
    
    **Problem:** Find the node where cycle begins.
    
    > 💡 Intuition
    > 
    > 
    > After detecting cycle (slow meets fast), reset one pointer to head. Move both at same speed — they meet at cycle start.
    > 
    
    **Mathematical Proof:**
    
    ```jsx
    Distance to cycle start = a
    Cycle length = c
    Meeting point from cycle start = b
    
    When they meet:
    - Slow traveled: a + b
    - Fast traveled: a + b + nc (where n is complete cycles)
    
    Since fast = 2 × slow:
    2(a + b) = a + b + nc
    a + b = nc
    a = nc - b = (n-1)c + (c - b)
    
    So: distance from head to start = distance from meeting point to start
    ```
    
    **Solution:**
    
    python
    
    ```python
    def detect_cycle(head):
        if not head or not head.next:
            return None
        
        # Phase 1: Detect cycle
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast:
                break
        else:
            return None  # No cycle
        
        # Phase 2: Find cycle start
        slow = head
        while slow != fast:
            slow = slow.next
            fast = fast.next
        
        return slow  # Cycle start
    ```
    

### 4.3 Two Arrays Problems

- **🟢 Merge Sorted Array**
    
    `LeetCode #88`
    
    **Problem:** Merge nums2 into nums1 (both sorted). nums1 has extra space.
    
    > 💡 Intuition
    > 
    > 
    > Start from END to avoid overwriting. Compare and place larger element.
    > 
    
    **Visualization:**
    
    ```jsx
    nums1 = [1, 2, 3, 0, 0, 0]  m = 3
    nums2 = [2, 5, 6]           n = 3
    
             ↑        ↑      ↑
             p1       p2   write
    
    Start from end, place larger values first
    ```
    
    **Solution:**
    
    ```python
    def merge(nums1: list[int], m: int, nums2: list[int], n: int) -> None:
        p1 = m - 1
        p2 = n - 1
        write = m + n - 1
    
        while p2 >= 0:
            if p1 >= 0 and nums1[p1] > nums2[p2]:
                nums1[write] = nums1[p1]
                p1 -= 1
            else:
                nums1[write] = nums2[p2]
                p2 -= 1
            write -= 1
    ```
    
    **Dry Run:**
    
    ```jsx
    nums1 = [1,2,3,0,0,0], nums2 = [2,5,6]
    
    w=5: 3 < 6 → nums1[5]=6, p2=1
    w=4: 3 < 5 → nums1[4]=5, p2=0
    w=3: 3 > 2 → nums1[3]=3, p1=1
    w=2: 2 = 2 → nums1[2]=2, p2=-1
    
    Result: [1,2,2,3,5,6] ✓
    ```
    
- 🟢 **Squares of a Sorted Array**
    
    `LeetCode #977`
    
    **Problem:** Given sorted array (may have negatives), return squares in sorted order.
    
    > 💡 Intuition
    > 
    > 
    > Largest squares at ends (due to negatives). Use opposite pointers, build result from end.
    > 
    
    **Solution:**
    
    ```python
    def sorted_squares(nums: list[int]) -> list[int]:
        n = len(nums)
        result = [0] * n
        left, right = 0, n - 1
        write = n - 1
    
        while left <= right:
            left_sq = nums[left] ** 2
            right_sq = nums[right] ** 2
    
            if left_sq > right_sq:
                result[write] = left_sq
                left += 1
            else:
                result[write] = right_sq
                right -= 1
            write -= 1
    
        return result
    ```
    
- 🟡 **Intersection of Two Linked Lists**
    
    `LeetCode #160`
    
    **Problem:** Find the node where two singly linked lists intersect.
    
    > 💡 Intuition
    > 
    > 
    > When pointer reaches end, redirect to other list's head. Both travel same total distance and meet at intersection.
    > 
    
    **Visualization:**
    
    ```jsx
    A:     4 → 1 ↘
                  8 → 4 → 5
    B: 5 → 6 → 1 ↗
    
    ptrA: 4→1→8→4→5→NULL→5→6→1→8 ✓
    ptrB: 5→6→1→8→4→5→NULL→4→1→8 ✓
    
    Both travel: lenA + lenB
    ```
    
    **Solution:**
    
    ```python
    def get_intersection_node(headA, headB):
        if not headA or not headB:
            return None
        
        ptrA, ptrB = headA, headB
        
        while ptrA != ptrB:
            ptrA = ptrA.next if ptrA else headB
            ptrB = ptrB.next if ptrB else headA
        
        return ptrA
    ```
    
    > 🎯 Why This Works
    > 
    > - If lists intersect: both pointers travel `lenA + lenB` and meet at intersection
    > - If no intersection: both become `None` simultaneously after traveling `lenA + lenB`
    
    ---
    
    ### 
    

### 4.4 Expand from Center Problems

- 🟡 **Longest Palindromic Substring**
    
    `LeetCode #5`
    
    **Problem:** Find the longest palindromic substring.
    
    > 💡 Intuition
    > 
    > 
    > Try each position as center. Expand outward while characters match. Handle both odd and even length palindromes.
    > 
    
    **Visualization:**
    
    ```jsx
    s = "babad"
    
    Center at 'a' (index 1):
        b a b a d
          ↑
        ← a →     → "a" (length 1)
      ← b a b →   → "bab" (length 3) ✓
    
    Center at 'b' (index 2):
        b a b a d
            ↑
          ← b →   → "b" (length 1)
        a b a     → not palindrome (a≠a is false... wait)
        
    Actually checking "aba" centered at index 2...
    ```
    
    **Solution:**
    
    ```python
    def longest_palindrome(s: str) -> str:
        if not s:
            return ""
        
        def expand(left: int, right: int) -> tuple[int, int]:
            while left >= 0 and right < len(s) and s[left] == s[right]:
                left -= 1
                right += 1
            return left + 1, right - 1
        
        start, end = 0, 0
        
        for i in range(len(s)):
            # Odd length
            l1, r1 = expand(i, i)
            if r1 - l1 > end - start:
                start, end = l1, r1
            
            # Even length
            l2, r2 = expand(i, i + 1)
            if r2 - l2 > end - start:
                start, end = l2, r2
        
        return s[start:end + 1]
    ```
    
    **Dry Run:**
    
    ```python
    s = "babad"
    
    i=0: odd(0,0)="b", even(0,1)="ba"✗ → best="b"
    i=1: odd(1,1)→expand→"bab", even(1,2)="ab"✗ → best="bab"
    i=2: odd(2,2)→expand→"aba", even(2,3)="ba"✗ → best="bab" (same length)
    i=3: odd(3,3)="a", even(3,4)="ad"✗ → best="bab"
    i=4: odd(4,4)="d", even(4,5)=invalid → best="bab"
    
    Return "bab"
    ```
    
- 🟡 **Palindromic Substrings (Count)**
    
    `LeetCode #647`
    
    **Problem:** Count how many palindromic substrings exist.
    
    > 💡 Intuition
    > 
    > 
    > Same as above, but count instead of tracking longest.
    > 
    
    **Solution:**
    
    ```python
    def count_substrings(s: str) -> int:
        def expand(left: int, right: int) -> int:
            count = 0
            while left >= 0 and right < len(s) and s[left] == s[right]:
                count += 1
                left -= 1
                right += 1
            return count
        
        total = 0
        for i in range(len(s)):
            total += expand(i, i)      # Odd length
            total += expand(i, i + 1)  # Even length
        
        return total
    ```
    

### 4.5 Three-Way Partitioning Problems

- 🟡 S**ort Colors (Dutch National Flag)**
    
    `LeetCode #75`
    
    **Problem:** Sort array containing only 0, 1, 2 in-place.
    
    > 💡 Intuition
    > 
    > 
    > Three pointers: `low` for 0s boundary, `high` for 2s boundary, `mid` scans through.
    > 
    
    **Visualization:**
    
    ```jsx
    Initial: [2, 0, 2, 1, 1, 0]
              ↑              ↑
             low            high
             mid
    
    Step by step:
    [2,0,2,1,1,0] mid=0, nums[mid]=2 → swap with high
    [0,0,2,1,1,2] mid=0, nums[mid]=0 → swap with low, move both
    [0,0,2,1,1,2] mid=1, nums[mid]=0 → swap with low, move both
    [0,0,2,1,1,2] mid=2, nums[mid]=2 → swap with high
    [0,0,1,1,2,2] mid=2, nums[mid]=1 → just move mid
    [0,0,1,1,2,2] mid=3, nums[mid]=1 → just move mid
    [0,0,1,1,2,2] mid=4 > high=3 → STOP
    ```
    
    **Solution:**
    
    ```python
    def sort_colors(nums: list[int]) -> None:
        low = 0
        mid = 0
        high = len(nums) - 1
        
        while mid <= high:
            if nums[mid] == 0:
                nums[low], nums[mid] = nums[mid], nums[low]
                low += 1
                mid += 1
            elif nums[mid] == 2:
                nums[mid], nums[high] = nums[high], nums[mid]
                high -= 1
                # Don't increment mid!
            else:  # nums[mid] == 1
                mid += 1
    ```
    
    > ⚠️ Critical: Don't increment mid after swapping with high!
    > 
    > 
    > The element swapped from `high` hasn't been examined yet. We need to check it before moving on.
    > 
- 🟡 **Move Zeroes (Three-Way Variant)**
    
    Alternative approach using partitioning:
    
    ```python
    def move_zeroes(nums: list[int]) -> None:
        """
        Partition into [non-zeros] [zeros]
        """
        boundary = 0  # boundary for non-zeros
        
        for i in range(len(nums)):
            if nums[i] != 0:
                nums[boundary], nums[i] = nums[i], nums[boundary]
                boundary += 1
    ```
    

### 4.6 Backward Fill Problems

- 🟢 **Merge Sorted Array (Backward Fill)**
    
    `LeetCode #88` — Already covered above
    
- **🟢 Squares of Sorted Array (Backward Fill)**
    
    `LeetCode #977` — Already covered above
    
- 🟡 Interval List Intersections
    
    `LeetCode #986`
    
    **Problem:** Find intersection of two lists of intervals.
    
    > 💡 Intuition
    > 
    > 
    > Two pointers on two lists. Find overlap, move pointer whose interval ends first.
    > 
    
    **Solution:**
    
    ```python
    def interval_intersection(
        firstList: list[list[int]], 
        secondList: list[list[int]]
    ) -> list[list[int]]:
        i, j = 0, 0
        result = []
        
        while i < len(firstList) and j < len(secondList):
            # Find intersection
            start = max(firstList[i][0], secondList[j][0])
            end = min(firstList[i][1], secondList[j][1])
            
            if start <= end:
                result.append([start, end])
            
            # Move pointer whose interval ends first
            if firstList[i][1] < secondList[j][1]:
                i += 1
            else:
                j += 1
        
        return result
    ```
    

# 5. Edge Cases Checklist

### Universal Edge Cases

| Edge Case | Example | How to Handle |
| --- | --- | --- |
| Empty array | [] | Return early: if empty |
| Single element | [5] | Usually valid, pointers may not move |
| Two elements | [1, 2] | Minimum case for most problems |
| All same | [3, 3, 3, 3] | Handle duplicates properly |
| No valid answer | Two Sum with no pair | Return failure value |
| Negative numbers | [-3, -1, 0, 2] | Important for squares, products |
| All negatives | [-5, -3, -1] | Squares: largest at left end |
| All positives | [1, 3, 5] | Squares: largest at right end |

### Variation-Specific

**Opposite Direction:**

```python
# Single char is palindrome
assert is_palindrome("a") == True

# Empty string is palindrome
assert is_palindrome("") == True

# Two same chars
assert is_palindrome("aa") == True
```

**Same Direction:**

```python
# All elements need removal
nums = [2, 2, 2]
remove_element(nums, 2)  # Returns 0

# No elements need removal
nums = [1, 2, 3]
remove_element(nums, 4)  # Returns 3

# Already no duplicates
nums = [1, 2, 3]
remove_duplicates(nums)  # Returns 3
```

**Two Arrays:**

```python
# One array empty
merge([1,2,3,0,0,0], 3, [], 0)  # No change

# First array empty
merge([0,0,0], 0, [1,2,3], 3)   # Becomes [1,2,3]

# No intersection
intersection([1,2], [3,4])  # Returns []
```

**Expand from Center:**

```python
# Single character
longest_palindrome("a")  # Returns "a"

# All same characters
longest_palindrome("aaaa")  # Returns "aaaa"

# No palindrome longer than 1
longest_palindrome("abc")  # Returns "a" (or "b" or "c")
```

**Three-Way Partitioning:**

```python
# Already sorted
sort_colors([0, 0, 1, 1, 2, 2])  # No change needed

# Reverse sorted
sort_colors([2, 2, 1, 1, 0, 0])  # Full reversal needed

# All same
sort_colors([1, 1, 1])  # No swaps needed
```

**Linked List:**

```python
# Empty list
has_cycle(None)  # Returns False

# Single node, no cycle
has_cycle(node)  # Returns False

# Single node pointing to itself
node.next = node
has_cycle(node)  # Returns True

# No intersection
get_intersection_node(listA, listB)  # Returns None
```

### Pre-Check Template

```python
def solution(arr, ...):
    # Edge cases FIRST
    if not arr:
        return ...  # empty result
    
    if len(arr) == 1:
        return ...  # single element result
    
    # Main logic
    left, right = 0, len(arr) - 1
    ...
```

# 6. Tips & Tricks

### Recognition Signals

| Signal | Pattern | Example |
| --- | --- | --- |
| "sorted array" | Opposite pointers | Two Sum II |
| "find pair/triplet" | Fix + two pointers | 3Sum |
| "in-place modification" | Slow-fast | Remove duplicates |
| "reverse" | Opposite pointers | Reverse string |
| "palindrome check" | Opposite pointers | Valid palindrome |
| "longest palindrome" | Expand from center | Longest palindromic substring |
| "cycle detection" | Slow-fast | Linked list cycle |
| "find middle" | Slow-fast | Middle of linked list |
| "merge sorted" | Two arrays | Merge sorted arrays |
| "intersection" | Two arrays/lists | Linked list intersection |
| "partition / sort colors" | Three-way | Dutch National Flag |
| "fill without overwrite" | Backward fill | Merge in-place |

### Variation Selection Guide

```python
┌─────────────────────────────────────────────────────────────────┐
│                    TWO POINTERS DECISION TREE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Is it about PALINDROMES?                                       │
│  ├─ Check if palindrome → Opposite Direction                    │
│  └─ Find longest palindrome → Expand from Center                │
│                                                                 │
│  Is array SORTED?                                               │
│  ├─ Find pair with sum → Opposite Direction                     │
│  ├─ Merge two arrays → Two Arrays (+ Backward Fill)             │
│  └─ Remove duplicates → Slow-Fast                               │
│                                                                 │
│  Is it about LINKED LISTS?                                      │
│  ├─ Detect cycle → Slow-Fast (Floyd's)                          │
│  ├─ Find cycle start → Slow-Fast (two phases)                   │
│  ├─ Find middle → Slow-Fast                                     │
│  └─ Find intersection → Two Lists (switch trick)                │
│                                                                 │
│  Is it about PARTITIONING?                                      │
│  ├─ Two sections → Slow-Fast                                    │
│  └─ Three sections → Three-Way Partitioning                     │
│                                                                 │
│  Need to avoid OVERWRITING?                                     │
│  └─ Backward Fill                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Common Mistakes

**Mistake 1: Off-by-one in loop**

```python
# ❌ Wrong: might skip adjacent comparison
while left < right - 1:

# ✅ Correct: check until pointers meet
while left < right:
```

**Mistake 2: Not handling duplicates**

```python
# ❌ Wrong: may include duplicate triplets
if current_sum == target:
    result.append([...])
    left += 1
    right -= 1

# ✅ Correct: skip duplicates after match
if current_sum == target:
    result.append([...])
    while left < right and nums[left] == nums[left+1]:
        left += 1
    while left < right and nums[right] == nums[right-1]:
        right -= 1
    left += 1
    right -= 1
```

**Mistake 3: Forgetting to sort**

```python
# ❌ Wrong
def three_sum(nums):
    for i in range(len(nums)):
        ...

# ✅ Correct
def three_sum(nums):
    nums.sort()  # Essential!
    ...
```

**Mistake 4: Fast pointer never moves**

```python
# ❌ Wrong: infinite loop
while fast < len(arr):
    if condition:
        slow += 1
    # fast never moves!

# ✅ Correct
while fast < len(arr):
    if condition:
        slow += 1
    fast += 1  # Always move fast
```

**Mistake 5: Incrementing mid after high swap (Three-Way)**

```python
# ❌ Wrong: skips checking the swapped element
if nums[mid] == 2:
    nums[mid], nums[high] = nums[high], nums[mid]
    high -= 1
    mid += 1  # BUG!

# ✅ Correct: check the swapped element
if nums[mid] == 2:
    nums[mid], nums[high] = nums[high], nums[mid]
    high -= 1
    # Don't increment mid
```

**Mistake 6: Wrong loop condition for expand from center**

```python
# ❌ Wrong: doesn't check bounds properly
while s[left] == s[right]:
    left -= 1
    right += 1

# ✅ Correct: check bounds first
while left >= 0 and right < len(s) and s[left] == s[right]:
    left -= 1
    right += 1
```

**Mistake 7: Forgetting even-length palindromes**

```python
# ❌ Wrong: only checks odd-length
for i in range(len(s)):
    expand(i, i)

# ✅ Correct: check both odd and even
for i in range(len(s)):
    expand(i, i)      # odd
    expand(i, i + 1)  # even
```