# Decision for HODGE-143

**Date**: 2025-09-20
**Time**: 1:50:20 PM

## Decision
Tests must NEVER modify the Hodge project's own .hodge directory - all tests should use temporary directories or mocks to avoid altering project state

## Status
This decision has been recorded in the main decisions file.
