
# How to create the extension

Run this prompt in Gemini:
```
Write me the files for a chrome extension to open a new tab on the right and when closing a tab, move to the one on the left.
```

But there was an issue that no LLM can fix because an LLM cannot debug things.
- Hack: Wait for onActivated before updating this because activeTab.index is stale/wrong!
