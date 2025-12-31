# Fast-Slow Pointers Visualizers Design

## Overview

Create interactive visualizers for the Fast-Slow Pointers algorithm patterns to complement the educational material in `notes/algorithms/02-fast-slow-pointers/`.

## Design Decisions

| Decision | Choice |
|----------|--------|
| Layout approach | Hybrid (linear chain that curves into circle for cycles) |
| Number of visualizers | 3 grouped visualizers |
| Input method | Presets + custom text input |
| Pointer style | Icons (🐢🐇) + color highlights |
| Stepping behavior | One iteration per step |

## File Structure

```
02-fast-slow-pointers/visualizers/
├── shared.css                          # Reuse from 01-two-pointers
├── fast-slow-shared.js                 # Shared linked list utilities
├── 01-cycle-detection/
│   ├── cycle-detection.html
│   ├── cycle-detection.css
│   └── cycle-detection.js
├── 02-middle-finding/
│   ├── middle-finding.html
│   ├── middle-finding.css
│   └── middle-finding.js
└── 03-nth-palindrome/
    ├── nth-palindrome.html
    ├── nth-palindrome.css
    └── nth-palindrome.js
```

## Shared Module: `fast-slow-shared.js`

Reusable logic for all visualizers:

- **Linked list data structure**: Node class with value/next pointers
- **Layout calculator**: Computes node positions (linear + circular portions)
- **SVG renderer**: Draws nodes, arrows, curved cycle connections
- **Pointer renderer**: Positions icons with color highlights
- **Preset generator**: Creates common test cases

## Linked List Visualization

### Hybrid Layout Algorithm

**Linear portion (head → cycle entry):**
- Nodes arranged horizontally left-to-right
- Connected by straight arrows
- Spacing: 80px between nodes

**Circular portion (cycle nodes):**
- Nodes after entry point curve into a loop
- SVG arc paths for cycle visualization
- Rendered below/right of linear portion

```
No cycle:     [1] → [2] → [3] → [4] → [5] → NULL

With cycle:   [1] → [2] → [3] → [4]
                    ↑           ↓
                    └─── [6] ← [5]
```

### Node States

| State | Visual |
|-------|--------|
| Default | White background, gray border (48x48px) |
| Slow pointer | Blue border + 🐢 icon above |
| Fast pointer | Orange border + 🐇 icon above |
| Both pointers | Purple border + both icons stacked |
| Meeting point | Green pulse animation |
| Cycle entry found | Gold highlight |

## Visualizer Specifications

### 1. Cycle Detection + Entry

Two-phase Floyd's algorithm with mode indicator.

**Phase 1 (Detection):**
- Slow/fast traverse until they meet or fast hits NULL
- Pseudocode highlights detection logic

**Phase 2 (Entry):**
- Reset slow to head, both move at speed 1
- Meet at cycle entry point

**Presets:**
- "No cycle (5 nodes)"
- "Cycle at node 2"
- "Self-loop (node 1)"
- "Long tail, short cycle"

### 2. Middle Finding

Toggle for first vs second middle behavior.

**Controls:**
- Radio: "First middle" vs "Second middle"
- Shows condition difference: `fast.next and fast.next.next` vs `fast and fast.next`

**Presets:**
- "Odd length (5 nodes)"
- "Even length (6 nodes)"
- "Two nodes"
- "Single node"

### 3. Nth from End + Palindrome

Tab-based UI switching between two modes.

**Nth from End tab:**
- Number input for `n` value
- Gap creation phase → parallel movement
- Presets: "5 nodes, n=2", "5 nodes, n=5", "n exceeds length"

**Palindrome tab:**
- Three stages: find middle → reverse second half → compare
- Presets: "1→2→2→1 (true)", "1→2→3 (false)", "single node"

## UI Layout

### Configuration Panel

```
┌─────────────────────────────────────────────────────────┐
│ Configuration                                           │
├─────────────────────────────────────────────────────────┤
│ Preset: [Dropdown ▼]                                    │
│ Node Values: [1, 2, 3, 4, 5, 6]                        │
│ Cycle connects to index: [None ▼]                       │
│ [Load]  [Random]                                        │
├─────────────────────────────────────────────────────────┤
│ [Step]  [Play]  [Reset]     Speed: ──●────── 600ms     │
└─────────────────────────────────────────────────────────┘
```

### Visualization Panel

- **Top**: Iteration badge
- **Center**: SVG canvas with linked list, arrows, pointers
- **Bottom**: Status bar with current state description

### Educational Panels

**Left - Algorithm:**
- Pseudocode with line highlighting
- Phase indicator (for cycle detection)

**Right - What's Happening:**
- Step title and explanation
- Calculation box showing positions

## Error Handling

### Input Validation

| Error | Message |
|-------|---------|
| Empty input | "Enter at least 1 node value" |
| Non-numeric | "Values must be numbers" |
| Invalid cycle index | Warning if index >= node count |
| N > list length | "n exceeds list length" |

### Edge Cases

| Case | Behavior |
|------|----------|
| Empty list | Disable controls, show empty state |
| Single node (no cycle) | Fast immediately NULL |
| Single node (self-loop) | Pointers meet at node 1 |
| Two nodes | Proper middle based on toggle |
| Cycle at head | All nodes in circle layout |
| N = 0 | Invalid input warning |

### Visual Feedback

- NULL pointer: Ghost "NULL" node at end
- Algorithm complete: Disable Step, show result
- Found state: Pulse animation on result nodes

## Implementation Order

1. `fast-slow-shared.js` - Core linked list rendering
2. `01-cycle-detection/` - Most complex, validates shared module
3. `02-middle-finding/` - Simpler, reuses shared module
4. `03-nth-palindrome/` - Two modes, most UI complexity
