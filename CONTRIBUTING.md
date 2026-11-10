# Contributing to TextUtility

Thanks for helping improve a local, open text tool. By contributing, you agree that your changes are released under the project's [MIT license](LICENSE).

## Getting started

Use Node.js 22 or newer and npm. Install dependencies with `npm ci` and run the app locally with `npm run dev`. Before proposing a change, run `npm test`, `npm run typecheck` and `npm run build`.

## Making changes

Prefer pure operations in `lib/operations.ts`, isolated and tested in `tests/`. Do not send the edited text to any endpoint, and do not add analytics that read it. Keep keyboard navigation accessible, labels clear, operations reversible and `prefers-reduced-motion` respected. Ask for confirmation before any action that could replace the editor content.

Pull requests should explain the use case, describe new behavior or limits, and include tests for the transformation. Do not include scratch files, build output, `.env` files, credentials or real user content.

## Local environment

Copy `.env.example` to `.env` only if you need to override the dev server port. Never commit `.env`, credentials or real user content.
