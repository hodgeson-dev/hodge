# Feature Decisions: HODGE-318

This file tracks decisions specific to HODGE-318.

## Decisions

<!-- Add your decisions below -->

### 2025-10-02 - Use ESM Migration + Drop Node 18

**Status**: Accepted

**Context**:
Feature: HODGE-318

**Decision**:
Use ESM Migration + Drop Node 18.x Support approach - migrate to native ESM with "type": "module" and "module": "NodeNext" in configs, update package.json engines to require Node >=20.0.0, remove Node 18.x from CI workflow matrix, provides clean modern foundations for initial release and avoids supporting EOL version (18.x EOL April 2025)

**Rationale**:
Recorded via `hodge decide` command at 4:35:35 PM

**Consequences**:
To be determined based on implementation.

---


