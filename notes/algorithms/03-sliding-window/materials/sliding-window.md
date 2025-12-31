# Sliding Window

# 1. Introduction

## What is the Sliding Window Technique?

The **Sliding Window** technique is an algorithmic pattern that converts nested loops (typically O(n²)) into a single pass (O(n)) by maintaining a "window" that slides across the data structure. Instead of recalculating everything from scratch for each position, we incrementally update our computation by removing elements that leave the window and adding elements that enter it.

Think of it like looking through a window on a moving train—you don't re-examine the entire landscape each moment; you simply note what's newly visible and what's now behind you.

> 💡 Core Idea
>
> The fundamental insight is **reusing previous computation**. When the window slides by one position:
> - **Lost**: One element exits from the left
> - **Gained**: One element enters from the right
> - **Retained**: All elements in between remain
>
> New result = Previous result - contribution(leaving) + contribution(entering)

**Simple Example:**

```
Previous window:    [a, b, c]
After sliding:         [b, c, d]
                        ↑↑↑
                      Overlap!
```

## When to Use It

**Problem Indicators**

Look for these keywords in problem statements:

| Keyword | Typical Problem |
| --- | --- |
| `contiguous subarray` | Sum/product problems |
| `contiguous substring` | String matching |
| `longest / maximum length` | Variable window (MAX) |
| `shortest / minimum length` | Variable window (MIN) |
| `sum equals/greater/less than K` | Sum constraint problems |
| `at most K distinct` | Frequency counting |
| `containing all characters` | Minimum window substring |
| `without repeating` | Unique elements |
| `maximum of all subarrays of size K` | Sliding window maximum |
| `anagram / permutation` | Fixed window matching |

**Use It When**

- Working with **arrays or strings**
- Need to examine **contiguous subarrays/substrings**
- Looking for **optimal contiguous sequence**
- Constraint involves elements **within a range**
- Can **reuse computation** from previous window

## Complexity Benefits

| Approach | Time | Space | Verdict |
| --- | --- | --- | --- |
| Brute Force | O(n × k) or O(n²) | O(1) | ❌ Slow |
| Sliding Window | O(n) | O(1) or O(k) | ✅ Optimal |

> 🎯 Key Insight
>
> Each element is added to the window at most once and removed at most once — giving us **O(n) time complexity**!

# 2. Pattern Variations

## Six Core Variations of the Sliding Window Technique

| # | Variation | Window Size | Key Use Case |
| --- | --- | --- | --- |
| 1 | Fixed-Size Window | Constant k | Sum/max of k elements, anagrams |
| 2 | Variable Window (Maximum) | Dynamic | Longest valid substring |
| 3 | Variable Window (Minimum) | Dynamic | Shortest valid substring |
| 4 | Window + HashMap | Varies | Frequency counting, K distinct |
| 5 | Window + HashSet | Varies | Unique elements tracking |
| 6 | Window + Monotonic Deque | Fixed k | Min/max in each window |

### Variation 1: Fixed-Size Window

**Pointers move in lockstep, maintaining constant window size**

```
Array: [a, b, c, d, e, f], k=3

Step 0: [a, b, c] d  e  f    ← Initial window
Step 1:  a [b, c, d] e  f    ← Slide: -a, +d
Step 2:  a  b [c, d, e] f    ← Slide: -b, +e
Step 3:  a  b  c [d, e, f]   ← Slide: -c, +f
```

**Use Cases:**

- Maximum/minimum sum of k consecutive elements
- Average of subarrays of size k
- Finding anagrams (fixed pattern length)
- Maximum in each window (sliding window maximum)

**Movement Rules:**

- Build initial window of size k
- For each new element: remove leftmost, add new element
- Both boundaries move together

### Variation 2: Variable-Size Window (Maximum)

**Find the longest/largest window that satisfies a condition**

```
Strategy: Expand aggressively, contract reluctantly

Mindset: "Grow as much as possible, shrink only when forced"
```

```
String: "abcabcbb"

a b c a b c b b
L R               → "a" valid, size=1
L   R             → "ab" valid, size=2
L     R           → "abc" valid, size=3, max=3
L       R         → "abca" invalid! 'a' repeats
  L     R         → "bca" valid, size=3
```

**Use Cases:**

- Longest substring without repeating characters
- Longest substring with at most K distinct characters
- Maximum consecutive ones with K flips

### Variation 3: Variable-Size Window (Minimum)

**Find the shortest/smallest window that satisfies a condition**

