# Spec Alignment Tracker

## Status Legend
- `pending` - Not yet reviewed
- `fixing` - Currently being aligned (fixes were made this round)
- `no fixes` - Checked and nothing to fix

## Status Update Rules
**IMPORTANT:** Only change status to `no fixes` if NO work was done (no edits, no commits).

- If you made ANY changes/commits this round → keep as `fixing`
- If you reviewed and found nothing to fix → mark as `no fixes`

The next run of the alignment prompt will verify `fixing` specs and mark them `no fixes` if no further changes are needed.

## Scenario Specs

| Spec | Status | Notes |
|------|--------|-------|
| 06-scenario-1-simple-payment.md | no fixes | Verified against reference specs |
| 07-scenario-2-lightning-address.md | no fixes | Verified: imports, file structure, types consistent |
| 08-scenario-3-notifications.md | fixing | |
| 09-scenario-4-hold-invoice.md | pending | |
| 10-scenario-5-proof-of-payment.md | pending | |
| 11-scenario-6-transaction-history.md | pending | |
| 12-scenario-7-nostr-zap.md | pending | |
| 13-scenario-8-fiat-conversion.md | pending | |

## Reference Documents
- PRD.md
- specs/00-overview.md
- specs/01-project-setup.md
- specs/02-shared-types.md
- specs/03-shared-components.md
- specs/04-wallet-context.md
- specs/05-layout.md
- specs/14-backend.md
- specs/15-testing-strategy.md
