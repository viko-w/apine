# ![apine](./apine/public/apine-logo.svg)

**apine** is a lightweight, browser-based API client for sending HTTP requests and inspecting responses — think Postman, but running entirely in your browser with zero backend.

## What it does

- Send requests using any HTTP method (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- Attach custom headers with duplicate-name detection
- Append URL query parameters
- View responses as syntax-highlighted JSON or as a table for arrays and objects

## Why it exists

apine is built as a fast, accessible alternative to heavier API testing tools. Everything runs client-side — no server, no account, no telemetry. It ships with full keyboard navigation, ARIA roles, and a skip-to-content link, making it usable without a mouse.

## Project layout

This repository is structured as a monorepo root with the application living in [`./apine/`](./apine/).

- [`apine/`](./apine/) — the Vite + React + TypeScript application (see [apine/README.md](./apine/README.md) for setup and usage)

## Tech stack

- [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) 8
- [React Router](https://reactrouter.com/) 7
- [Oxlint](https://oxc.rs/docs/guide/usage/linter)
- [Tauri](https://tauri.app/) 2 (Rust backend, desktop shell)

## CI & releases

`.github/workflows/ci.yml` lints, type-checks and builds on every push and PR
to `main`, then runs `cargo fmt`, `clippy` and `check`, plus a Tauri build on
macOS, Windows and Linux.

Pushing a `v*` tag runs `.github/workflows/release.yml`, which verifies the tag
against the version in `tauri.conf.json` / `Cargo.toml` and publishes installers
for macOS, Linux and Windows as a GitHub Release. See
[apine/README.md](./apine/README.md#releasing) for the full steps.
