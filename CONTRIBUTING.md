# Contributing to TheraBot

First off, thank you for considering contributing to TheraBot! It's people like you that make TheraBot such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct. Please report unacceptable behavior to [conduct@therabot.com](mailto:conduct@therabot.com).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots and animated GIFs if possible
* Include your environment details (OS, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful
* List some other applications where this enhancement exists, if applicable

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Follow the JavaScript/React styleguide
* Include screenshots and animated GIFs in your pull request whenever possible
* Document new code
* End all files with a newline

## Development Process

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider starting the commit message with an applicable emoji:
    * 🎨 `:art:` when improving the format/structure of the code
    * 🐎 `:racehorse:` when improving performance
    * 🚱 `:non-potable_water:` when plugging memory leaks
    * 📝 `:memo:` when writing docs
    * 🐛 `:bug:` when fixing a bug
    * 🔥 `:fire:` when removing code or files
    * 💚 `:green_heart:` when fixing the CI build
    * ✅ `:white_check_mark:` when adding tests
    * 🔒 `:lock:` when dealing with security
    * ⬆️ `:arrow_up:` when upgrading dependencies
    * ⬇️ `:arrow_down:` when downgrading dependencies

### JavaScript Styleguide

* Use ES6+ features
* Use semicolons
* 2 spaces for indentation
* Prefer `const` over `let`
* 80 character line length
* Use meaningful variable names
* Document complex code sections
* Use async/await over promises
* Use template literals over string concatenation

### React/JSX Styleguide

* Use functional components with hooks
* One component per file
* Use PropTypes or TypeScript for props validation
* Use meaningful component names
* Keep components small and focused
* Use CSS-in-JS or styled-components
* Follow React best practices for performance

### Documentation Styleguide

* Use [Markdown](https://guides.github.com/features/mastering-markdown/)
* Reference methods and classes in markdown with backticks
* Use clear and consistent terminology
* Include code examples when possible
* Keep documentation up to date with code changes

## Project Structure

```
TheraBot/
├── client/                 # React frontend
│   ├── public/            # Static files
│   └── src/              
│       ├── components/    # React components
│       ├── contexts/      # React contexts
│       ├── services/      # API services
│       └── utils/         # Utility functions
├── server/                # Node.js backend
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── routes/          # API routes
│   └── services/        # Business logic
└── docs/                 # Documentation
```

## Testing

* Write unit tests for new features
* Maintain test coverage above 80%
* Write integration tests for API endpoints
* Write end-to-end tests for critical user flows

## Additional Notes

### Issue and Pull Request Labels

* `bug` - Something isn't working
* `enhancement` - New feature or request
* `documentation` - Improvements or additions to documentation
* `good first issue` - Good for newcomers
* `help wanted` - Extra attention is needed
* `question` - Further information is requested
* `security` - Security-related issues
* `performance` - Performance-related issues
* `refactor` - Code refactoring
* `tests` - Testing-related tasks

## Recognition

Contributors who make significant improvements will be added to our README.md and given credit for their work.

Thank you for contributing to TheraBot! 🎉 