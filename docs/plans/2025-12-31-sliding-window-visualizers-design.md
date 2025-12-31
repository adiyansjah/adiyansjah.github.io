# Sliding Window Visualizers Design

## Overview

Build 5 interactive visualizers for sliding window algorithm patterns, with a shared module for common functionality.

## Project Structure

```
notes/algorithms/03-sliding-window/
├── materials/
│   └── sliding-window.md (existing)
└── visualizers/
    ├── shared.css
    ├── sliding-window-shared.js
    ├── 01-fixed-size/
    │   ├── index.html
    │   ├── fixed-size.css
    │   └── fixed-size.js
    ├── 02-variable-max/
    │   ├── index.html
    │   ├── variable-max.css
    │   └── variable-max.js
    ├── 03-variable-min/
    │   ├── index.html
    │   ├── variable-min.css
    │   └── variable-min.js
    ├── 04-hashmap/
    │   ├── index.html
    │   ├── hashmap.css
    │   └── hashmap.js
    └── 05-monotonic-deque/
        ├── index.html
        ├── monotonic-deque.css
        └── monotonic-deque.js
```

## Shared Module API

### `sliding-window-shared.js`

```javascript
window.SlidingWindowShared = {
    // Array rendering
    renderArraySVG(container, array, left, right, highlights),

    // Auxiliary structure rendering
    renderHashMap(container, map),
    renderHashSet(container, set),
    renderDeque(container, deque, array),

    // Window state helpers
    createWindowState(array, params),
    calculateWindowSum(array, left, right),

    // Animation engine
    createAnimationController(stepFn, options),

    // UI helpers
    renderPseudocode(container, lines, activeLine),
    renderExplanation(container, template, values),
    renderStatusBar(container, message),

    // Input parsing
    parseArrayInput(input),
    validateParams(params, variation),

    // Constants
    COLORS: { window, left, right, valid, invalid, best },
    DIMENSIONS: { cellSize, cellGap, padding }
}
```

### Animation Controller Pattern

```javascript
const controller = SlidingWindowShared.createAnimationController(stepFn, {
    speed: 500,
    onStep: (state) => render(state),
    onComplete: () => showResult()
});

controller.play();
controller.pause();
controller.step();
controller.reset();
```

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Array with Window Highlighting                              │
│                                                              │
│    ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐        │
│    │ 2 │ │ 1 │ │ 5 │ │ 1 │ │ 3 │ │ 2 │ │ 8 │ │ 1 │        │
│    └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘        │
│      0     1     2     3     4     5     6     7            │
│                  ▲───────────────▲                          │
│                  L    [window]   R                          │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Auxiliary Structure (HashMap/Set/Deque)             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Status: Window [2,5] | Sum: 12 | Best: 15                  │
└─────────────────────────────────────────────────────────────┘
```

### SVG Specifications

- Array cells: 48x48px, 8px gap, white fill with border
- Window overlay: Teal (#14b8a6) with 20% opacity, rounded corners
- Left pointer: Teal marker below cell with "L" label
- Right pointer: Darker teal (#0d9488) marker with "R" label
- Best window found: Dashed green border overlay
- Invalid state: Red tint on window overlay

## CSS Theme

```css
:root {
    /* Base theme */
    --bg: transparent;
    --card: #ffffff;
    --text: #1a1a1a;
    --muted: #737373;
    --border: #e5e5e5;
    --radius: 8px;

    /* Sliding window teal theme */
    --accent: #14b8a6;
    --accent-dark: #0d9488;
    --accent-light: #5eead4;

    /* Window states */
    --window-fill: rgba(20, 184, 166, 0.15);
    --window-border: #14b8a6;
    --window-invalid: rgba(239, 68, 68, 0.15);

    /* Pointers */
    --left-pointer: #14b8a6;
    --right-pointer: #0d9488;

    /* Result states */
    --best-window: #22c55e;
    --best-window-fill: rgba(34, 197, 94, 0.1);

    /* Auxiliary structures */
    --hashmap-key: #14b8a6;
    --hashmap-value: #0d9488;
    --deque-front: #14b8a6;
    --deque-item: #e5e5e5;
}
```

## Visualizer Specifications

### 1. Fixed-Size Window

**Problem:** Maximum Sum of K Consecutive Elements

**State:**
```javascript
{
    array: [2, 1, 5, 1, 3, 2],
    k: 3,
    left: 0,
    right: 2,
    currentSum: 8,
    maxSum: 8,
    bestWindow: { left: 0, right: 2 },
    phase: 'sliding'  // 'init' | 'sliding' | 'complete'
}
```

**Presets:**
1. Small: `[2, 1, 5, 1, 3, 2]`, k=3
2. Medium: `[1, 4, 2, 10, 2, 3, 1, 0, 20]`, k=4
3. Edge - single element: `[5]`, k=1
4. Tricky - max at end: `[1, 1, 1, 1, 9, 9, 9]`, k=3

**Pseudocode:**
```
function maxSumK(arr, k):
    n = arr.length
    if n < k: return -1

    windowSum = sum(arr[0:k])
    maxSum = windowSum

    for right = k to n-1:
        windowSum += arr[right]
        windowSum -= arr[right - k]

        if windowSum > maxSum:
            maxSum = windowSum

    return maxSum