```
Strategy: Expand to become valid, then shrink while staying valid

Mindset: "Find any valid window, then squeeze it as small as possible"
```

```
String: "ADOBECODEBANC", Target: "ABC"

A D O B E C O D E B  A  N  C
L           R                 → "ADOBEC" contains A,B,C - valid! size=6
  L         R                 → "DOBEC" missing A - invalid
                   L     R    → "BANC" contains A,B,C - valid! size=4, min=4
```

**Use Cases:**

- Minimum window substring
- Minimum size subarray with sum ≥ K
- Shortest subarray containing all elements

### Variation 4: Window + HashMap (Frequency Counting)

**Use When**: Need to track how many times each element appears in the window.

**Common Patterns:**

- "At most K distinct elements"
- "Substring with exactly K unique characters"
- Character frequency matching

```python
from collections import defaultdict

char_count = defaultdict(int)  # Maps element → frequency in window
distinct = 0                    # Number of distinct elements

# Adding to window
char_count[char] += 1
if char_count[char] == 1:
    distinct += 1

# Removing from window
char_count[char] -= 1
if char_count[char] == 0:
    distinct -= 1
```

### Variation 5: Window + HashSet (Uniqueness Tracking)

**Use When**: Need to ensure all elements in window are unique.

```python
seen = set()

# Check and add
if char in seen:
    # Invalid - need to shrink from left
else:
    seen.add(char)

# Remove from window
seen.remove(left_char)
```

### Variation 6: Window + Monotonic Deque (Min/Max)

**Use When**: Need to track minimum or maximum within the current window efficiently.

**Key Insight**: Maintain a deque where elements are always in sorted order (monotonically increasing or decreasing).

```python
from collections import deque

# For maximum in window - maintain monotonically decreasing deque
dq = deque()  # Stores indices

# Adding element at index i
while dq and nums[dq[-1]] < nums[i]:
    dq.pop()  # Remove smaller elements - they can never be maximum
dq.append(i)

# Window maximum is always nums[dq[0]]

# Removing elements outside window
while dq and dq[0] <= i - k:
    dq.popleft()
```

# 3. Code Templates

### Template 1: Fixed-Size Window

```python
def fixed_window(arr, k):
    """
    Template for fixed-size sliding window.
    Use for: Max sum of k elements, averages, anagram finding
    """
    n = len(arr)

    # Edge case: array smaller than window
    if n < k:
        return None

    # STEP 1: Initialize first window
    window_state = sum(arr[:k])  # Could be sum, product, count, etc.
    result = window_state

    # STEP 2: Slide the window
    for right in range(k, n):
        # Remove leftmost, add new element
        window_state += arr[right] - arr[right - k]

        # STEP 3: Update result
        result = max(result, window_state)

    return result
```

> 🔑 Key Decisions
>
> 1. **Init:** Build first window of size k
> 2. **Slide:** `window_state += arr[right] - arr[right - k]`
> 3. **Update:** After each slide
> 4. **Stop:** When right pointer reaches end

### Template 2: Variable Window (Maximum)

```python
def variable_window_maximum(arr):
    """
    Template for finding LONGEST/MAXIMUM valid window.
    Pattern: Expand eagerly, contract only when invalid.
    Use for: Longest substring without repeating, at most K distinct
    """
    left = 0
    max_length = 0
    state = set()  # Or defaultdict(int), or other tracking structure

    for right in range(len(arr)):
        # EXPAND: Add current element to window
        current = arr[right]

        # CONTRACT: Shrink window while INVALID
        while current in state:  # Example: duplicate found
            state.remove(arr[left])
            left += 1

        # Now window [left, right] is valid
        state.add(current)

        # UPDATE: Track maximum valid window
        max_length = max(max_length, right - left + 1)

    return max_length
```

> 🔑 Key Decisions
>
> 1. **Expand:** Always add right element
> 2. **Contract:** `while` loop when window becomes invalid
> 3. **Update:** After ensuring window is valid
> 4. **Result:** Initialized to 0 (at worst, no valid window)

### Template 3: Variable Window (Minimum)

```python
def variable_window_minimum(arr, target):
    """
    Template for finding SHORTEST/MINIMUM valid window.
    Pattern: Expand until valid, then shrink while staying valid.
    Use for: Minimum window substring, min subarray with sum >= K
    """
    left = 0
    min_length = float('inf')
    current_state = 0  # Example: running sum

    for right in range(len(arr)):
        # EXPAND: Add current element to window
        current_state += arr[right]

        # CONTRACT: Shrink window while STILL VALID
        while current_state >= target:
            # Update minimum BEFORE shrinking
            min_length = min(min_length, right - left + 1)

            # Remove left element and move pointer
            current_state -= arr[left]
            left += 1

    return min_length if min_length != float('inf') else 0
```

