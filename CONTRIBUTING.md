# Contributing Guide - IA Helper

Thanks for your interest in contributing!

## Ways to contribute

### 1) Report a bug
1. Check existing [Issues](https://github.com/Gohanado/ia-helper/issues)
2. Open a new “Bug Report” with:
   - Clear description
   - Steps to reproduce
   - Expected vs observed behavior
   - Browser + extension version
   - Provider/model used

### 2) Request a feature
1. Open a “Feature Request”
2. Describe the need, proposed solution, use cases, alternatives

### 3) Submit code (PR)
Before coding, open an issue to align. Then:
1. Fork the repo
2. Branch from `main`: `git checkout -b feature/my-feature`
3. Implement + test
4. Commit with a clear message: `git commit -m "feat: add X"`
5. Push to your fork and open a PR

Commit prefixes:
- `feat`: new feature
- `fix`: bug fix
- `docs`: docs only
- `style`: formatting (no code change)
- `refactor`: code refactor
- `test`: add/update tests
- `chore`: maintenance

### 4) Add translations
`src/i18n/translations.js` — copy an existing locale, translate all keys, test the UI.

### 5) Add presets
`src/config/presets.js` — add a block with id, name, description, icon, and actions.

## Rules
1. Clean code; clear names; no dead/commented code
2. No external tracking/deps unless justified
3. Compatibility: Chrome 88+ / Firefox target
4. Tests: run and verify before PR

## Not accepted
- Tracking/ads or external data collection
- Copied code without attribution
- Malicious behavior

## IP
By contributing, you agree:
- Code is included under IA Helper license
- You may be credited in CONTRIBUTORS.md
- Maintainers may adjust your contribution if needed

## Questions?
- Open an issue with tag `question`
- Email: contact@badom.ch

Thanks for contributing to IA Helper!
