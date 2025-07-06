🫧 Bubblegum

Lightweight. Reliable. Always ready.

    “A faithful sidearm for your terminal. Chambered in clean prompts. Wrapped for rapid draw.”

📦 Overview

Bubblegum is a personal wrapper around AnyClaude — retooled, restyled, and re-racked for local use. It’s a terminal-native LLM loader and prompt router with hand-selected integrations, clean output, and no extra noise. Built to be sharp, fast, and familiar — like a well-oiled .45.

    ✅ OpenAI: API-ready, sits up top

    ✅ Claude: Anthropic via CLAUDE_API_KEY

    ✅ Gemini: Google's models via GEMINI_API_KEY

    ✅ Mistral: Frontier open-weight models

    ✅ OpenRouter: Unified endpoint, fallback-ready

🗃️ xAI removed. The bench has been cleaned, the slide filed smooth — no further notes necessary.

<img src="./demo.png" width="65%">

## Begin!

```sh
# Use your favorite package manager (bun, pnpm, and npm are supported)
$ pnpm install -g anyclaude 

# bubblegum is a wrapper
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