> 🔑 Key Decisions
>
> 1. **Expand:** Always add right element
> 2. **Contract:** `while` loop when window is valid (to minimize)
> 3. **Update:** Before shrinking (record valid window)
> 4. **Result:** Initialized to infinity, check at end

### Template 4: Window + HashMap

```python
from collections import defaultdict

def window_with_hashmap(arr, k):
    """
    Template for frequency-based constraints.
    Use for: At most K distinct, exactly K distinct
    """
    char_count = defaultdict(int)
    left = 0
    max_length = 0

    for right in range(len(arr)):
        char_count[arr[right]] += 1

        # Shrink while constraint violated
        while len(char_count) > k:
            char_count[arr[left]] -= 1
            if char_count[arr[left]] == 0:
                del char_count[arr[left]]
            left += 1

        max_length = max(max_length, right - left + 1)

    return max_length
```

> 🔑 Key Decisions
>
> 1. **Track:** Frequency of each element in window
> 2. **Cleanup:** Delete key when count reaches 0
> 3. **Constraint:** Usually `len(map) > k`

### Template 5: Window + Monotonic Deque

```python
from collections import deque

def sliding_window_maximum(nums, k):
    """
    Template: Monotonic Deque for window maximum.
    Deque stores indices in decreasing order of their values.
    """
    dq = deque()  # Front has index of maximum
    result = []

    for i, num in enumerate(nums):
        # 1. Remove indices outside window (from front)
        while dq and dq[0] <= i - k:
            dq.popleft()

        # 2. Maintain decreasing order (from back)
        while dq and nums[dq[-1]] < num:
            dq.pop()

        # 3. Add current index
        dq.append(i)

        # 4. Record result for complete windows
        if i >= k - 1:
            result.append(nums[dq[0]])

    return result
```

> 🔑 Key Decisions
>
> 1. **Store indices**, not values
> 2. **Front removal:** Check if outside window
> 3. **Back removal:** Remove smaller elements (can never be max)
> 4. **Maximum:** Always at `nums[dq[0]]`

### Template Comparison Table

| Aspect | Fixed Window | Variable (Maximum) | Variable (Minimum) |
| --- | --- | --- | --- |
| Window size | Constant k | Changes dynamically | Changes dynamically |
| Expand when | Every step (with slide) | Always (each iteration) | Always (each iteration) |
| Contract when | Every step (with slide) | Window becomes invalid | Window is valid (to minimize) |
| Update result | After each slide | After ensuring valid | Before shrinking |
| Result initialized | First window value | 0 or -inf | inf |
| Left pointer moves | With right (same pace) | Only when shrinking | While still valid |

# 4. Problems & Solutions

### 4.1 Fixed-Size Window Problems

- 🟢 **Maximum Sum Subarray of Size K**

    **Problem:** Given an array of integers and a number k, find the maximum sum of any contiguous subarray of size k.

    > 💡 Intuition
    >
    > Instead of recalculating sum for each window (O(n×k)), slide the window: subtract leaving element, add entering element.

    **Visualization:**

    ```
    Array: [2, 1, 5, 1, 3, 2], k=3

    Step 0: [2, 1, 5] 1  3  2    sum=8, max=8
    Step 1:  2 [1, 5, 1] 3  2    sum=8-2+1=7, max=8
    Step 2:  2  1 [5, 1, 3] 2    sum=7-1+3=9, max=9 ✓
    Step 3:  2  1  5 [1, 3, 2]   sum=9-5+2=6, max=9

    Result: 9
    ```

    **Solution:**

    ```python
    def max_sum_subarray_size_k(arr, k):
        n = len(arr)
        if n < k:
            return 0

        # Initialize first window
        window_sum = sum(arr[:k])
        max_sum = window_sum

        # Slide the window
        for right in range(k, n):
            window_sum += arr[right] - arr[right - k]
            max_sum = max(max_sum, window_sum)

        return max_sum
    ```

