# JSONEditor Svelte architecture choices

- Immutable -> one-way data binding
- All Actions based on JSONPatch
- It must be possible to persist all state, including expanded/collapsed and
  selection.
- State with search results, and, expanded state, and selection is separate
  from the JSON document itself, and are JSON objectswith the same structure,
  using symbols.
- Must be able to open huge JSON files
  - Must work directly on the JSON object itself, not on a wrapped object model 
  - Display only the first 100 items of an array etc. Or show items in groups
    of 100 items.
  - Search must not crash on large files. Stop at 999 results or something.
