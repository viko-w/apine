# apine

Vite + React + TypeScript.

```sh
npm install
npm run dev
```

`npm run build` type-checks and builds to `dist/`. `npm run lint` runs oxlint.

Rust side:

```sh
cd src-tauri
cargo clippy --all-targets -- --deny warnings
```

The desktop app is wrapped in Tauri. `src-tauri` must be formatted with
`cargo fmt` before pushing; CI enforces it (see `rustfmt.toml` for the
two-space indentation used here).

## Releasing

CI (`.github/workflows/ci.yml`) runs on every push and PR to `main`: oxlint +
typecheck + build, then `cargo fmt`/`clippy`/`check`, then a Tauri build on
macOS, Windows and Linux.

To publish, bump `version` in both `src-tauri/tauri.conf.json` and
`src-tauri/Cargo.toml`, merge, then tag:

```sh
git tag v0.1.0 && git push origin v0.1.0
```

`release.yml` verifies the tag matches the declared versions, then builds and
uploads installers to a GitHub Release for macOS (Apple Silicon + Intel),
Linux (AppImage, deb) and Windows (NSIS, MSI). Artifacts are **unsigned** —
macOS users must right-click > Open the app once, and Windows shows a
"more info" prompt in SmartScreen.