- 🟢 **Maximum Average Subarray I**

    `LeetCode #643`

    **Problem:** Find the contiguous subarray of size k with maximum average.

    > 💡 Intuition
    >
    > Maximum average = maximum sum / k. Track max sum, divide only at the end.

    **Solution:**

    ```python
    def find_max_average(nums, k):
        window_sum = sum(nums[:k])
        max_sum = window_sum

        for right in range(k, len(nums)):
            window_sum += nums[right] - nums[right - k]
            max_sum = max(max_sum, window_sum)

        return max_sum / k
    ```

- 🟡 **Find All Anagrams in a String**

    `LeetCode #438`

    **Problem:** Given strings s and p, find all start indices of p's anagrams in s.

    > 💡 Intuition
    >
    > Fixed window of size len(p). Track character frequencies. Window is anagram when all frequencies match.

    **Visualization:**

    ```
    s = "cbaebabacd", p = "abc"
    p_count = {'a':1, 'b':1, 'c':1}

    Window "cba" at 0: matches! ✓
    Window "bae" at 1: no match
    ...
    Window "bac" at 6: matches! ✓

    Result: [0, 6]
    ```

    **Solution:**

    ```python
    from collections import Counter

    def find_anagrams(s, p):
        result = []
        p_len, s_len = len(p), len(s)

        if p_len > s_len:
            return result

        p_count = Counter(p)
        window_count = Counter()
        matches = 0
        required = len(p_count)

        for right in range(s_len):
            # Add character to window
            char = s[right]
            window_count[char] += 1

            if window_count[char] == p_count[char]:
                matches += 1
            elif window_count[char] == p_count[char] + 1:
                matches -= 1

            # Remove leftmost if window exceeds size
            if right >= p_len:
                left_char = s[right - p_len]
                if window_count[left_char] == p_count[left_char]:
                    matches -= 1
                elif window_count[left_char] == p_count[left_char] + 1:
                    matches += 1
                window_count[left_char] -= 1

            if matches == required:
                result.append(right - p_len + 1)

        return result
    ```

- 🔴 **Sliding Window Maximum**

    `LeetCode #239`

    **Problem:** Given an array and window size k, return the maximum element in each window.

    > 💡 Intuition
    >
    > Naive O(n×k) is too slow. Use monotonic deque: maintain candidates in decreasing order. Front always has maximum.

    **Visualization:**

    ```
    nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3

    i=0: dq=[0]
    i=1: 1<3, pop 0, dq=[1]
    i=2: 3>-1, dq=[1,2], result=[3]
    i=3: dq=[1,2,3], 1<=0? no, but 1<=3-3=0, pop 1, dq=[2,3], result=[3,3]
    i=4: -1<5, -3<5, pop all, dq=[4], result=[3,3,5]
    ...

    Result: [3, 3, 5, 5, 6, 7]
    ```

    **Solution:**

    ```python
    from collections import deque

    def max_sliding_window(nums, k):
        result = []
        dq = deque()  # Stores indices

        for i in range(len(nums)):
            # Remove indices outside window
            while dq and dq[0] <= i - k:
                dq.popleft()

            # Maintain decreasing order
            while dq and nums[dq[-1]] < nums[i]:
                dq.pop()

            dq.append(i)

            if i >= k - 1:
                result.append(nums[dq[0]])

        return result
    ```

### 4.2 Variable Window (Maximum) Problems

- 🟡 **Longest Substring Without Repeating Characters**

    `LeetCode #3`

    **Problem:** Find the length of the longest substring without repeating characters.

    > 💡 Intuition
    >
    > Expand right to include characters. When duplicate found, shrink from left until no duplicate. Track max length.

    **Visualization:**

    ```
    s = "abcabcbb"

    [a] b  c  a  b  c  b  b    set={'a'}, max=1
    [a  b] c  a  b  c  b  b    set={'a','b'}, max=2
    [a  b  c] a  b  c  b  b    set={'a','b','c'}, max=3
    [a  b  c  a]               'a' duplicate!
       [b  c  a] b  c  b  b    remove 'a', set={'b','c','a'}, max=3
    ...

    Result: 3
    ```

    **Solution:**

    ```python
    def length_of_longest_substring(s):
        char_set = set()
        left = 0
        max_length = 0

        for right in range(len(s)):
            while s[right] in char_set:
                char_set.remove(s[left])
                left += 1

            char_set.add(s[right])
            max_length = max(max_length, right - left + 1)

        return max_length
    ```

    **Optimized Version** (jump left pointer directly):

    ```python
    def length_of_longest_substring_optimized(s):
        char_index = {}  # char → last seen index
        left = 0
        max_length = 0

        for right, char in enumerate(s):
            if char in char_index and char_index[char] >= left:
                left = char_index[char] + 1

            char_index[char] = right
            max_length = max(max_length, right - left + 1)

        return max_length
    ```

