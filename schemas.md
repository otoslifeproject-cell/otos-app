# OTOS NOTION SCHEMAS — CANONICAL DATA CONTRACTS
Version: v1.0
Status: DRAFT → LOCKED AFTER ENFORCER IS GREEN
Owner: Dean Butler
Executor: GitHub Actions only

---

## 0. GLOBAL RULES (APPLY TO ALL DBs)

### 0.1 Property Name Rules
- Property names are CASE-SENSITIVE and IMMUTABLE after lock.
- Never rename properties (renames break API calls).
- Never create “duplicate meaning” properties (e.g., Body + Content + Text).

### 0.2 Required Standard Properties (Where Applicable)
- **Name** (title) — always present
- **CreatedAt** (date) — ISO timestamp
- **UpdatedAt** (date) — ISO timestamp (optional)
- **Source** (select) — origin of content
- **Status** (select) — controlled states
- **Tags** (multi_select) — lightweight categorisation

### 0.3 Embedding Storage Standard
If a DB is embedded, it MUST have:
- **Embedding** (rich_text) — JSON string of vector (store as text)
- **EmbeddedAt** (date)
- **EmbedModel** (select)

---

## 1) BRAIN_DB — Canonical Memory (EMBEDDED)
Env Key: `BRAIN_DB`

### Purpose
Long-term canonical memory. Append-only. Embedded for semantic recall.

### Required Properties
- **Name** (title)
- **Text** (rich_text) — canonical content to embed
- **Source** (select) — {manual, feeder, doc, pdf, meeting, web, system}
- **Tags** (multi_select)
- **Status** (select) — {new, embedded, archived}
- **CreatedAt** (date)
- **Embedding** (rich_text) — vector JSON
- **EmbeddedAt** (date)
- **EmbedModel** (select)

---

## 2) CORE_DB — System Rules / Kernel
Env Key: `CORE_DB`

### Purpose
Hard rules, governance, contracts, golden statements, hardlogs.

### Required Properties
- **Name** (title)
- **Type** (select) — {rule, contract, decision, golden, policy, error_log}
- **Text** (rich_text)
- **Scope** (select) — {global, ui, feeder, nhs, governance, marketing, devops}
- **Status** (select) — {draft, locked, deprecated}
- **CreatedAt** (date)
- **Version** (rich_text)

---

## 3) OPS_DB — Operations / Tasks / Run States
Env Key: `OPS_DB`

### Purpose
Operational tasks, run tracking, deployments, audit of “what happened”.

### Required Properties
- **Name** (title)
- **Owner** (select) — {Dean, AI}
- **Type** (select) — {task, run, deploy, checklist}
- **Status** (select) — {todo, doing, blocked, done}
- **Priority** (select) — {p0, p1, p2, p3}
- **Notes** (rich_text)
- **CreatedAt** (date)
- **DueAt** (date) (optional)
- **Link** (url) (optional)

---

## 4) INTAKE_FEEDER_DB — Raw Ingest Queue (NOT EMBEDDED DIRECTLY)
Env Key: `INTAKE_FEEDER_DB` (or `OTOS_INTAKE_FEEDER_DB` depending on repo)

### Purpose
Raw unstructured incoming content. This is where Andy/Feeder writes first.
A separate process promotes to Brain.

### Required Properties
- **Name** (title)
- **Content** (rich_text) — raw payload
- **Source** (select) — {manual, andy, upload, youtube, audio, web}
- **Status** (select) — {new, triaged, promoted, rejected}
- **CreatedAt** (date)
- **AttachmentURL** (url) (optional)
- **Meta** (rich_text) (optional)

---

## 5) EVENTS_DB — System Events / Telemetry (FUTURE)
Env Key: `EVENTS_DB`

### Purpose
Immutable events: each workflow run, promotion, embed, error, decision.

### Required Properties
- **Name** (title)
- **EventType** (select) — {run, embed, promote, error, decision}
- **Text** (rich_text)
- **CreatedAt** (date)
- **RefID** (rich_text) (optional)
- **Link** (url) (optional)

---

## 6) ERRORS_DB — Incident Log (FUTURE)
Env Key: `ERRORS_DB`

### Purpose
Hard, time-ordered record of failures & resolutions. Never deleted.

### Required Properties
- **Name** (title)
- **Severity** (select) — {p0, p1, p2, p3}
- **System** (select) — {github, notion, openai, ui, feeder}
- **Text** (rich_text)
- **Resolution** (rich_text) (optional)
- **CreatedAt** (date)
- **Status** (select) — {open, mitigated, closed}

---

END OF SCHEMAS
