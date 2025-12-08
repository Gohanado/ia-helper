# Roadmap / Ideas

- Client warmup for jynra: send a tiny request (e.g., `num_predict: 0/1` on `/api/generate` or `/api/chat`) when the popup opens to keep the 20B model warm and reduce TTFB. Consider a periodic keep-alive while the UI stays open.
- Client-side streaming smoothing for jynra: implement buffering (accumulate initial chunks before render) to reduce perceived stutter; keep it structured/clean and test until UX feels fluid.
- Structured test pass: run streaming tests on jynra vs badom, add detailed debug logging to isolate latency/chunking issues, iterate until stable, then strip debug.
- Add translate button with dropdown in the generation popup to post-process and render the generated answer in another language.
- Investigate TTS behavior on Ubuntu (latency/failures), identify if engine selection or permissions differ from other platforms.
- Stream "thinking" tokens end-to-end (popup/results/chat) for providers that emit reasoning (e.g., gpt-oss on ollama.badom.ch); ensure live display when present and add tests across models (some emit thinking, others not). Add option in options.js to enable/disable thinking in requests when supported.
