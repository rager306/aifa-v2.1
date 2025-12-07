# Security Policy

## Vulnerability Scanning

Run Snyk scan before every commit:

```bash
npm run snyk:test
```

To generate a detailed JSON report:

```bash
npm run snyk:test:json
```

## Severity Levels

- **Critical**: Fix immediately (< 24 hours)
- **High**: Fix within 1 week
- **Medium**: Fix within 1 month
- **Low**: Fix in next major release

## Reporting Security Issues

To report security vulnerabilities, please contact the security team at [security@aifa.dev](mailto:security@aifa.dev).

## Triage Process

1. **Identify**: Run `npm run snyk:test` to identify vulnerabilities
2. **Assess**: Evaluate severity and impact
3. **Prioritize**: Assign based on severity levels
4. **Fix**: Implement patches or upgrades
5. **Verify**: Re-run scan to confirm fixes
6. **Monitor**: Enable `npm run snyk:monitor` for continuous monitoring

## Ignored Vulnerabilities

See `.snyk` file for ignored vulnerabilities with expiration dates.
Review quarterly.

## Continuous Monitoring

Monitor dependencies for new vulnerabilities:

```bash
npm run snyk:monitor
```

This uploads a snapshot to the Snyk dashboard for continuous monitoring.

## Security Best Practices

### API Routes
- **Chat API** (`app/api/chat/route.ts`): Monitor for prompt injection vulnerabilities
- **Auth API** (`app/@left/(_AUTH)/login/(_server)/actions/auth.ts`): Demo auth, replace before production
- **Lead Form API** (`app/@rightStatic/(_INTERCEPTION_MODAL)/(_server)/api/lead-form/route.ts`): Validate inputs with Zod

### Dependencies
- **AI SDK** (`@ai-sdk/openai`, `@ai-sdk/react`, `ai`): Monitor for AI-specific CVEs
- **JWT Library** (`jose`): Critical for authentication security
- **PWA** (`next-pwa`): Service worker security
- **Framework**: Next.js 15.5.7 and React 19.2.0 (bleeding-edge, monitor closely)

### Key Files to Monitor
- `app/api/chat/route.ts` - AI chat endpoint
- `app/@left/(_AUTH)/login/(_server)/actions/auth.ts` - Authentication
- `app/@rightStatic/(_INTERCEPTION_MODAL)/(_server)/api/lead-form/route.ts` - Form handling
- `package.json` - Dependency management
- `.snyk` - Vulnerability policy

## Snyk Integration

### Configuration

Snyk is configured through multiple mechanisms:

1. **`.snyk` Policy File**: Contains vulnerability ignore rules, patches, and path exclusions
2. **Package Scripts**: Configuration flags are embedded in npm scripts in `package.json`:
   - `--severity-threshold=medium` - Only report medium severity and above
3. **Build Exclusions**: Paths excluded from scanning:
   - `.next/**`, `out/**`, `node_modules/**`, `coverage/**`, `doc/**`, `.serena/**`

### Available Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run snyk:test` | Run vulnerability scan locally | Before commits, during development |
| `npm run snyk:monitor` | Upload snapshot for monitoring | After deployments, weekly |
| `npm run snyk:test:json` | Generate JSON report | For CI/CD integration, audits |
| `npm run snyk:fix` | Auto-fix vulnerabilities | When Snyk suggests patches |
| `npm run snyk:protect` | Apply patches from `.snyk` | After updating `.snyk` policy |

### Dashboard Access

Access the Snyk dashboard at https://app.snyk.io for:
- Dependency tree visualization
- Vulnerability timeline
- Fix priority recommendations
- License compliance checks

## Current Status

✅ Snyk CLI installed and authenticated
✅ Initial vulnerability scan completed
✅ Policy file configured with ignore rules
✅ Continuous monitoring enabled
✅ npm scripts configured for easy execution

## Contact

For questions about security, contact: security@aifa.dev
