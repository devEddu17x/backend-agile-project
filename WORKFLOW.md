# Git Workflow Guide

This project follows a **Git Flow** workflow with conventional commits.

## Branch Structure

- **`production`**: Production-ready code
- **`develop`**: Integration branch for features
- **`feature/*`**: Feature branches (e.g., `feature/user-authentication`)
- **`release/*`**: Release preparation branches (e.g., `release/v1.2.0`)
- **`hotfix/*`**: Emergency fixes for production

## Workflow Steps

### 1. Feature Development

```bash
# Start from develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Work on your feature, make commits using conventional format
pnpm commit  # or git commit with conventional format

# Push feature branch
git push origin feature/your-feature-name
```

### 2. Create Pull Request

- Create PR from `feature/your-feature-name` → `develop`
- Add meaningful description
- Request code review

### 3. Release Process

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Bump version, update changelog, final testing
# Make final commits if needed

# Merge to production
git checkout production
git merge release/v1.2.0
git tag v1.2.0
git push origin production --tags

# Merge back to develop
git checkout develop
git merge release/v1.2.0
git push origin develop

# Delete release branch
git branch -d release/v1.2.0
git push origin --delete release/v1.2.0
```

### 4. Hotfixes

```bash
# Create hotfix from production
git checkout production
git pull origin production
git checkout -b hotfix/critical-bug-fix

# Fix the issue and commit
pnpm commit

# Merge to production
git checkout production
git merge hotfix/critical-bug-fix
git tag v1.2.1
git push origin production --tags

# Merge to develop
git checkout develop
git merge hotfix/critical-bug-fix
git push origin develop

# Delete hotfix branch
git branch -d hotfix/critical-bug-fix
```

## Commit Message Format

We use **Conventional Commits** format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system changes
- **ci**: CI/CD changes
- **chore**: Maintenance tasks

### Examples

```
feat(auth): add user login functionality
fix(api): resolve data validation error
docs(readme): update installation instructions
refactor(utils): simplify date formatting function
```

## Available Commands

- `docker compose up -d` - Starts database (api) and supertokens core containers
- `pnpm start:dev` - Start server in dev mode
- `pnpm start:prod` - Start server in production mode

## Hooks

- **pre-commit**: Runs linting and formatting on staged files
- **commit-msg**: Validates commit message format

## Branch Protection Rules (Recommended)

### For `production` branch:

- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
- Include administrators
- Restrict pushes

### For `develop` branch:

- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
