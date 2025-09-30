# Harden Report: HODGE-305

## Validation Results
**Date**: 9/29/2025, 11:17:48 PM
**Overall Status**: ❌ FAILED

### Test Results
- **Tests**: ❌ Failed
- **Linting**: ✅ Passed
- **Type Check**: ✅ Passed
- **Build**: ✅ Passed

## Standards Compliance
Standards violations detected. Please fix before shipping.

## Performance
Validations were run in parallel for optimal performance.

## Next Steps
❌ Issues need to be resolved:
- Review validation output below
- Fix identified issues
- Run `/harden HODGE-305` again

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
  129:23  warning  Variable name `_standards` must match one of the following formats: camelCase, PascalCase                  @typescript-eslint/naming-convention
  187:24  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  201:78  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  214:11  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition

/Users/michaelkelly/Projects/hodge/src/commands/context.ts
   38:30  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   86:82  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  176:42  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  297:38  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  298:32  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  299:42  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  300:60  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  300:81  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/commands/decide.ts
   14:30  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  156:57  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/commands/explore.ts
   77:32  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   89:25  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  200:76  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  298:27  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  394:47  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  512:21  warning  Unnecessary conditional, expected left-hand side of `??` operator to be possibly null or undefined         @typescript-eslint/no-unnecessary-condition
  513:17  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  514:16  warning  Unnecessary conditional, expected left-hand side of `??` operator to be possibly null or undefined         @typescript-eslint/no-unnecessary-condition
  640:43  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  641:49  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  646:36  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  646:61  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  647:41  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/commands/init.ts
  233:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  345:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  365:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  485:63  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  728:39  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  800:9   warning  Unnecessary conditional, the types have no overlap                                                         @typescript-eslint/no-unnecessary-condition
  800:31  warning  Unnecessary conditional, the types have no overlap                                                         @typescript-eslint/no-unnecessary-condition

/Users/michaelkelly/Projects/hodge/src/commands/load.ts
   41:26  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   56:36  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   57:52  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   66:11  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  138:50  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  139:46  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  140:45  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  141:35  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/commands/logs.ts
  183:22  warning  Unnecessary conditional, expected left-hand side of `??` operator to be possibly null or undefined  @typescript-eslint/no-unnecessary-condition
  185:19  warning  Unnecessary conditional, expected left-hand side of `??` operator to be possibly null or undefined  @typescript-eslint/no-unnecessary-condition

/Users/michaelkelly/Projects/hodge/src/commands/plan.ts
   42:30  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   53:45  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
   54:78  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   56:37  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   59:37  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   99:37  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  309:54  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  326:53  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  354:11  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  360:11  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  366:11  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  396:58  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  466:55  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/commands/save.ts
  29:29  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  33:28  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  35:52  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  94:40  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/commands/ship.ts
   357:53  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   362:35  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   494:15  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
   511:32  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
   611:29  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   692:33  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   731:34  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   776:36  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   788:35  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   827:38  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   981:65  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  1015:17  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/commands/status.ts
  128:47  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  129:47  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  164:55  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  191:48  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/commands/todos.ts
  13:33  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/auto-save.ts
  88:55  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/cache-manager.ts
  95:10  warning  Unnecessary conditional, value is always falsy  @typescript-eslint/no-unnecessary-condition

/Users/michaelkelly/Projects/hodge/src/lib/config-manager.ts
   80:27  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  153:29  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  158:27  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  159:41  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  235:25  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  241:41  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  285:30  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  293:60  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  303:34  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  311:31  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/context-manager.ts
   45:30  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   80:36  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   84:23  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  163:44  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  203:29  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/detection.ts
  195:11  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  304:34  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  386:40  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  387:43  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  435:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  435:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  436:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  436:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  437:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  437:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  490:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  490:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  491:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  491:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  492:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  492:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  493:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  493:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain
  494:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  494:13  warning  Prefer using an optional chain expression instead, as it's more concise and easier to read                 @typescript-eslint/prefer-optional-chain

/Users/michaelkelly/Projects/hodge/src/lib/environment-detector.ts
  179:36  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  180:31  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  191:43  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  192:31  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  203:38  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  204:36  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  215:36  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  216:30  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  217:34  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  229:32  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/feature-populator.ts
  52:42  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/git-utils.ts
  157:33  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  158:33  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/hodge-md-generator.ts
   68:24  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  381:68  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/id-manager.ts
  107:14  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  112:53  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  136:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  224:13  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  342:55  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  361:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  390:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  432:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  453:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  458:12  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition
  469:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  472:65  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  486:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition

