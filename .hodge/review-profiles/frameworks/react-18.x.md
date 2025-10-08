---
frontmatter_version: "1.0.0"
scope: reusable
type: framework
framework: react
applies_to:
  - "**/*.jsx"
  - "**/*.tsx"
version: "1.0.0"
maintained_by: hodge-framework
detection:
  dependencies: ["react"]
  version_range: ">=18.0.0 <19.0.0"
---

# React 18.x Best Practices

Modern React best practices for version 18.x, focusing on functional components, hooks, concurrent features, and performance optimization.

---

## Component Style
**Enforcement: SUGGESTED** | **Severity: WARNING**

Use functional components with hooks over class components. Class components are legacy - only use for existing code or error boundaries (until React adds error boundary hook). Keep components small and focused following Single Responsibility Principle.

**Guidance**: Functional components are simpler, have better TypeScript support, and enable hooks. Flag new class components as warnings. Extract complex components into smaller focused components. Component should have one clear purpose - rendering user profile, not "handling all user data operations".

---

## Hooks Best Practices
**Enforcement: SUGGESTED** | **Severity: WARNING**

Follow the Rules of Hooks: only call hooks at top level (not in conditions, loops, or nested functions), always specify dependency arrays for `useEffect`/`useMemo`/`useCallback`, and don't lie about dependencies - include all values from component scope that are used inside.

**Guidance**: React relies on hook call order - conditional hooks break this. Missing dependencies cause stale closures and bugs. React's ESLint plugin catches most violations. Extract complex effects into custom hooks for reusability and testability. Empty dependency array `[]` means "run once on mount" - ensure that's the intent.

---

## State Management Patterns
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Lift state only when needed - avoid premature lifting to parent components. Use Context for truly global/shared state, not for avoiding prop drilling of 2-3 levels. Consider external state libraries (Zustand, Redux) for complex application state. Co-locate state with where it's used when possible.

**Guidance**: State at the right level improves performance and maintainability. Local state (`useState`) is often sufficient. Context re-renders all consumers - use sparingly for truly global data (theme, auth, i18n). Prop drilling through 2-3 levels is fine and explicit. External state management useful when many components need same state or complex updates.

---

## Performance Optimization
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Don't optimize prematurely - React is fast by default. Use `React.memo` for expensive components that re-render often with same props, `useMemo` for expensive calculations, `useCallback` primarily when passing callbacks to memoized children. Profile with React DevTools Profiler before optimizing.

**Guidance**: Most React apps don't need manual optimization. Over-use of memo/useMemo/useCallback adds complexity for marginal gains. Flag excessive memoization in simple components. Optimize when profiling shows actual performance issues, not preemptively. Common real issues: large lists (virtualize), expensive renders (memoize), unnecessary re-renders (check state updates).

---

## Component Composition
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Prefer composition over prop drilling and complex configurations. Use `children` prop for flexible layouts and content injection. Extract reusable logic into custom hooks, not Higher-Order Components. Render props still useful for specific cases requiring render control.

**Guidance**: Composition is React's super power. `<Card><Header/><Body/></Card>` is more flexible than `<Card header={...} body={...}/>`. Custom hooks extract stateful logic while HOCs are legacy pattern. Render props useful when child needs to control rendering (react-query, formik patterns). Keep component trees shallow when possible.

---

## Error Handling
**Enforcement: SUGGESTED** | **Severity: WARNING**

Use Error Boundaries for component tree errors - wrap top-level routes or complex features. Error boundaries can't catch errors in event handlers, async code, or server-side rendering - handle these with try/catch. Provide user-friendly fallback UI for error states.

**Guidance**: Error boundaries prevent entire app crashes from one component bug. Place strategically - too high gives generic errors, too low duplicates code. Event handlers and async code need manual try/catch. Always show user actionable error messages ("Try again" button, not stack traces). Reference general coding standards for error handling patterns.

---

## Concurrent Features (React 18)
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Leverage React 18 concurrent features when appropriate. Use `Suspense` for data fetching with compatible libraries (React Query, Relay), `startTransition` for marking non-urgent updates, `useDeferredValue` for expensive computations based on input. Understand automatic batching now applies everywhere (not just event handlers).

**Guidance**: Concurrent features improve UX by keeping UI responsive during expensive operations. Suspense requires data fetching library support - don't build custom implementation. `startTransition` useful for search filters, tab switches where immediate feedback less critical. Automatic batching means fewer re-renders by default (improvement over React 17). These features are opt-in - use when they solve specific problems.

---