- 🟡 **Longest Repeating Character Replacement**

    `LeetCode #424`

    **Problem:** Given string s and integer k, you can replace at most k characters. Find the length of the longest substring containing only one repeating character.

    > 💡 Intuition
    >
    > For valid window: (window size) - (most frequent char count) ≤ k. Expand while valid, shrink when invalid.

    **Solution:**

    ```python
    from collections import defaultdict

    def character_replacement(s, k):
        char_count = defaultdict(int)
        left = 0
        max_freq = 0
        max_length = 0

        for right in range(len(s)):
            char_count[s[right]] += 1
            max_freq = max(max_freq, char_count[s[right]])

            window_size = right - left + 1
            if window_size - max_freq > k:
                char_count[s[left]] -= 1
                left += 1

            max_length = max(max_length, right - left + 1)

        return max_length
    ```

    > ❓ Why not update max_freq when shrinking?
    >
    > We only care about windows larger than current best. Keeping max_freq high means we only consider potentially longer windows.

- 🟡 **Max Consecutive Ones III**

    `LeetCode #1004`

    **Problem:** Given binary array, you can flip at most k 0s to 1s. Find maximum consecutive 1s.

    > 💡 Intuition
    >
    > Reframe: find longest subarray with at most k zeros.

    **Solution:**

    ```python
    def longest_ones(nums, k):
        left = 0
        zeros = 0
        max_length = 0

        for right in range(len(nums)):
            if nums[right] == 0:
                zeros += 1

            while zeros > k:
                if nums[left] == 0:
                    zeros -= 1
                left += 1

            max_length = max(max_length, right - left + 1)

        return max_length
    ```

- 🟡 **Fruit Into Baskets**

    `LeetCode #904`

    **Problem:** Row of trees, each bearing one type of fruit. You have 2 baskets, each holds one type. Find maximum fruits you can collect in contiguous section.

    > 💡 Intuition
    >
    > Translation: longest subarray with at most 2 distinct elements.

    **Solution:**

    ```python
    from collections import defaultdict

    def total_fruit(fruits):
        fruit_count = defaultdict(int)
        left = 0
        max_fruits = 0

        for right in range(len(fruits)):
            fruit_count[fruits[right]] += 1

            while len(fruit_count) > 2:
                fruit_count[fruits[left]] -= 1
                if fruit_count[fruits[left]] == 0:
                    del fruit_count[fruits[left]]
                left += 1

            max_fruits = max(max_fruits, right - left + 1)

        return max_fruits
    ```

### 4.3 Variable Window (Minimum) Problems

- 🔴 **Minimum Window Substring**

    `LeetCode #76`

    **Problem:** Given strings s and t, find the minimum window in s that contains all characters of t.

    > 💡 Intuition
    >
    > Expand until window contains all of t. Then shrink while still valid, tracking minimum. Continue expanding when invalid.

    **Visualization:**

    ```
    s = "ADOBECODEBANC", t = "ABC"
    t_count = {'A':1, 'B':1, 'C':1}

    Expand until valid:
    "ADOBEC" (0-5) - contains A,B,C, size=6
    Shrink: "DOBEC" - missing A, invalid

    Continue expanding...
    "BANC" (9-12) - contains A,B,C, size=4 ← minimum!

    Result: "BANC"
    ```

    **Solution:**

    ```python
    from collections import Counter

    def min_window(s, t):
        if not t or not s:
            return ""

        t_count = Counter(t)
        required = len(t_count)

        window_count = Counter()
        formed = 0

        left = 0
        min_len = float('inf')
        min_start = 0

        for right in range(len(s)):
            char = s[right]
            window_count[char] += 1

            if char in t_count and window_count[char] == t_count[char]:
                formed += 1

            while formed == required:
                if right - left + 1 < min_len:
                    min_len = right - left + 1
                    min_start = left

                left_char = s[left]
                window_count[left_char] -= 1
                if left_char in t_count and window_count[left_char] < t_count[left_char]:
                    formed -= 1
                left += 1

        return s[min_start:min_start + min_len] if min_len != float('inf') else ""
    ```

