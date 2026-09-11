---
title: "Debugging with smaller experiments"
date: "2026-09-10"
summary: "A sample technical note about reducing a confusing problem to a testable question."
category: "Technology"
draft: false
sample: true
---

A difficult bug often comes with too many possible explanations. The next useful step is not always another code change. It may be a smaller experiment that rules out one explanation.

## Describe the failure precisely

Start with what is observable: the input, the expected result, and the actual result. Avoid turning a guess into the problem statement. “The output contains a duplicate row” is more useful than “The database is broken.”

## Reduce the moving parts

Try a smaller input, a single operation, or a simplified environment. Keep the failure while removing unrelated behavior. If the failure disappears, that change is evidence too.

### Change one thing at a time

Multiple simultaneous fixes make it difficult to know which change mattered. Record a hypothesis before changing the code, then compare the result with the prediction.

## Make assumptions visible

For a function that calculates a mean, an empty collection is a small but important case:

```python
def mean(values):
    if not values:
        raise ValueError("At least one value is required")
    return sum(values) / len(values)
```

The point is not that every function should raise this error. The point is to decide what the input contract means and make that decision explicit.

## Leave a useful explanation

When a fix works, record why it works. A short explanation of the violated assumption helps a future reader understand the change and avoid reintroducing the problem.

> A good debugging note connects the symptom, the cause, and the reason for the fix.
