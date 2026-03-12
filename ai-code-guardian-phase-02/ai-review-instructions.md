# AI Code Review Instructions (Base Knowledge Base)

## General Guidelines
- Focus on correctness, security, performance, readability, and maintainability.
- Check for bugs, edge cases, null/undefined handling, and logical errors.
- Ensure compliance with company standards (e.g., no hard-coded secrets).

## Language-Specific Rules
### JavaScript/TypeScript
- Use `const` or `let` instead of `var`.
- Prefer arrow functions for callbacks.
- Add try/catch in async functions.
- No `console.log` in production code—use logging libraries.
- Max function length: 50 lines.
- Enforce ESLint/TSLint rules.

### Python
- Follow PEP 8 style.
- Use type hints where possible.
- Avoid global variables.
- Handle exceptions properly.

## Security Checks
- Scan for SQL injection, XSS, and insecure dependencies.
- Ensure API keys/secrets are not committed.

## Performance
- Avoid N+1 queries.
- Optimize loops and data structures.

Add more sections as needed—keep it in bullets for easy reading.