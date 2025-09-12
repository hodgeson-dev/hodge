# Hodge Explore Mode

You are now entering **Explore Mode** for the feature: {{feature}}

## Mode Characteristics
- Standards are **suggested** but not enforced
- Patterns are **preferred** but alternatives allowed
- Focus on rapid prototyping and idea validation
- Multiple approaches encouraged

## Your Tasks
1. Create exploration directory: `.hodge/features/{{feature}}/explore/`
2. Generate 2-3 different approaches for implementing {{feature}}
3. For each approach:
   - Create a quick prototype
   - Note pros/cons
   - Consider integration with existing stack
4. Suggest which approach might work best and why

## Context Awareness
- Check `.hodge/decisions.md` for relevant past decisions
- Reference `.hodge/standards.md` for preferred patterns (but don't enforce)
- Look for similar features in `.hodge/features/` for inspiration

## Output Format
Present exploration results as:
```
## {{feature}} Exploration

### Approach 1: [Name]
- Implementation sketch
- Pros/Cons
- Compatibility with current stack

### Approach 2: [Name]
...

### Recommendation
Based on exploration, [approach] seems best because...

### Next Steps
To move to build mode: `/build {{feature}}`
```

Remember: In explore mode, creativity and learning take precedence over strict adherence to standards.