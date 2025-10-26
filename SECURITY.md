# Security Policy

## Supported Versions

Hodge is currently in **alpha development**. Security updates will be provided for the latest alpha release.

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x-alpha   | :white_check_mark: |
| < 0.1.0 | :x:                |

Once Hodge reaches stable 1.0.0, we will maintain security support for:
- Latest major version
- Previous major version (for 6 months after new major release)

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow responsible disclosure:

### How to Report

**Email:** [security@hodgeson.dev](mailto:security@hodgeson.dev)

**Please include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

### What to Expect

- **Acknowledgment:** Within 48 hours
- **Initial Assessment:** Within 1 week
- **Status Updates:** Every week until resolved
- **Resolution:** Varies by severity
  - **Critical:** Patch within 7 days
  - **High:** Patch within 30 days
  - **Medium:** Patch within 90 days
  - **Low:** Addressed in next release

### Disclosure Policy

- Report vulnerabilities privately first (email above)
- Give us reasonable time to fix (see timelines above)
- We'll credit you in release notes (unless you prefer anonymity)
- Public disclosure after patch is released and users have had time to update

### Security Best Practices

For users of Hodge:

1. **Keep Updated:** Always use the latest version
2. **Review Dependencies:** Hodge integrates with PM tools (Linear, GitHub, Jira) - ensure your tokens/credentials are properly secured
3. **Environment Variables:** Never commit `.env` files with API keys
4. **PM Credentials:** Store PM tool API keys securely (environment variables, not hardcoded)

### Known Security Considerations

As an alpha project, be aware:

- **API Tokens:** Hodge uses PM tool API tokens (Linear, GitHub, etc.). Treat these as sensitive credentials
- **File System Access:** Hodge writes to `.hodge/` directory - ensure proper permissions
- **Git Integration:** Hodge interacts with Git - review commits before pushing
- **Script Execution:** PM scripts in `.hodge/pm-scripts/` execute in your environment - review before use

## Security Updates

Security patches will be announced via:
- GitHub Security Advisories
- Release notes in [CHANGELOG.md](./CHANGELOG.md)
- NPM package updates

Subscribe to repository releases to stay informed.

---

**Questions?** Contact [security@hodgeson.dev](mailto:security@hodgeson.dev)