- 🟡 **Minimum Size Subarray Sum**

    `LeetCode #209`

    **Problem:** Given array of positive integers and target, find minimal length subarray with sum ≥ target.

    > 💡 Intuition
    >
    > Expand until sum ≥ target. Shrink while still valid, tracking minimum length.

    **Visualization:**

    ```
    arr = [2, 3, 1, 2, 4, 3], target = 7

    [2, 3, 1, 2] sum=8 ≥ 7 ✓, min=4
    Shrink: [3, 1, 2] sum=6 < 7, expand
    [3, 1, 2, 4] sum=10 ≥ 7 ✓, min=4
    Shrink: [1, 2, 4] sum=7 ≥ 7 ✓, min=3
    Shrink: [2, 4] sum=6 < 7, expand
    [2, 4, 3] sum=9 ≥ 7 ✓, min=3
    Shrink: [4, 3] sum=7 ≥ 7 ✓, min=2

    Result: 2
    ```

    **Solution:**

    ```python
    def min_subarray_len(target, nums):
        left = 0
        current_sum = 0
        min_length = float('inf')

        for right in range(len(nums)):
            current_sum += nums[right]

            while current_sum >= target:
                min_length = min(min_length, right - left + 1)
                current_sum -= nums[left]
                left += 1

        return min_length if min_length != float('inf') else 0
    ```

- 🔴 **Shortest Subarray with Sum at Least K**

    `LeetCode #862`

    **Problem:** Given array of integers (including negatives) and K, find length of shortest subarray with sum at least K.

    > 💡 Intuition
    >
    > Standard sliding window fails with negatives! Use prefix sum + monotonic deque. For each position j, find smallest i where prefix[j] - prefix[i] ≥ K.

    **Solution:**

    ```python
    from collections import deque

    def shortest_subarray(nums, k):
        n = len(nums)

        # Prefix sum
        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i + 1] = prefix[i] + nums[i]

        min_length = float('inf')
        dq = deque()  # Monotonically increasing by prefix value

        for j in range(n + 1):
            while dq and prefix[j] - prefix[dq[0]] >= k:
                min_length = min(min_length, j - dq.popleft())

            while dq and prefix[j] <= prefix[dq[-1]]:
                dq.pop()

            dq.append(j)

        return min_length if min_length != float('inf') else -1
    ```

### 4.4 Practice Problems

**Easy**

| Problem | Key Concept |
| --- | --- |
| 643. Maximum Average Subarray I | Fixed window, sum tracking |
| 219. Contains Duplicate II | Fixed window (k+1 size), HashSet |
| 1876. Substrings of Size Three with Distinct Characters | Fixed window, uniqueness |
| 1984. Minimum Difference Between Highest and Lowest of K Scores | Sort + fixed window |

**Medium**

| Problem | Key Concept |
| --- | --- |
| 3. Longest Substring Without Repeating Characters | Variable MAX, HashSet |
| 424. Longest Repeating Character Replacement | Variable MAX, frequency + max_freq |
| 567. Permutation in String | Fixed window, Counter comparison |
| 438. Find All Anagrams in a String | Fixed window, match tracking |
| 904. Fruit Into Baskets | Variable MAX, at most 2 distinct |
| 1004. Max Consecutive Ones III | Variable MAX, count zeros |
| 209. Minimum Size Subarray Sum | Variable MIN, sum constraint |
| 1493. Longest Subarray of 1's After Deleting One Element | Variable MAX, exactly one 0 |
| 1208. Get Equal Substrings Within Budget | Variable MAX, cost constraint |

**Hard**

| Problem | Key Concept |
| --- | --- |
| 76. Minimum Window Substring | Variable MIN, character coverage |
| 239. Sliding Window Maximum | Fixed window, Monotonic Deque |
| 992. Subarrays with K Different Integers | Exactly K trick |
| 862. Shortest Subarray with Sum at Least K | Prefix Sum + Monotonic Deque |
| 2444. Count Subarrays With Fixed Bounds | Track positions of min/max |

**Suggested Practice Order:**

1. **Start here**: 643, 3, 209 (one of each type)
2. **Build intuition**: 424, 1004, 438 (variations)
3. **Challenge**: 76, 239, 992 (advanced techniques)

# 5. Edge Cases Checklist

### Universal Edge Cases

| Edge Case | Example | How to Handle |
| --- | --- | --- |
| Empty array/string | `[], ""` | Return 0, "", or empty list immediately |
| Single element | `[5]`, `"a"` | Check if it satisfies condition |
| All same elements | `[1,1,1,1]`, `"aaaa"` | Often hits best/worst case |
| Window size > array | `arr=[1,2], k=5` | Return 0 or indicate impossible |
| No valid window | `target=100, arr=[1,2,3]` | Return 0, -1, or "" based on problem |
| Entire array is answer | `longest unique in "abc"` | Should naturally find it |

