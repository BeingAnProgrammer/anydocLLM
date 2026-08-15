# AnyDoc LLM

A free, open-source, entirely client-side tool that converts documents into clean, LLM-ready Markdown. Upload a file, get Markdown, done — no account, no subscription, no server round-trip for your document.

## Architecture

```
Browser
  ↓
Angular (standalone components, signals)
  ↓
ConversionService
  ↓
        ┌──────────┴──────────┐
        │                     │
      PDF                  everything else
        ↓                     ↓
@firecrawl/pdf-inspector-wasm   @firecrawl/anydoc-wasm
        │                     │
        └──────────┬──────────┘
                    ↓
                Markdown
                    ↓
      Markdown editor / live preview
                    ↓
           Copy or download .md
```

Documents are converted **entirely inside the browser tab**, using two open-source Rust engines compiled to WebAssembly (both MIT-licensed, both from the [Firecrawl](https://github.com/firecrawl) team): [pdf-inspector](https://github.com/firecrawl/pdf-inspector) for PDFs specifically, and [AnyDoc](https://github.com/firecrawl/anydoc) for every other supported format. A file never leaves the browser: there is no backend, no custom API, and no call to Firecrawl's hosted API.

Each engine is isolated behind its own service — `PdfInspectorWasmService` and `AnyDocWasmService` (`src/app/core/services/`) — which the rest of the app never talks to directly. Everything goes through `ConversionService`, which picks the engine by format and hands both the same job: bytes in, Markdown out. That keeps the UI decoupled from which engine ran; a component never knows or needs to know.

Both WASM modules are loaded lazily and independently: opening `/convert` loads neither, and only the engine the selected file actually needs loads once conversion starts — a PDF never triggers AnyDoc, and a DOCX never triggers pdf-inspector. The landing page never pays for either.

## Supported formats

PDF, DOCX, DOC, XLSX, XLS, PPTX, PPT, CSV, ODT, ODS, ODP, RTF, EPUB — the exact set the two engines declare support for (`src/app/core/models/supported-file.model.ts`, typed against AnyDoc's own `Format` union so a version bump that changes what's supported fails the build here rather than drifting silently).

## Development server

```bash
ng serve
```

Open `http://localhost:4200/`. Reloads automatically on source changes.

## Building

```bash
ng build
```

Production output goes to `dist/`.

## Running unit tests

```bash
ng test
```

Runs the [Vitest](https://vitest.dev/) suite.
