# Contributing to InvoicePro

Thank you for contributing to InvoicePro. This document describes the required workflows, coding standards, testing requirements and security practices to ensure a high-quality, maintainable project.

## 1. How to contribute

- Fork the repository and create a feature branch from `main` named using the convention: `feat/<short-description>` or `fix/<short-description>`.
- Open a Pull Request (PR) against `main` with a clear description and link to any relevant issue.
- All PRs must include at least one reviewer and pass CI checks before merge.

## 2. Branching and commits

- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`.
- Keep commits small and focused.
- Rebase rather than merge to keep history linear when updating your branch.

## 3. Code style and linters

- This project uses an EditorConfig at the repository root. Respect indentation and file conventions.
- JavaScript/TypeScript code should follow recommended ESLint rules configured in the repo.
- Run `npm run lint` and fix issues before opening a PR.

## 4. Tests

- Unit tests and integration tests are required for new features affecting business logic.
- End-to-end tests (Playwright) are required for critical user flows (auth, invoice creation, payments).
- Add tests under `tests/` or the framework-specific folder.
- CI must run tests; PRs must have green test checks.

## 5. CI / CD

- GitHub Actions runs build, lint, tests and secret scanning on PRs.
- Do not disable critical checks without explicit approval.

## 6. Secrets and credentials

- Never commit secrets, API keys, service account keys, or private certificates to the repository.
- Use environment variables and the platform secret store (Vercel, GitHub Actions secrets, Supabase project secrets).
- If a secret is accidentally committed, rotate it immediately and follow the incident checklist in `docs/`.

## 7. Security

- Follow least-privilege principles for service accounts and database roles.
- Enable Row Level Security (RLS) where appropriate and test RLS policies with dedicated test accounts.
- Run dependency vulnerability scans regularly and patch critical vulnerabilities promptly.

## 8. Pull Request checklist

- [ ] Linted and formatted
- [ ] Unit tests added/updated and passing
- [ ] E2E tests added/updated where applicable
- [ ] No secrets in code or logs
- [ ] Linked to issue or roadmap item
- [ ] Approvals obtained from required reviewers

## 9. Releases

- Use semantic versioning and create release notes for each public release.
- Tag releases in Git and update the changelog.

## 10. Communication

- Use issues to discuss design decisions and large changes before implementing.
- For urgent security incidents, follow the incident response procedure in `docs/SECURITY.md`.

## 11. Contacts

- Maintainers: listed in `MAINTAINERS.md` or on the repository settings.

Thank you for helping keep InvoicePro secure, consistent and high-quality.