/Users/michaelkelly/Projects/hodge/src/lib/pattern-learner.ts
  541:14  warning  Unnecessary conditional, value is always falsy  @typescript-eslint/no-unnecessary-condition

/Users/michaelkelly/Projects/hodge/src/lib/pm-manager.ts
  104:35  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

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

/Users/michaelkelly/Projects/hodge/src/lib/pm/github-adapter.ts
  116:33  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  149:33  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  172:25  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  227:33  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  340:35  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  382:37  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  407:40  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

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

/Users/michaelkelly/Projects/hodge/src/lib/pm/local-pm-adapter.ts
   44:27  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   47:30  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  170:22  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  277:62  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  278:62  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  473:46  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  538:12  warning  Unnecessary conditional, value is always truthy                                                            @typescript-eslint/no-unnecessary-condition

/Users/michaelkelly/Projects/hodge/src/lib/pm/pm-hooks.ts
  256:60  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  282:38  warning  Unnecessary conditional, both sides of the expression are literal values                                   @typescript-eslint/no-unnecessary-condition
  283:32  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  283:54  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  364:50  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  409:54  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  520:52  warning  Unnecessary conditional, both sides of the expression are literal values                                   @typescript-eslint/no-unnecessary-condition
  524:32  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/save-manager.ts
   74:22  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  101:26  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  283:38  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  284:34  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  284:54  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  285:44  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  285:71  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  316:72  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  369:32  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/session-manager.ts
   43:31  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   43:51  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   44:25  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   44:42  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   45:45  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   45:72  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   46:47  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   46:75  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   47:31  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   48:37  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
   98:46  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing
  108:48  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/lib/structure-generator.ts
  177:10  warning  Unnecessary conditional, value is always falsy                                                             @typescript-eslint/no-unnecessary-condition
  284:36  warning  Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator  @typescript-eslint/prefer-nullish-coalescing

/Users/michaelkelly/Projects/hodge/src/test/mocks.ts
   29:45  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
   33:61  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
   36:58  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
   39:44  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
   43:43  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
   47:62  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
   50:55  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
   69:33  warning  Unsafe return of an `any` typed value                                                                                                                                                          @typescript-eslint/no-unsafe-return
   73:26  warning  Unsafe return of an `any` typed value                                                                                                                                                          @typescript-eslint/no-unsafe-return
   74:13  warning  Unsafe assignment of an `any` value                                                                                                                                                            @typescript-eslint/no-unsafe-assignment
   76:7   warning  Unsafe return of an `any` typed value                                                                                                                                                          @typescript-eslint/no-unsafe-return
   84:26  warning  Unsafe argument of type `any` assigned to a parameter of type `string`                                                                                                                         @typescript-eslint/no-unsafe-argument
  164:26  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
  165:41  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
  165:44  warning  Unsafe return of an `any` typed value                                                                                                                                                          @typescript-eslint/no-unsafe-return
  166:42  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
  169:7   warning  Unsafe return of an `any` typed value                                                                                                                                                          @typescript-eslint/no-unsafe-return
  171:54  warning  Async arrow function has no 'await' expression                                                                                                                                                 @typescript-eslint/require-await
  172:13  warning  Unsafe assignment of an `any` value                                                                                                                                                            @typescript-eslint/no-unsafe-assignment
  174:13  warning  Unsafe assignment of an `any` value                                                                                                                                                            @typescript-eslint/no-unsafe-assignment
  176:7   warning  Unsafe return of an `any` typed value                                                                                                                                                          @typescript-eslint/no-unsafe-return
  207:22  warning  Unsafe argument of type `any` assigned to a parameter of type `{ exists?: boolean | undefined; content?: string | undefined; files?: string[] | undefined; throwOn?: string[] | undefined; }`  @typescript-eslint/no-unsafe-argument
  207:30  warning  Unsafe member access .fs on an `any` value                                                                                                                                                     @typescript-eslint/no-unsafe-member-access
  208:28  warning  Unsafe argument of type `any` assigned to a parameter of type `{ hits?: Map<string, any> | undefined; ttl?: number | undefined; }`                                                             @typescript-eslint/no-unsafe-argument
  208:36  warning  Unsafe member access .cache on an `any` value                                                                                                                                                  @typescript-eslint/no-unsafe-member-access
  210:24  warning  Unsafe argument of type `any` assigned to a parameter of type `{ branch?: string | undefined; files?: string[] | undefined; status?: string | undefined; remote?: string | undefined; }`       @typescript-eslint/no-unsafe-argument
  210:32  warning  Unsafe member access .git on an `any` value                                                                                                                                                    @typescript-eslint/no-unsafe-member-access
  211:22  warning  Unsafe argument of type `any` assigned to a parameter of type `{ issues?: Map<string, any> | undefined; canConnect?: boolean | undefined; }`                                                   @typescript-eslint/no-unsafe-argument
  211:30  warning  Unsafe member access .pm on an `any` value                                                                                                                                                     @typescript-eslint/no-unsafe-member-access

