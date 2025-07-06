# 🫧 **Bubblegum**

_Lightweight. Reliable. Always ready._

> _“A faithful sidearm for your terminal. Chambered in clean prompts. Wrapped for rapid draw.”_

* * *

## 📦 Overview

**Bubblegum** is a personal wrapper around [AnyClaude](https://github.com/anysphere/anyclaude) — retooled, restyled, and re-racked for local use. It’s a terminal-native LLM loader and prompt router with hand-selected integrations, clean output, and no extra noise. Built to be sharp, fast, and familiar — like a well-oiled .45.

- ✅ **OpenAI**: API-ready, sits up top
- ✅ **Claude**: Anthropic via `CLAUDE_API_KEY`
- ✅ **Gemini**: Google's models via `GEMINI_API_KEY`
- ✅ **Mistral**: Frontier open-weight models
- ✅ **OpenRouter**: Unified endpoint, fallback-ready

🗃️ **xAI removed.** The bench has been cleaned, the slide filed smooth — no further notes necessary.

<img src="./demo.png" width="65%">

* * *

## 🔩 Installation

```bash
npm install -g git+https://github.com/yourname/bubblegum.git
```

Or clone for local development:

```bash
git clone https://github.com/yourname/bubblegum.git
cd bubblegum
npm install
```

* * *

## 🛠️ Usage

```bash
bubblegum "Write me a sonnet about carbon steel"
```

Optional flags:

```
--model <model_name>        Specify provider/model
--json                      Output raw JSON
--stream                    Enable streaming mode
```

* * *

## 💡 Philosophy

**Bubblegum** was built for the terminal gunfighter — clean loadout, high reliability, minimal distractions. It’s a fast-access mental sidearm for querying local or remote LLMs, tuned for clarity, speed, and presence.

> “You don’t need every bell and whistle. Just what works. And works _every time_.”

* * *

Absolutely — here's that footnote, refit to match the **Bubblegum** style and tone from the README:

* * *

## 🔐 API Keys & Endpoints

Just load your mags — Bubblegum knows what to do.

| 🔧 Env Var | 🔗 Powers Up | Notes |
| --- | --- | --- |
| `OPENAI_API_KEY` | `openai/*` | Works with GPT-4, GPT-3.5, etc. |
| `GOOGLE_API_KEY` | `google/*` | Works great — if you're feeling lucky. |
| `GEMINI_API_KEY` | `google/*` | Yes, really. Just in case the stars align. |
| `MISTRAL_API_KEY` | `mistralai/*` | Slim, mean, open-weight machines. |
| `ANTHROPIC_MODEL` | `anthropic/claude-*` | For named Claude models, don't quote me on that. |
| `ANTHROPIC_SMALL_MODEL` | (Optional backup) | For lightweight Claude fallback. |
| `OPENAI_API_URL` | _Custom OpenAI endpoint_ | Use this to hit OpenRouter. |
| `ANTHROPIC_BASE_URL` | _Custom Claude endpoint_ | Sticks Anthropic to whatever it touches. |

🧠 Bubblegum wraps around [Vercel’s AI SDK](https://github.com/vercel/ai), which dispatches requests like a smart courier — formatting payloads to match each provider’s quirks and quirksome quirks.

> _Think of it as HTTP-flavor — and Bubblegum is has the wrap._

## 📄 License & Lineage

MIT Licensed. Forked from the excellent [AnyClaude](https://github.com/coder/anyclaude). This repo exists as a private sidearm — tweaked and trimmed for personal use. All credit to upstream for the original engineering.

* * *

## 🫧 Credits

- Terminal aesthetics inspired by bubblegum wrappers, neon HUDs, and the satisfying thunk of steel-on-steel.
- 1911-A1 philosophy baked in: timeless form, reliable action, no unnecessary parts.

* * *

<br>
