# CI/CD Pipeline Documentation

This document describes the elite-level CI/CD pipeline for WordSearchy.

## Workflow Structure

### 1. CI Workflow (`ci.yml`)

Runs on every push and pull request to ensure code quality.

**Jobs:**

- **lint**: Runs ESLint to check code style and quality
- **type-check**: TypeScript type checking for packages and apps
- **test**: Runs all tests with coverage reporting
- **build**: Builds all packages and apps, creates deployment artifacts
- **quality-gate**: Aggregates all quality checks and fails if any step fails

**Features:**

- ✅ Parallel execution of quality checks (lint, type-check, test)
- ✅ Comprehensive caching (pnpm store, Turbo cache)
- ✅ Artifact compression for faster uploads
- ✅ Timeout protection (10-20 minutes per job)
- ✅ Test coverage artifact upload

### 2. Preview Deployment (`preview.yml`)

Automatically deploys pull requests to preview environments.

**Jobs:**

- **build-preview**: Builds both main app and multiplayer game
- **deploy-preview**: Deploys main app preview
- **deploy-multiplayer-preview**: Deploys multiplayer game preview

**Features:**

- ✅ Automatic preview deployment for every PR
- ✅ Separate preview deployments for main app and multiplayer game
- ✅ PR comments with both preview URLs
- ✅ Preview updates on new commits
- ✅ Branch-based preview URLs:
  - Main app: `pr-{number}.word-search-wizard.pages.dev`
  - Multiplayer: `pr-{number}.word-search-wizard-multiplayer.pages.dev`

### 3. Production Deployment (`deploy.yml`)

Deploys to production on main branch merges.

**Jobs:**

- **terraform**: Infrastructure provisioning with OpenTofu (creates both Pages
  projects)
- **deploy-pages**: Deploys main app to Cloudflare Pages
- **deploy-multiplayer**: Deploys multiplayer game to separate Cloudflare Pages
  project
- **verify-deployment**: Post-deployment verification for both projects

**Features:**

- ✅ Environment-based deployments (production/staging)
- ✅ Infrastructure as Code with OpenTofu
- ✅ Deployment status tracking
- ✅ Health check verification
- ✅ Manual deployment support via workflow_dispatch

## Caching Strategy

### pnpm Store Cache

- Caches the pnpm store directory
- Key: `{os}-pnpm-store-{lockfile-hash}`
- Restores from previous builds for faster installs

### Turbo Cache

- Caches Turbo build cache
- Key: `{os}-turbo-{commit-sha}`
- Enables incremental builds across workflows

### Artifact Caching

- Build artifacts are compressed (level 6) for faster uploads
- Retention: 3 days for production, 1 day for previews

## Deployment Architecture

### Cloudflare Pages Projects

#### Main Application (`word-search-wizard`)

```
dist/cloudflare/
├── index.html              # Main app
├── assets/                 # Frontend assets
├── functions/              # Cloudflare Pages Functions
└── _routes.json            # Routing configuration
```

**URL:** `https://word-search-wizard.pages.dev`

#### Multiplayer Game (`word-search-wizard-multiplayer`)

```
dist/multiplayer-game/
├── index.html              # Multiplayer game
└── assets/                 # Multiplayer assets
```

**URL:** `https://word-search-wizard-multiplayer.pages.dev`

### Separate Infrastructure

The multiplayer game has its own Cloudflare Pages project with:

- Separate deployment pipeline
- Independent scaling and configuration
- Separate preview deployments for PRs
- Shared D1 database (via tRPC API)

## Quality Gates

All quality checks must pass before deployment:

1. ✅ Linting passes
2. ✅ Type checking passes
3. ✅ All tests pass
4. ✅ Build succeeds

## Performance Optimizations

1. **Parallel Execution**: Lint, type-check, and tests run in parallel
2. **Smart Caching**: pnpm and Turbo caches reduce build times by 50-70%
3. **Artifact Compression**: Reduces upload/download times
4. **Incremental Builds**: Turbo only rebuilds changed packages

## Security

- Secrets are stored in GitHub Secrets
- No secrets in logs or artifacts
- Infrastructure changes require manual approval
- Deployment environments are protected

## Monitoring

- Deployment status is tracked in GitHub
- Preview URLs are automatically posted to PRs
- Health checks verify deployment success
- Build artifacts are retained for debugging

## Manual Deployment

To manually trigger a deployment:

1. Go to Actions → Deploy workflow
2. Click "Run workflow"
3. Select environment (production/staging)
4. Click "Run workflow"

## Troubleshooting

### Build Failures

- Check the quality-gate job for which step failed
- Review logs in the failed job
- Ensure all dependencies are properly installed

### Deployment Failures

- Verify Cloudflare credentials are correct
- Check Terraform state for infrastructure issues
- Review deployment logs in Cloudflare dashboard

### Preview Deployment Issues

- Ensure PR has been opened/synchronized
- Check that build artifacts were created
- Verify Cloudflare Pages project exists

## Future Enhancements

- [ ] Add security scanning (Dependabot, CodeQL)
- [ ] Add performance testing
- [ ] Add E2E testing in CI
- [ ] Add deployment rollback capability
- [ ] Add canary deployments
- [ ] Add monitoring and alerting integration
