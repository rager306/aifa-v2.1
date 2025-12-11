# 🤖 Renovate Bot - Автоматизация обновлений зависимостей

## 📖 Обзор

Renovate Bot автоматически создает Pull Request'ы для обновления зависимостей в `package.json`, обеспечивая:
- ✅ Своевременные security patches
- ✅ Актуальность зависимостей
- ✅ Минимизацию технического долга
- ✅ Автоматическое тестирование через CI/CD

## 🚀 Активация Renovate Bot

### Шаг 1: Установка GitHub App

1. Перейдите на https://github.com/apps/renovate
2. Нажмите **"Install"** или **"Configure"**
3. Выберите репозиторий `aifa-agi/aifa-v2.1`
4. Подтвердите установку

### Шаг 2: Первый запуск

После установки Renovate автоматически:
1. Создаст **Dependency Dashboard** issue
2. Просканирует `package.json` и `package-lock.json`
3. Создаст первые PR (если есть обновления)

**Ожидаемое время**: 5-10 минут после установки

### Шаг 3: Проверка конфигурации

Renovate прочитает `renovate.json` из корня проекта и применит настройки:
- Расписание: Понедельник 04:00 UTC
- Автомерж: Patch updates с passing CI
- Группировка: Radix UI, Tailwind, Testing tools и т.д.

## 📊 Dependency Dashboard

Renovate создаст issue **"🤖 Renovate Dependency Dashboard"** с:
- Списком всех pending updates
- Статусом каждого PR
- Ссылками на changelogs
- Кнопками для ручного управления

**Пример**: https://github.com/aifa-agi/aifa-v2.1/issues/1

## 🔄 Типы обновлений

### 1. Patch Updates (автомерж)
- **Пример**: `1.2.3` → `1.2.4`
- **Поведение**: Автоматический merge при passing CI
- **Label**: `dependencies`, `automerge`, `patch`

### 2. Minor Updates (группировка)
- **Пример**: `1.2.0` → `1.3.0`
- **Поведение**: Группируются в один PR "minor dependencies"
- **Label**: `dependencies`, `minor`

### 3. Major Updates (ручной review)
- **Пример**: `1.0.0` → `2.0.0`
- **Поведение**: Отдельные PR, требуют ручного review
- **Label**: `dependencies`, `major`, `manual-review`
- **Расписание**: Первый день месяца

### 4. Security Updates (немедленно)
- **Поведение**: Создаются сразу при обнаружении CVE
- **Label**: `security`, `vulnerability`
- **Assignee**: bolshiyanov

## 🎯 Специальные правила

### Критичные пакеты (ручной review)
- **Next.js** (`next`)
- **React** (`react`, `react-dom`)
- **AI SDK** (`ai`, `@ai-sdk/*`)
- **PWA** (`next-pwa`)
- **Security** (`jose`, `zod`)

**Причина**: Breaking changes могут сломать функциональность

### Группировка пакетов
- **Radix UI**: Все `@radix-ui/*` в один PR
- **Tailwind CSS**: `tailwind*`, `@tailwindcss/*`
- **Vercel**: `@vercel/*`
- **Testing**: `vitest`, `@vitest/*`, `@playwright/test`
- **Linting**: `biome`, `eslint`, `knip`, `lefthook`

**Причина**: Упрощение review и тестирования

## 🛠️ Управление Renovate

### Ручной запуск обновлений

Renovate запускается автоматически по расписанию, но можно запустить вручную:

1. Откройте **Dependency Dashboard** issue
2. Поставьте галочку напротив нужного обновления
3. Renovate создаст PR в течение 5 минут

### Пропуск обновления

Если обновление не нужно:

1. Закройте PR с комментарием `@renovate ignore`
2. Renovate больше не будет создавать PR для этой версии

### Игнорирование пакета навсегда

Добавьте в `renovate.json`:

```json
{
  "ignoreDeps": ["package-name"]
}
```

### Изменение расписания

Отредактируйте `renovate.json`:

```json
{
  "schedule": ["before 6am on Friday"]
}
```

## 🔍 Интеграция с CI/CD

### Текущие проверки (Phase 1-7)

Renovate PR автоматически запускают:
- ✅ **Lefthook** (pre-commit): Biome, lint-staged, knip
- ✅ **Security.yml** (GitHub Actions): Semgrep SAST
- ✅ **Snyk** (pre-push): Dependency scanning
- ✅ **Vitest** (lint-staged): Related tests
- ✅ **Playwright** (опционально): E2E tests

### Будущие проверки (Phase 10)

После внедрения полного CI/CD pipeline:
- ✅ **Biome check** (code quality)
- ✅ **Knip** (dead code)
- ✅ **Vitest coverage** (unit tests)
- ✅ **Playwright** (E2E tests)
- ✅ **Lighthouse CI** (performance)

