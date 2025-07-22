# Contributing to AITask

Thank you for your interest in contributing to AITask! This document provides guidelines and information for contributors.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to help maintain a welcoming community.

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or pnpm
- Git
- MongoDB (local or cloud)
- Clerk account
- Google AI API access

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/aitask.git
   cd aitask
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Fill in your environment variables
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Development Guidelines

### Code Style

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the ESLint configuration
- **Formatting**: Use Prettier for consistent formatting
- **Naming**: Use descriptive names for variables and functions

### Git Workflow

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clear, concise commit messages
   - Keep commits focused and atomic
   - Test your changes

3. **Commit Format**
   ```
   type(scope): description
   
   feat(tasks): add task priority filtering
   fix(auth): resolve sign-in redirect issue
   docs(readme): update installation instructions
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Review Process

1. **Submit PR**: Create a detailed pull request
2. **Review**: Maintainers will review your code
3. **Address Feedback**: Make requested changes
4. **Merge**: PR will be merged once approved

## Types of Contributions

### 🐛 Bug Reports

- Use the bug report template
- Include steps to reproduce
- Provide environment details
- Add screenshots if applicable

### ✨ Feature Requests

- Use the feature request template
- Explain the use case
- Describe the proposed solution
- Consider alternative solutions

### 📝 Documentation

- Fix typos and improve clarity
- Add missing documentation
- Update outdated information
- Improve code examples

### 🧪 Testing

- Add unit tests for new features
- Improve test coverage
- Fix flaky tests
- Add integration tests

## Development Areas

### Frontend Components
- React components in `/components`
- UI components in `/components/ui`
- Page components in `/app`

### Backend APIs
- API routes in `/app/api`
- Database operations in `/lib`
- Authentication logic

### AI Integration
- Gemini AI features
- Analytics and insights
- Smart recommendations

### Database
- MongoDB collections
- Data models and schemas
- Migration scripts

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests
- Write tests for new features
- Test edge cases
- Mock external dependencies
- Keep tests focused and clear

## Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex logic
- Include examples in documentation
- Keep README.md updated

### API Documentation
- Document all API endpoints
- Include request/response examples
- Document error cases
- Update OpenAPI schema

## Deployment

### Staging
- All PRs are automatically deployed to staging
- Test your changes in staging environment
- Verify functionality before requesting review

### Production
- Only maintainers can deploy to production
- All changes must be reviewed and approved
- Follow the release process

## Release Process

1. **Version Bump**: Update version in package.json
2. **Changelog**: Update CHANGELOG.md
3. **Tag Release**: Create git tag
4. **Deploy**: Deploy to production
5. **Announce**: Share release notes

## Getting Help

### Channels
- **Issues**: GitHub Issues for bugs and features
- **Discussions**: GitHub Discussions for questions
- **Email**: maintainers@aitask.dev

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Recognition

Contributors will be:
- Listed in the README.md
- Mentioned in release notes
- Invited to the contributors team

## Questions?

Don't hesitate to ask questions! We're here to help and welcome contributions of all sizes.

Thank you for contributing to AITask! 🚀
