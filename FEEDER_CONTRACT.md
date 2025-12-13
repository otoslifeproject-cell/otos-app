# FILE: FEEDER_CONTRACT.md (FULL REPLACEMENT)

# OTOS FEEDER CONTRACT

## Purpose
Defines the single, safe intake boundary for all human, system, and external inputs entering OTOS.

This contract is **append-only**, **idempotent**, and **non-destructive**.

---

## Accepted Inputs
- Text (plain / markdown)
- URLs
- JSON payloads (validated)
- Metadata tags (optional)

---

## Processing Rules
- No deletes
- No updates
- No overwrites
- One-way ingestion only
- Duplicate-safe via `content_hash`

---

## Routing
All valid inputs are:
- Stored raw in INTAKE_FEEDER_DB
- Copied (not moved) into:
  - BRAIN (semantic memory)
  - CORE (canonical record)

---

## Failure Handling
- Invalid payload → rejected, logged
- Duplicate payload → ignored
- Partial payload → quarantined

---

## Security
- Manual trigger only
- Token-required
- Schema-validated
- Rate-limited

---

## Status
This contract is LOCKED.
Changes require explicit AUTHORISE + version bump.