/Users/michaelkelly/Projects/hodge/src/test/runners.ts
   33:7   warning  Unsafe assignment of an `any` value                                                                                                                                    @typescript-eslint/no-unsafe-assignment
   48:7   warning  Unsafe assignment of an `any` value                                                                                                                                    @typescript-eslint/no-unsafe-assignment
   49:7   warning  Unsafe assignment of an `any` value                                                                                                                                    @typescript-eslint/no-unsafe-assignment
   50:7   warning  Unsafe assignment of an `any` value                                                                                                                                    @typescript-eslint/no-unsafe-assignment
   51:7   warning  Unsafe assignment of an `any` value                                                                                                                                    @typescript-eslint/no-unsafe-assignment
   60:26  warning  Unsafe argument of type `any` assigned to a parameter of type `{ cwd?: string | undefined; env?: Record<string, string> | undefined; timeout?: number | undefined; }`  @typescript-eslint/no-unsafe-argument
   68:50  warning  Unsafe argument of type `any` assigned to a parameter of type `{ cwd?: string | undefined; env?: Record<string, string> | undefined; timeout?: number | undefined; }`  @typescript-eslint/no-unsafe-argument
   75:61  warning  Unsafe argument of type `any` assigned to a parameter of type `{ cwd?: string | undefined; env?: Record<string, string> | undefined; timeout?: number | undefined; }`  @typescript-eslint/no-unsafe-argument
  235:17  warning  Unsafe array destructuring of an `any` array value                                                                                                                     @typescript-eslint/no-unsafe-assignment
  236:17  warning  Unsafe argument of type `any` assigned to a parameter of type `number`                                                                                                 @typescript-eslint/no-unsafe-argument
  236:23  warning  Unsafe argument of type `any` assigned to a parameter of type `number`                                                                                                 @typescript-eslint/no-unsafe-argument
  236:29  warning  Unsafe argument of type `any` assigned to a parameter of type `number | undefined`                                                                                     @typescript-eslint/no-unsafe-argument
  236:35  warning  Unsafe argument of type `any` assigned to a parameter of type `number | undefined`                                                                                     @typescript-eslint/no-unsafe-argument
  236:41  warning  Unsafe argument of type `any` assigned to a parameter of type `number | undefined`                                                                                     @typescript-eslint/no-unsafe-argument
  236:47  warning  Unsafe argument of type `any` assigned to a parameter of type `number | undefined`                                                                                     @typescript-eslint/no-unsafe-argument
  236:53  warning  Unsafe argument of type `any` assigned to a parameter of type `number | undefined`                                                                                     @typescript-eslint/no-unsafe-argument

✖ 250 problems (0 errors, 250 warnings)


```

### Type Check Output
```

> @agile-explorations/hodge@0.1.0-alpha.1 typecheck
> tsc -p tsconfig.build.json --noEmit


```

### Build Output
```

> @agile-explorations/hodge@0.1.0-alpha.1 build
> npm run sync:commands && tsc -p tsconfig.build.json && cp package.json dist/ && cp -r src/templates dist/src/


> @agile-explorations/hodge@0.1.0-alpha.1 sync:commands
> node scripts/sync-claude-commands.js

🔄 Syncing Claude slash commands...
📖 Found 11 command files
  ✓ build
  ✓ decide
  ✓ explore
  ✓ harden
  ✓ hodge
  ✓ load
  ✓ plan
  ✓ review
  ✓ save
  ✓ ship
  ✓ status
✨ Formatted generated file with Prettier
✅ Successfully synced 11 commands to /Users/michaelkelly/Projects/hodge/src/lib/claude-commands.ts
📝 Remember to commit the updated claude-commands.ts file

```
