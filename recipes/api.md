---
name: api-house
version: 1.0.0
author: farshadmomo
description: Backend / HTTP API house style — resource-first modeling, errors that document themselves, boring by design
extends: [./creative-core.md]
---

## [always] vibe
An API is a contract other people build their livelihood on, so the whole aesthetic is predictability. Resources are nouns, methods are the verbs, URLs are hierarchical and guessable, and the same idea is shaped the same way in every response — a list is always `{ data, pagination }`, an error is always the same envelope, a timestamp is always RFC 3339 UTC. Consistency beats cleverness every time; a surprising-but-elegant endpoint is a bug report waiting to happen. The signature move is that errors read like documentation: every failure names what went wrong, which field caused it, and exactly what the caller should do next — a developer should be able to fix their integration from the error body alone, without opening your docs. Banned: 200-OK-with-an-error-in-the-body, HTTP verbs smuggled into query strings (`?action=delete`), unversioned public surfaces, stack traces leaked to clients, boolean soup query params, RPC verbs pretending to be REST (`/getUserData`), and inventing a new error shape per endpoint.

## [stack] kickoff
Project-start ritual — ONLY if API-DESIGN.md does not exist; skip once it does. Before writing a single handler, design the contract on paper: (1) the resource model — list every noun, its fields with types and nullability, and how resources relate; (2) the URL + method table — the full CRUD surface, status codes per outcome, pagination and filtering shape; (3) the ONE error envelope every endpoint shares, plus a starter error catalog (code, HTTP status, when it fires, the fix message the caller sees). Decide auth model, versioning strategy, and idempotency story here too. No two endpoints may shape the same concept differently; if two feel inconsistent, fix the model before it calcifies. Write the winner into API-DESIGN.md as the contract — every handler conforms to it and the contract changes only on purpose, never by drift.

## [backend] contract
Follow API-DESIGN.md. REST with real HTTP semantics: correct methods, correct status codes (201 with a Location on create, 204 on delete, 422 for validation, 409 for conflicts, 429 with Retry-After), ETags/conditional requests where they pay off. Validate every input at the boundary and reject early — never trust the client, never persist unvalidated data. Idempotency keys on any unsafe operation that a client might retry (payments, especially). Pagination is cursor-based for anything that grows; every list response carries the same pagination shape. Version the public surface from day one (`/v1`). Auth is checked before work, authorization per resource, and the two failures are distinct: 401 (who are you) vs 403 (you can't). Rate limits return 429 with a reset, not a silent drop. Anything money- or inventory-shaped is never hand-rolled — /ecommerce-kit is the reference for oversell guards, stock holds, and webhook idempotency.

## [backend] errors
This is the identity ingredient — spend real care here. One error envelope, everywhere: a stable machine `code` (not a bare HTTP status), a human `message` written as the fix ("email is already registered — sign in or use a different address", not "duplicate key"), and for validation, a per-field list saying which field and why. The `code` is part of the contract — clients switch on it, so it never changes meaning across versions. Never leak internals (SQL, stack traces, framework noise) — log those server-side with a correlation id the caller can quote to support. Maintain the error catalog from kickoff as the source of truth; a new failure mode gets a catalog entry before it gets a `throw`.

## [testing] checks
The contract gets the checks first: for each endpoint, one runnable check per status-code path — the happy path, the validation failure (assert the error `code` and the offending field), the auth failure (401 vs 403), and the conflict/idempotency path. Test the error envelope shape itself once so every endpoint stays consistent. Boundary-validate with a bad payload and assert nothing persisted. No mocking the thing under test; hit the real handler.

## [stack] tech
Whatever the surrounding project already uses — an API recipe adapts to the stack, it does not import one. Default lean: a typed runtime (TypeScript/Node, or the project's language), schema-validated inputs (a runtime validator, not just compile-time types), migrations checked into the repo, and OpenAPI generated from the same source of truth as validation so docs never drift from behavior. Structured logging with correlation ids. No ORM magic that hides the query when the query is the thing that's slow. Libraries earn their place; the boring, well-understood one beats the clever new one for infrastructure people depend on.
