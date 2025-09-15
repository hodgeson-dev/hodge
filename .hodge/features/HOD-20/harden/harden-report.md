# Harden Report: HOD-20

## Validation Results
**Date**: 9/14/2025, 6:48:28 PM
**Overall Status**: ❌ FAILED

### Test Results
- **Tests**: ❌ Failed
- **Linting**: ✅ Passed
- **Type Check**: ✅ Passed
- **Build**: ✅ Passed

## Standards Compliance
Standards violations detected. Please fix before shipping.

## Next Steps
❌ Issues need to be resolved:
- Review validation output below
- Fix identified issues
- Run `/harden HOD-20` again

## Detailed Output

### Test Output
```
Command failed: npm test 2>&1

```

### Lint Output
```

> @agile-explorations/hodge@0.1.0-alpha.1 lint
> eslint . --ext .ts,.tsx


/Users/michaelkelly/Projects/hodge/src/commands/build.ts
  84:22  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/commands/decide.ts
  143:57  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/commands/explore.ts
   79:33  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   80:34  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  150:64  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/commands/harden.ts
  70:22  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/commands/init.ts
  226:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  337:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  357:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  477:63  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  720:39  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  792:9   warning  Unnecessary conditional, the types have no overlap                                                         @typescript-eslint/no-unnecessary-condition
  792:31  warning  Unnecessary conditional, the types have no overlap                                                         @typescript-eslint/no-unnecessary-condition

/Users/michaelkelly/Projects/hodge/src/commands/ship.ts
  150:43  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  187:15  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  207:32  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition

/Users/michaelkelly/Projects/hodge/src/commands/status.ts
  114:47  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  115:47  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  150:55  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  177:48  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/commands/todos.ts
  13:33  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/detection.ts
  188:11  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  297:34  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  377:40  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  378:43  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  426:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  426:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  427:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  427:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  428:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  428:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  481:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  481:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  482:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  482:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  483:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  483:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  484:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  484:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  485:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  485:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain

/Users/michaelkelly/Projects/hodge/src/lib/pm/base-adapter.ts
  20:46  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  47:35  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  68:32  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/pm/conventions.ts
  137:12  warning  Unnecessary conditional, value is always truthy  @typescript-eslint/no-unnecessary-condition

/Users/michaelkelly/Projects/hodge/src/lib/pm/env-validator.ts
  26:40  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  34:8   warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  85:52  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/pm/index.ts
  67:8   warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  73:40  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/pm/linear-adapter.ts
   47:40  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   75:40  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   83:48  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  129:44  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  170:47  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  195:12  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition

/Users/michaelkelly/Projects/hodge/src/lib/structure-generator.ts
  173:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  292:55  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

✖ 58 problems (0 errors, 58 warnings)


```

### Type Check Output
```

> @agile-explorations/hodge@0.1.0-alpha.1 typecheck
> tsc -p tsconfig.build.json --noEmit


```

### Build Output
```

> @agile-explorations/hodge@0.1.0-alpha.1 build
> tsc -p tsconfig.build.json && cp package.json dist/


```
