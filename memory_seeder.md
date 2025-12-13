# FILE: MEMORY_SEEDER.md (FULL REPLACEMENT)

## Memory Seeder (BRAIN / CORE)

### What it does
- Writes historical conversations into Notion
- Splits records:
  - `type=core` → CORE DB
  - everything else → BRAIN DB
- Idempotent (no duplicates)
- Manual trigger only

### Local run
