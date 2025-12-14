
Reverse flow is **forbidden**.

---

## 6. FAILURE BEHAVIOUR

On ANY error:
1. Stop execution
2. Log error (no retries unless specified)
3. Do NOT guess
4. Do NOT self-heal without script

---

## 7. AGENT BOUNDARIES (IMPORTANT)

Agents:
- Cannot define schemas
- Cannot rename properties
- Cannot create databases

Agents may:
- Read approved DBs
- Append records
- Reference IDs

---

## 8. CHANGE CONTROL

Any change requires:
- New commit
- Explicit script
- Human-run execution

No silent upgrades.
No background mutation.

---

## 9. VERSIONING

This environment is:
- Versioned
- Auditable
- Deterministic

Any violation is a **critical failure**.

---

END OF CONTRACT