```

**Auxiliary structure:** None

---

### 2. Variable Max + HashSet

**Problem:** Longest Substring Without Repeating Characters

**State:**
```javascript
{
    string: "abcabcbb",
    left: 0,
    right: 0,
    charSet: new Set(),
    currentLength: 0,
    maxLength: 0,
    bestWindow: { left: 0, right: 0 },
    phase: 'expanding'  // 'expanding' | 'contracting' | 'complete'
}
```

**Presets:**
1. Small: `"abcabcbb"` (answer: 3, "abc")
2. Medium: `"pwwkew"` (answer: 3, "wke")
3. Edge - all same: `"bbbbb"` (answer: 1)
4. Tricky - all unique: `"abcdef"` (answer: 6)

**Pseudocode:**
```
function lengthOfLongestSubstring(s):
    charSet = new Set()
    left = 0
    maxLen = 0

    for right = 0 to s.length - 1:
        while s[right] in charSet:
            charSet.remove(s[left])
            left++

        charSet.add(s[right])

        if right - left + 1 > maxLen:
            maxLen = right - left + 1
            bestWindow = [left, right]

    return maxLen
```

**Auxiliary structure:** HashSet displayed as horizontal row of character badges

---

### 3. Variable Min

**Problem:** Minimum Size Subarray Sum

**State:**
```javascript
{
    array: [2, 3, 1, 2, 4, 3],
    target: 7,
    left: 0,
    right: 0,
    currentSum: 0,
    minLength: Infinity,
    bestWindow: null,
    phase: 'expanding'  // 'expanding' | 'contracting' | 'complete'
}
```

**Presets:**
1. Small: `[2, 3, 1, 2, 4, 3]`, target=7 (answer: 2, [4,3])
2. Medium: `[1, 4, 4]`, target=4 (answer: 1, [4])
3. Edge - no solution: `[1, 1, 1, 1]`, target=100 (answer: 0)
4. Tricky - whole array: `[1, 2, 3, 4, 5]`, target=15 (answer: 5)

**Pseudocode:**
```
function minSubArrayLen(target, arr):
    left = 0
    currentSum = 0
    minLen = Infinity

    for right = 0 to arr.length - 1:
        currentSum += arr[right]

        while currentSum >= target:
            if right - left + 1 < minLen:
                minLen = right - left + 1
                bestWindow = [left, right]

            currentSum -= arr[left]
            left++

    return minLen == Infinity ? 0 : minLen
```

**Auxiliary structure:** None (status bar shows currentSum vs target)

---

### 4. Window + HashMap

**Problem:** Longest Substring with At Most K Distinct Characters

**State:**
```javascript
{
    string: "eceba",
    k: 2,
    left: 0,
    right: 0,
    charCount: new Map(),
    distinctCount: 0,
    currentLength: 0,
    maxLength: 0,
    bestWindow: { left: 0, right: 0 },
    phase: 'expanding'
}
```

**Presets:**
1. Small: `"eceba"`, k=2 (answer: 3, "ece")
2. Medium: `"aaabbcccc"`, k=2 (answer: 7, "abbcccc")
3. Edge - k=1: `"aabbcc"`, k=1 (answer: 2)
4. Tricky - all same: `"aaaa"`, k=1 (answer: 4)

**Pseudocode:**
```
function lengthOfLongestSubstringKDistinct(s, k):
    charCount = new Map()
    left = 0
    maxLen = 0

    for right = 0 to s.length - 1:
        charCount[s[right]]++

        while charCount.size > k:
            charCount[s[left]]--
            if charCount[s[left]] == 0:
                charCount.delete(s[left])
            left++

        if right - left + 1 > maxLen:
            maxLen = right - left + 1
            bestWindow = [left, right]

    return maxLen
```

**Auxiliary structure:** HashMap displayed as key-value pairs with count badges

---

### 5. Monotonic Deque

**Problem:** Sliding Window Maximum

**State:**
```javascript
{
    array: [1, 3, -1, -3, 5, 3, 6, 7],
    k: 3,
    left: 0,
    right: 0,
    deque: [],
    result: [],
    phase: 'building'  // 'building' | 'sliding' | 'complete'
}
```

**Presets:**
1. Small: `[1, 3, -1, -3, 5, 3, 6, 7]`, k=3 (answer: [3,3,5,5,6,7])
2. Medium: `[9, 8, 7, 6, 5, 4, 3, 2, 1]`, k=3 (answer: [9,8,7,6,5,4,3])
3. Edge - k=1: `[1, 2, 3, 4]`, k=1 (answer: [1,2,3,4])
4. Tricky - ascending: `[1, 2, 3, 4, 5]`, k=3 (answer: [3,4,5])

**Pseudocode:**
```
function maxSlidingWindow(arr, k):
    deque = []
    result = []

    for right = 0 to arr.length - 1:
        // Remove indices outside window
        while deque not empty and deque[0] < right - k + 1:
            deque.popFront()

        // Remove smaller elements from back
        while deque not empty and arr[deque.back] < arr[right]:
            deque.popBack()

        deque.pushBack(right)

        // Window is complete, record max
        if right >= k - 1:
            result.push(arr[deque[0]])

    return result
```

**Auxiliary structure:** Deque displayed as horizontal queue showing indices with values, front highlighted

## Common Features

Each visualizer includes:
- 4 presets + custom input with parameters
- Full pseudocode with line highlighting
- Detailed explanations with current values
- Step/Play/Pause/Reset controls with speed slider
- SVG array visualization with window overlay
- Auxiliary structure display (where applicable)
- Status bar with current state

## Implementation Order

1. `shared.css` - Base theme and layout
2. `sliding-window-shared.js` - Core rendering and animation
3. `01-fixed-size/` - Simplest, validates shared module
4. `02-variable-max/` - Adds HashSet auxiliary
5. `03-variable-min/` - Similar to #2, different condition
6. `04-hashmap/` - Adds HashMap auxiliary
7. `05-monotonic-deque/` - Most complex auxiliary structure

## File Count

- 2 shared files (CSS + JS)
- 3 files per visualizer x 5 = 15 files
- **Total: 17 files**
