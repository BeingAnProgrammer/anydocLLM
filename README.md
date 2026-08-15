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
@firecrawl/anydoc-wasm  (AnyDoc, compiled to WebAssembly)
  ↓
Markdown
  ↓
Markdown editor / live preview
  ↓
Copy or download .md
```

Documents are converted **entirely inside the browser tab** using [AnyDoc](https://github.com/firecrawl/anydoc), an open-source Rust document-to-Markdown engine, compiled to WebAssembly via the official `@firecrawl/anydoc-wasm` package (MIT license). A file never leaves the browser: there is no backend, no custom API, and no call to Firecrawl's hosted API.

The WASM engine is isolated behind `AnyDocWasmService` (`src/app/core/services/anydoc-wasm.service.ts`), which the rest of the app never talks to directly — everything goes through `ConversionService`. That keeps the UI decoupled from the specific parsing engine: swapping AnyDoc for something else later would mean changing one service, not the app.

The AnyDoc WASM module (a few MB) is loaded lazily, only once the `/convert` route is opened — the landing page never pays that cost.

## Supported formats

PDF, DOCX, DOC, XLSX, XLS, PPTX, PPT, CSV, ODT, ODS, ODP, RTF, EPUB — the exact set AnyDoc declares support for (`src/app/core/models/supported-file.model.ts`, typed against the package's own `Format` union so a version bump that changes what's supported fails the build here rather than drifting silently).

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
