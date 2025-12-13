# Contributing to @aibadgr/router

Thank you for your interest in contributing to @aibadgr/router!

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/michaelbrinkworth/ai-task-router.git
cd ai-task-router
```

2. Install dependencies:
```bash
npm install
```

3. Run tests:
```bash
npm test
```

4. Build the package:
```bash
npm run build
```

## Development Workflow

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch
```

### Type Checking

```bash
npm run typecheck
```

### Building

```bash
# Build for production
npm run build

# Build in watch mode during development
npm run dev
```

## Code Style

- We use TypeScript for type safety
- Follow the existing code style in the project
- Write tests for new features
- Keep functions small and focused
- Document public APIs with JSDoc comments

## Testing Guidelines

- Write unit tests for all new features
- Ensure all tests pass before submitting a PR
- Aim for high code coverage
- Test both success and error cases

## Submitting Changes

1. Fork the repository
2. Create a new branch for your feature: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `npm test`
5. Run type checking: `npm run typecheck`
6. Build: `npm run build`
7. Commit your changes: `git commit -m "Add my feature"`
8. Push to your fork: `git push origin feature/my-feature`
9. Open a Pull Request

## Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Include tests for new functionality
- Update documentation as needed
- Ensure all tests pass
- Follow the existing code style

## Reporting Issues

When reporting issues, please include:

- A clear description of the problem
- Steps to reproduce the issue
- Expected vs actual behavior
- Node.js version and operating system
- Relevant code snippets or error messages

## Feature Requests

We welcome feature requests! Please:

- Check if the feature has already been requested
- Clearly describe the feature and its use case
- Consider the scope (should it be in MVP or a future version?)

## Questions?

Feel free to open an issue for questions or discussions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
