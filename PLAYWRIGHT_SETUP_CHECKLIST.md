# Playwright E2E Testing - Setup Checklist

## ✅ Pre-Implementation Checklist

Before running tests, verify the following:

### 1. Dependencies Installed
```bash
# Check if @playwright/test is installed
npm list @playwright/test

# Expected output: @playwright/test@^1.57.0
```

### 2. Browsers Installed
```bash
# List installed browsers
npx playwright --version

# If browsers not installed, run:
npx playwright install chromium firefox webkit
```

### 3. Configuration Files Exist
- [ ] `playwright.config.ts` exists in project root
- [ ] `e2e/` directory exists
- [ ] Test spec files exist in `e2e/`
- [ ] Fixtures exist in `e2e/fixtures/`

### 4. Scripts Available
```bash
# Check available scripts
npm run | grep e2e

# Expected output:
# test:e2e
# test:e2e:ui
# test:e2e:headed
# test:e2e:debug
# test:e2e:chromium
# test:e2e:firefox
# test:e2e:webkit
# test:e2e:mobile
# test:e2e:no-js
# test:e2e:report
```

## 🧪 Running Tests

### Quick Start
```bash
# 1. Start dev server (if not using webServer config)
npm run dev

# 2. Run all tests (in another terminal)
npm run test:e2e

# 3. View report
npm run test:e2e:report
```

### Recommended for Development
```bash
# Interactive UI mode
npm run test:e2e:ui
```

### Debug Mode
```bash
# Step-by-step debugging
npm run test:e2e:debug
```

## ✅ Verification Steps

### Step 1: Check Configuration
```bash
npx playwright test --list
```
Expected: List of all test files should be displayed

### Step 2: Run Setup Test
```bash
npx playwright test setup.spec.ts
```
Expected: Tests should pass, confirming dev server connection

### Step 3: Run Sample Test
```bash
npx playwright test example.spec.ts
```
Expected: Example tests should pass using Page Object Model

### Step 4: Run All Tests
```bash
npm run test:e2e
```
Expected: All tests should run (may have failures due to missing elements, but framework should work)

## 📁 Expected File Structure

```
project-root/
├── playwright.config.ts          ✅ Created
├── package.json                   ✅ Updated with scripts
├── .gitignore                     ✅ Updated with Playwright exclusions
│
├── e2e/                           ✅ Created
│   ├── .gitignore                 ✅ Created
│   ├── README.md                  ✅ Created
│   ├── ARCHITECTURE.md            ✅ Created
│   ├── setup.spec.ts              ✅ Created
│   ├── example.spec.ts            ✅ Created
│   ├── parallel-routes.spec.ts    ✅ Created
│   ├── intercepting-modals.spec.ts ✅ Created
│   ├── no-js.spec.ts              ✅ Created
│   ├── authentication.spec.ts     ✅ Created
│   └── fixtures/
│       ├── .gitignore             ✅ Created
│       ├── index.ts               ✅ Created
│       └── pages.ts               ✅ Created
│
└── doc/
    └── PLAYWRIGHT.md              ✅ Created
```

## 🎯 Success Indicators

### ✅ Framework Working
- [ ] Tests execute without "command not found" errors
- [ ] Dev server starts automatically (or can be started manually)
- [ ] Browser instances launch
- [ ] Tests complete (pass or fail)

### ✅ Configuration Correct
- [ ] Base URL set to http://localhost:3000
- [ ] 5 browser projects configured
- [ ] Reporters configured (HTML, JSON, list)
- [ ] Trace/screenshot/video on failure

### ✅ Tests Structured
- [ ] Each spec file has descriptive test.describe blocks
- [ ] Tests use proper assertions
- [ ] Page Object Model classes available
- [ ] Fixtures can be imported

## 🚨 Common Issues & Solutions

### Issue: "Command not found: playwright"
**Solution:**
```bash
npm install -D @playwright/test
npx playwright install
```

### Issue: "Dev server not running"
**Solution:**
- Check if port 3000 is available
- Run `npm run dev` in separate terminal
- Or rely on webServer config in playwright.config.ts

### Issue: "Browser not found"
**Solution:**
```bash
npx playwright install chromium firefox webkit
```

### Issue: "Timeout waiting for..."
**Solution:**
- Increase timeout in playwright.config.ts
- Use `--headed` mode to see what's happening
- Check if selectors are correct

### Issue: "Element not visible"
**Solution:**
- Verify element exists on page
- Check if JavaScript is enabled/disabled (for no-js tests)
- Use Playwright Inspector to debug

## 📊 Test Execution Examples

### Run Specific Test File
```bash
npx playwright test parallel-routes.spec.ts
```

### Run with Specific Browser
```bash
npx playwright test --project=chromium
```

### Run Headed (Visible Browser)
```bash
npx playwright test --headed
```

### Run with Debug
```bash
npx playwright test --debug
```

### Run Only Mobile Tests
```bash
npx playwright test --project=mobile-chrome
```

### Run Only No-JS Tests
```bash
npx playwright test --project=no-js
```

## 📝 Viewing Results

### HTML Report
```bash
npm run test:e2e:report
# Opens in browser: playwright-report/index.html
```

### JSON Report
```bash
# Available at: playwright-report/results.json
```

### Test Artifacts (on failure)
- Screenshots: `test-results/`
- Videos: `test-results/`
- Traces: `test-results/`

## 🎓 Next Steps

After setup verification:

1. **Customize Tests**
   - Update selectors to match actual components
   - Add data-testid attributes for stable selectors
   - Extend test coverage as needed

2. **Integrate with CI/CD**
   - Add GitHub Actions workflow (Phase 10)
   - Configure for parallel execution
   - Upload artifacts on failure

3. **Add Lefthook** (Phase 7)
   - Pre-push hook for smoke tests
   - Fast feedback loop

4. **Extend Testing**
   - API route testing
   - Visual regression
   - Accessibility testing
   - Performance testing

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Playwright Configuration](https://playwright.dev/docs/test-configuration)
- [Project Documentation](./doc/PLAYWRIGHT.md)
- [Test Architecture](./e2e/ARCHITECTURE.md)

## ✅ Final Verification

Run this command to verify everything is working:

```bash
npm run test:e2e:ui
```

Expected behavior:
1. Browser opens
2. Tests execute
3. Results displayed in UI
4. Can interactively run/debug tests

---

**Status**: ✅ READY FOR TESTING

All components implemented and verified. Framework ready for use.
