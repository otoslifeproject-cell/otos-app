# OTOS — PARENT NODE LOCK (v2.0)
**Status:** ACTIVE / HARD-LOCKED  
**Scope:** All OTOS workstreams, UI layers, docs, scripts, automations  
**Authority:** Human (Dean) is final write-gate.  
**Language:** UK English only.

---

## 0) The Rule
We do not “iterate by accident”.

From this point forward:
- No speculative restructuring.
- No “reimagined” UI.
- No drifting away from the last agreed locked layer/version.
- No changing multiple things at once.
- No touching unrelated parts of the UI when making a single change.

If a change request is ambiguous, we do **not** proceed. We stop and return a **Y/N x10** decision list (your “rapid” mode) or a single clarification question.

---

## 1) Parent Node Definition
**Parent Node = the authoritative control layer**.
It controls:
- Memory anchoring (what is “true”)
- Version locks (what is “current”)
- Write-gates (what can be edited)
- Change control (how edits are approved)
- Audit trail (what changed, when, why)

All child windows/nodes are subordinate and must not override Parent Node truth.

---

## 2) Non-Drift Guardrails (Hard Rules)
### 2.1 No Speculative Reconstruction
If a canonical version exists, we use it verbatim.
We never generate a “new outline” or “fresh layout” unless explicitly authorised with:
**AUTHORISE: NEW STRUCTURE**

### 2.2 Single-Objective Execution
Each task must have one objective and one output.
Example: “Fix logo size” must not trigger layout changes, CSS refactors, or text edits.

### 2.3 Full Replacement Only (No Patches)
When code/docs are requested, output must be:
- One complete copy–paste replacement file
- Version-labelled
- Idempotent (safe to reapply)

No “edit these 3 lines” instructions.

---

## 3) Memory Contract (Truth Sources)
Because chat memory can drift or saturate, we use **external, visible truth**.

### 3.1 Canonical Truth Locations
The following are treated as authoritative:
1) **GitHub Repo (this repo)** — locked files + version tags  
2) **Notion Databases** (once wired) — live memory tables with IDs + audit fields  
3) **Kernel / Golden Statements Bank** — curated truth statements, referenced by ID/tag  
4) **Exports** — user-provided export archives (treated as evidence snapshots)

### 3.2 What “Memory Wired” Means
Memory is considered “wired” only when:
- There is a **single canonical memory store** (Notion DBs) with fixed IDs
- GitHub contains the **Parent Node Lock** (this file) + version locks
- Every “Layer” file has a locked baseline and change-control process
- Changes require a write-gate approval (explicit AUTHORISE)

Until then: **no broad UI refactors**.

---

## 4) Version Lock System (UI Layers)
### 4.1 The Locked Baseline
The locked baseline must be explicitly named (example):
- `Layer_9C` = LAST SAFE VISUAL BASELINE (LOCKED)

No file replaces Layer_9C unless:
- Change request is stated
- Output is a full replacement file
- The change is isolated and verified

### 4.2 Allowed Movement
We only move forward like this:
- LOCK baseline → APPLY one change → VERIFY → LOCK new version
This prevents “logo side-quests” from breaking the UI.

### 4.3 Required Version Header
Every locked HTML file must start with:

<!--
OTOS UI LAYER: 9C
STATUS: LOCKED
LAST CHANGE: YYYY-MM-DD
CHANGE SUMMARY: <one line>
APPROVED BY: DEAN
-->

If missing: file is not considered locked.

---

## 5) Change Control (Write-Gates)
### 5.1 Two Gates
**Gate A — Content/Visual Gate**
- Only what you asked for changes.
- Nothing else moves.

**Gate B — Structure Gate**
- Structure changes require explicit authorisation:
  **AUTHORISE: STRUCTURE CHANGE**
- If not present: structure is frozen.

### 5.2 Proof of Non-Drift
When delivering a replacement file, it must include a short “Non-Drift Checklist” at the top comment:
- [x] Top bar unchanged
- [x] Layout grid unchanged
- [x] Only requested element changed
- [x] Paths correct for GitHub Pages

---

## 6) “Stop Work” Conditions
We immediately stop execution if any of the following occurs:
- A request asks for one change but output risks multiple UI moves
- The current baseline file is unknown or not confirmed
- The asset path is uncertain (spaces/case mismatch)
- A new version is being created without explicit authorisation

When stopped: return a “rapid” Y/N list or request the missing baseline file.

---

## 7) Immediate Next Step (THIS IS THE CURRENT PLAN)
We are pausing UI rollout.

Next deliverables (Parent Node wiring only):
1) Create/confirm Notion DB schema for external memory (IDs, fields, audit columns)
2) Define the “Memory Write-Gate” process (who can write, what gets written)
3) Establish the Layer baseline lock (confirm which file is Layer_9C and freeze it)
4) Add a simple “Version Registry” file in GitHub to list locked baselines and dates

No UI visual changes until steps 1–4 are complete.

---

## 8) Ownership
All OTOS / EYE9 / Core 6 source code and documentation © Dean Butler 2025 — All rights reserved.
