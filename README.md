Use Claude Code with weird application programming interfaces!

- Extremely simple setup - just a basic wrapper
- Uses the artificial intelligence software dev kit for compatibility
- Works with Claude Code (probably not other programs though)

<img src="./demo.png" width="65%">

## Begin!

```sh
# Use your favorite package manager (bun, pnpm, and npm are supported)
$ pnpm install -g anyclaude 

# anyclaude is a wrapper
# `openai/`, `google/`, `mistralai/`, `anthropic/` and possibly others...
$ anyclaude --model openai/dicaprio-007
```

Switch models within the UI with `/model openai/dicaprio-007`.

## FAQ

### What works?

See [the providers](./src/main.ts#L17) for implementation.

- `OPENAI_API_KEY` supports `openai/*` models.
- `GOOGLE_API_KEY` supports `google/*` models. and so does `GEMINI_API_KEY` if you're feeling really lucky.
- `MISTRAL_API_KEY` supports `mistralai/*` models.
- `ANTHROPIC_MODEL` and `ANTHROPIC_SMALL_MODEL` are supported with the `<provider>/` syntax if you want.

Set a custom OpenAI endpoint with `OPENAI_API_URL` to use OpenRouter

### How does this work?

Claude Code has supports setting a custom endpoint using `ANTHROPIC_BASE_URL`.

This wrapper serves HTTP flavored code that sticks the anthropic to whatever it comes in contact with a standard [AI SDK](https://github.com/vercel/ai)

Basically it's kinda like bubblegum.