**Автомерж** сработает только если **все проверки пройдены**.

## 📈 Мониторинг

### Dependency Dashboard

Проверяйте dashboard еженедельно:
- Открытые PR
- Pending updates
- Failed checks

### GitHub Notifications

Настройте уведомления для:
- `security` label (немедленно)
- `manual-review` label (в течение недели)
- `automerge` label (опционально)

### Renovate Logs

Если PR не создается:
1. Откройте **Dependency Dashboard**
2. Найдите секцию **"Detected dependencies"**
3. Проверьте ошибки в логах

## 🐛 Troubleshooting

### Проблема: Renovate не создает PR

**Решение**:
1. Проверьте `renovate.json` на синтаксические ошибки
2. Убедитесь, что Renovate App установлен в репозитории
3. Проверьте расписание (может быть вне временного окна)
4. Откройте Dependency Dashboard и проверьте логи

### Проблема: Автомерж не работает

**Решение**:
1. Убедитесь, что все CI checks прошли успешно
2. Проверьте, что обновление типа `patch` (не `minor`/`major`)
3. Проверьте настройки branch protection в GitHub
4. Убедитесь, что `automerge: true` в `renovate.json`

### Проблема: Слишком много PR

**Решение**:
1. Увеличьте группировку в `renovate.json`
2. Уменьшите `prConcurrentLimit` (по умолчанию 10)
3. Измените расписание на реже (например, раз в 2 недели)

### Проблема: Конфликты в package-lock.json

**Решение**:
1. Renovate автоматически rebase PR при конфликтах
2. Если не помогло, закройте PR и переоткройте через Dashboard
3. Вручную: `npm install` → commit → push

### Проблема: Breaking changes в major updates

**Решение**:
1. Читайте changelog в PR description
2. Проверяйте migration guides
3. Тестируйте локально: `git checkout renovate/major-dependencies`
4. Запускайте полный test suite: `npm test && npm run test:e2e`

## 📚 Полезные ссылки

- **Renovate Docs**: https://docs.renovatebot.com
- **Configuration Options**: https://docs.renovatebot.com/configuration-options/
- **Preset Configs**: https://docs.renovatebot.com/presets-config/
- **Package Rules**: https://docs.renovatebot.com/configuration-options/#packagerules
- **Automerge**: https://docs.renovatebot.com/key-concepts/automerge/

## 🔐 Безопасность

### Vulnerability Alerts

Renovate интегрируется с:
- **GitHub Security Advisories**
- **npm audit**
- **Snyk** (через наш CI/CD)

При обнаружении CVE:
1. Renovate создает PR немедленно (игнорируя расписание)
2. PR помечается `security` label
3. Assignee: bolshiyanov
4. Snyk автоматически сканирует PR

### Trusted Publishers

Renovate проверяет:
- ✅ Package signatures
- ✅ npm provenance
- ✅ GitHub verified publishers

### Lockfile Integrity

Renovate обновляет `package-lock.json` с:
- ✅ Integrity hashes
- ✅ Resolved URLs
- ✅ Deduplicated dependencies

## 🎓 Best Practices

### 1. Регулярный review

Проверяйте Dependency Dashboard **еженедельно** (понедельник утром):
- Новые PR
- Failed checks
- Pending updates

### 2. Тестирование major updates

Перед мержем major updates:
```bash
git fetch origin
git checkout renovate/major-dependencies
npm install
npm run dev  # Проверка в браузере
npm test  # Unit tests
npm run test:e2e  # E2E tests
npm run build  # Production build
```

### 3. Changelog review

Читайте changelogs для:
- Breaking changes
- Deprecations
- New features
- Security fixes

### 4. Staged rollout

Для критичных обновлений:
1. Мерж в `develop` branch
2. Тестирование на staging
3. Мерж в `main` после проверки

### 5. Rollback plan

Если обновление сломало prod:
```bash
git revert <commit-hash>
git push origin main
```

## 📊 Метрики

Отслеживайте:
- **Time to merge**: Среднее время от создания PR до merge
- **Dependency freshness**: % актуальных зависимостей
- **Security response time**: Время от CVE до patch
- **Failed updates**: Количество PR с failed checks

**Цель**:
- Patch updates: < 24 часа
- Minor updates: < 1 неделя
- Major updates: < 1 месяц
- Security updates: < 4 часа

## 🤝 Вклад

Если вы нашли проблему с Renovate конфигурацией:
1. Откройте issue с описанием
2. Предложите изменения в `renovate.json`
3. Создайте PR с обновленной конфигурацией

---

**Последнее обновление**: Декабрь 2024
**Версия конфигурации**: 1.0.0
**Автор**: @bolshiyanov
