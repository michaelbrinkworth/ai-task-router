# GitHub Repository Configuration Guide

## Repository Settings

### About Section

**Description (350 char max):**
```
Intelligent LLM routing library for OpenAI, Anthropic Claude, and AI Badgr. Cost-optimized AI agent router with automatic fallback, streaming support, and built-in cost tracking. Perfect for chatbots, AI workflows, and multi-provider applications. Save 80%+ on AI API costs.
```

**Website:**
```
https://github.com/michaelbrinkworth/ai-task-router#readme
```

**Topics (20 max - Add these in Settings → Topics):**
```
ai
llm
router
openai
anthropic
claude
gpt-4
chatgpt
cost-optimization
ai-agents
typescript
nodejs
streaming
embeddings
chatbot
workflow-automation
n8n
flowise
machine-learning
nlp
```

### Features to Enable

- [x] **Wikis** - For extended documentation
- [x] **Issues** - For bug tracking and feature requests
- [x] **Sponsorships** - Link to GitHub Sponsors
- [x] **Discussions** - For community Q&A
- [x] **Projects** - For roadmap visibility
- [x] **Preserve this repository** - Archive for posterity

### Branch Protection

**main branch:**
- [x] Require pull request reviews before merging
- [x] Require status checks to pass before merging
- [x] Require branches to be up to date before merging
- [x] Include administrators

### Social Preview Image

Create a 1280x640 image with:
- Project name: "AI Task Router"
- Tagline: "Save 80% on AI Costs"
- Key features: Cost Optimization, Auto Fallback, Multi-Provider
- GitHub stars badge
- NPM downloads badge
- Tech stack icons: TypeScript, Node.js, OpenAI, Claude

### Labels

Create these labels for better issue organization:

**Type:**
- `bug` (red) - Something isn't working
- `enhancement` (blue) - New feature or request
- `documentation` (green) - Improvements or additions to documentation
- `question` (purple) - Further information is requested
- `performance` (orange) - Performance improvement

**Priority:**
- `priority: high` (dark red) - High priority
- `priority: medium` (yellow) - Medium priority
- `priority: low` (light gray) - Low priority

**Status:**
- `good first issue` (green) - Good for newcomers
- `help wanted` (blue) - Extra attention is needed
- `wontfix` (white) - This will not be worked on
- `duplicate` (gray) - This issue or pull request already exists

**Providers:**
- `provider: openai` - Related to OpenAI integration
- `provider: anthropic` - Related to Anthropic integration
- `provider: aibadgr` - Related to AI Badgr integration

**Area:**
- `area: routing` - Routing logic
- `area: cost-tracking` - Cost estimation
- `area: fallback` - Fallback handling
- `area: streaming` - Streaming responses
- `area: types` - TypeScript types

## GitHub Actions Workflows

### NPM Publish (on release)
```yaml
name: Publish to NPM
on:
  release:
    types: [published]
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
```

### CI/CD
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
```

### Auto-label PRs
```yaml
name: Label PRs
on:
  pull_request:
    types: [opened]
jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/labeler@v4
```

## Issue Templates

### Bug Report (.github/ISSUE_TEMPLATE/bug_report.md)
```markdown
---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Configure router with '...'
2. Call method '...'
3. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Code Example**
```javascript
// Minimal code example that reproduces the issue
```

**Environment:**
 - OS: [e.g. macOS, Linux, Windows]
 - Node version: [e.g. 18.0.0]
 - Package version: [e.g. 0.1.1]
 - Provider: [e.g. OpenAI, Anthropic, AI Badgr]

**Additional context**
Add any other context about the problem here.
```

### Feature Request (.github/ISSUE_TEMPLATE/feature_request.md)
```markdown
---
name: Feature request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Use Case**
Describe how this feature would be used in a real application.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## Pull Request Template (.github/pull_request_template.md)
```markdown
## Description
Please include a summary of the changes and which issue is fixed.

Fixes # (issue)

## Type of change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Please describe the tests that you ran to verify your changes.

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing performed

## Checklist:
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published
```

## Security Policy (.github/SECURITY.md)
```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please send an email to security@aibadgr.com.

Please do NOT open a public issue.

We will respond within 48 hours and work with you to understand and address the issue.

## Security Best Practices

When using AI Task Router:

1. **Never commit API keys** - Use environment variables
2. **Rotate keys regularly** - Especially if compromised
3. **Use key restrictions** - Limit API key permissions when possible
4. **Monitor usage** - Track costs and usage patterns for anomalies
5. **Rate limiting** - Implement application-level rate limiting
6. **Input validation** - Sanitize user inputs before sending to AI
```

## Code of Conduct (.github/CODE_OF_CONDUCT.md)
```markdown
# Contributor Covenant Code of Conduct

## Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone.

## Our Standards

Examples of behavior that contributes to creating a positive environment include:

* Using welcoming and inclusive language
* Being respectful of differing viewpoints and experiences
* Gracefully accepting constructive criticism
* Focusing on what is best for the community

Examples of unacceptable behavior include:

* The use of sexualized language or imagery
* Trolling, insulting/derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information without explicit permission

## Enforcement

Instances of abusive behavior may be reported by contacting support@aibadgr.com.

## Attribution

This Code of Conduct is adapted from the Contributor Covenant, version 2.0.
```

## GitHub Discussions Categories

1. **💬 General** - General discussion about the project
2. **💡 Ideas** - Share ideas for new features
3. **🙏 Q&A** - Ask the community for help
4. **📣 Show and Tell** - Share what you've built with AI Task Router
5. **🐛 Bug Reports** - Report bugs (link to Issues)
6. **📚 Documentation** - Discuss documentation improvements
7. **🔌 Integrations** - Discuss integrations with other tools
8. **💰 Cost Optimization** - Share cost optimization strategies