### Variation-Specific Edge Cases

**Fixed Window:**

```python
# Array smaller than k
if len(arr) < k:
    return 0  # or appropriate default

# k = 0
if k == 0:
    return 0  # handle specially
```

**Variable Window (MAX):**

```python
# All elements violate constraint
s = "aaaa", no repeating allowed
# Result: 1 (single char is always valid)

# Empty valid window possible
# Initialize max_length = 0, not -inf
```

**Variable Window (MIN):**

```python
# No valid window exists
# Initialize min_length = float('inf')
# Check at end: return 0 if min_length == inf
```

### Pointer Edge Cases

| Edge Case | Description | Solution |
| --- | --- | --- |
| Multi-element skip | Left may need to skip several elements | Use `while` not `if` for shrinking |
| Empty window | After shrinking, left > right | Window size = 0, usually okay |
| Off-by-one | Window size = `right - left + 1` | Always use `+1` for inclusive bounds |
| Initial window | First k elements special handling | Initialize separately before main loop |

### Pre-Check Template

```python
def solution(arr, ...):
    # Edge cases FIRST
    if not arr:
        return ...  # empty result

    if len(arr) == 1:
        return ...  # single element result

    # For fixed window
    if len(arr) < k:
        return ...  # impossible case

    # Main logic
    left = 0
    ...
```

# 6. Tips & Tricks

### Recognition Signals

| Signal | Pattern | Example |
| --- | --- | --- |
| "contiguous subarray" | Sliding Window | Any sum/product problem |
| "contiguous substring" | Sliding Window | String matching |
| "find longest" | Variable (MAX) | Longest without repeating |
| "find shortest" | Variable (MIN) | Minimum window substring |
| "size k" / "exactly k elements" | Fixed Window | Max sum of k elements |
| "at most K distinct" | Variable + HashMap | Fruit into baskets |
| "without repeating" | Variable + HashSet | Longest unique substring |
| "anagram / permutation" | Fixed + Counter | Find all anagrams |
| "maximum in each window" | Fixed + Deque | Sliding window maximum |
| "exactly K distinct" | Exactly K trick | Subarrays with K different |

### Variation Selection Guide

```
┌─────────────────────────────────────────────────────────────────┐
│                    SLIDING WINDOW DECISION TREE                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Is it about CONTIGUOUS subarray/substring?                      │
│  ├─ No → Try other patterns (Two Pointers, DP, etc.)            │
│  └─ Yes ↓                                                        │
│                                                                  │
│  Is window size FIXED?                                           │
│  ├─ Yes → Fixed Window Template                                  │
│  │        Need min/max in window? → Add Monotonic Deque          │
│  │        Need frequency match? → Add Counter                    │
│  └─ No ↓                                                         │
│                                                                  │
│  Looking for MAXIMUM/LONGEST?                                    │
│  ├─ Yes → Variable Window (MAX)                                  │
│  │        Expand eagerly, shrink when invalid                    │
│  └─ No ↓                                                         │
│                                                                  │
│  Looking for MINIMUM/SHORTEST?                                   │
│  └─ Yes → Variable Window (MIN)                                  │
│           Expand until valid, shrink while valid                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Mental Models

**1. The Caterpillar Model**

```
Expand (stretch forward):    Shrink (pull back):
○───────○                    ○──○
   └────→                    ←─┘
```

The caterpillar stretches its front to explore, pulls its back when constraint violated.

**2. The Accordion Model**

```
Contract: |----|      Expand: |--------|
```

For minimum window: expand to become valid, contract to minimize.

**3. The Train Window Model**

```
Fixed window like train cars:
🚃🚃🚃 moves together
Each step: one car exits left, one car enters right
```

### Quick Pattern Matching

| Problem Type | Window | Aux Structure | Validity Check |
| --- | --- | --- | --- |
| Sum of k elements | Fixed | sum variable | Always valid |
| Max in k elements | Fixed | Monotonic Deque | Always valid |
| Unique characters | Variable | HashSet | `char not in set` |
| At most K distinct | Variable | HashMap | `len(map) <= K` |
| Contains all of T | Variable | Two Counters | `matches == required` |
| Frequency match | Fixed | Counter | Compare counts |
| Sum >= target | Variable | sum variable | `sum >= target` |

### The "Exactly K" Trick

Problems asking for "exactly K" are often harder than "at most K".

**Solution**: exactly(K) = atMost(K) - atMost(K-1)

```python
def exactly_k_distinct(nums, k):
    return at_most_k_distinct(nums, k) - at_most_k_distinct(nums, k - 1)

