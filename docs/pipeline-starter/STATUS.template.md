# <PROJECT> — STATUS (save filled-in as `STATUS.md`; the durable cold-resume file)

_The machine-readable resume. A cold agent reads `CLAUDE.md` (the rules) then THIS (the state) and
can continue without archaeology. Update after EVERY slice — pattern: write → persist → notify.
Format proven by project-mmo's scorecards + deceive-me-daddy's STATUS.md._

## Last known-green gate
- Date/commit: <sha> · typecheck ✅ lint ✅ content ✅ build ✅
- **Test counts (per package/suite — record EVERY run so a silent drop is visible):**
  | date | <suite> | <suite> | total |
  |---|---|---|---|
  | <yyyy-mm-dd> | <n> | <n> | <n> |

## Shipped slices (with verification proof)
| Slice | Commit | Gate | Visual/feel verified? | Notes |
|---|---|---|---|---|
| <id — name> | <sha> | ✅ | <lab/screenshot/Director-eyeball / UNVERIFIED-VISUAL> | |

## In flight
| Slice | Builder/owner | Commit model (§6b) | Surface | Started |
|---|---|---|---|---|

## Queued next (ordered)
1. <...>

## Open forks awaiting the Director (resurface EVERY report)
| # | Fork | Default if unanswered | Answer |
|---|---|---|---|

## Review queue (drivable taste items — see TASTE_AND_REVIEW.md §3)
- <item → where to drive it>

## Known incidents → constraints they produced
_When something breaks, the incident gets one line here and (if load-bearing) a new rule in
CLAUDE.md. This is how the contract evolves instead of the same failure recurring._
- <date>: <what broke> → <rule added>

## Contract/wire versions
- Schema/content version: <n> (migrations + golden fixtures through v<n>)
- Deploy: <url> · build stamp of live deploy: <sha>