def at_most_k_distinct(nums, k):
    count = defaultdict(int)
    left = 0
    result = 0

    for right in range(len(nums)):
        count[nums[right]] += 1

        while len(count) > k:
            count[nums[left]] -= 1
            if count[nums[left]] == 0:
                del count[nums[left]]
            left += 1

        # Count ALL subarrays ending at right with at most k distinct
        result += right - left + 1

    return result
```

**Why This Works:**
- `atMost(k)` counts subarrays with 0, 1, 2, …, k distinct elements
- `atMost(k-1)` counts subarrays with 0, 1, 2, …, k-1 distinct elements
- Difference = subarrays with exactly k distinct elements

### Common Mistakes

**Mistake 1: Off-by-one in window size**

```python
# ❌ Wrong
window_size = right - left

# ✅ Correct
window_size = right - left + 1
```

**Mistake 2: Using `if` instead of `while` for shrinking**

```python
# ❌ Wrong: only removes one element
if invalid_condition:
    left += 1

# ✅ Correct: removes until valid
while invalid_condition:
    # update state
    left += 1
```

**Mistake 3: Not cleaning up HashMap**

```python
# ❌ Wrong: leaves 0-count entries
char_count[left_char] -= 1

# ✅ Correct: remove when count is 0
char_count[left_char] -= 1
if char_count[left_char] == 0:
    del char_count[left_char]
```

**Mistake 4: Updating result at wrong time**

```python
# For MAXIMUM: update AFTER ensuring valid
while invalid:
    shrink()
max_length = max(max_length, right - left + 1)  # ✅

# For MINIMUM: update BEFORE shrinking
while valid:
    min_length = min(min_length, right - left + 1)  # ✅
    shrink()
```

**Mistake 5: Wrong initialization**

```python
# For MAXIMUM window
max_length = 0  # ✅ Correct

# For MINIMUM window
min_length = float('inf')  # ✅ Correct
# Check at end:
return min_length if min_length != float('inf') else 0
```

### Advanced Techniques

**Monotonic Deque for Window Min/Max**

When to use: Need to efficiently query minimum or maximum element in current window.

Why not HashMap?: HashMap can track presence/count, but not order. Finding max requires O(k) scan.

**Template for Maximum** (stores indices, decreasing order):

```python
from collections import deque

dq = deque()  # Front has index of maximum

for i, num in enumerate(nums):
    # Remove indices outside window
    while dq and dq[0] <= i - k:
        dq.popleft()

    # Maintain decreasing order
    while dq and nums[dq[-1]] < num:
        dq.pop()

    dq.append(i)
    # Maximum is always nums[dq[0]]
```

**Prefix Sum + HashMap Alternative**

When sliding window isn't enough:
- Subarray sum equals exactly K (not at least, not at most)
- Negative numbers present
- Need count of valid subarrays

```python
def subarray_sum_equals_k(nums, k):
    count = 0
    prefix_sum = 0
    prefix_count = defaultdict(int)
    prefix_count[0] = 1

    for num in nums:
        prefix_sum += num
        count += prefix_count[prefix_sum - k]
        prefix_count[prefix_sum] += 1

    return count
```

### Comparison with Related Patterns

| Pattern | When to Use | Key Characteristic | Time |
| --- | --- | --- | --- |
| **Sliding Window** | Contiguous subarray/substring with constraint | Window expands/contracts, maintains state incrementally | O(n) |
| **Two Pointers** | Sorted array, pair finding, partitioning | Pointers typically converge or move based on comparison | O(n) |
| **Prefix Sum** | Range sum queries, subarray sum = k | Precompute cumulative sums, O(1) range queries | O(n) preprocess, O(1) query |
| **Kadane's Algorithm** | Maximum subarray sum only | Track max ending at each position | O(n) |

**Sliding Window vs Two Pointers:**

```
Sliding Window:          Two Pointers (converging):
L────────R               L──────────────────R
Both move right          Move toward each other
Contiguous segment       May care only about endpoints
```

**Sliding Window vs Prefix Sum:**

Prefer Sliding Window when:
- Need actual elements in window
- Constraint involves more than sum (unique, frequency)
- Window definition is dynamic

Prefer Prefix Sum when:
- Multiple queries on same array
- Need exact sum (especially with negatives)
- Counting subarrays with sum = k
