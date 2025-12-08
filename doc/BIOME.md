# Biome Formatter & Linter

[Biome](https://biomejs.dev/) — быстрый инструмент для форматирования и линтинга кода, используемый в проекте AIFA v2.1 для обеспечения консистентного стиля кода.

## Установка

Biome уже установлен как dev dependency:

```bash
npm install --save-dev @biomejs/biome
```

## Доступные команды

### Проверка кода
```bash
# Проверка форматирования и линтинга без изменений
npm run biome:check

# Проверка конкретной директории
npm run biome:check lib/
npm run biome:check components/
npm run biome:check app/
```

### Автоматические исправления
```bash
# Автоматическое исправление всех проблем (безопасные фиксы)
npm run biome:fix

# Форматирование только
npm run biome:format

# Линтинг только
npm run biome:lint

# Режим для CI/CD (строгий)
npm run biome:ci
```

### Комбинированные проверки
```bash
# Запуск ESLint и Biome вместе
npm run lint:all
```

## Конфигурация

Конфигурация находится в файле `biome.json` в корне проекта.

### Основные настройки

#### Форматирование
- **Отступы**: 2 пробела
- **Кавычки**: двойные (`"`)
- **Точки с запятой**: по необходимости (`asNeeded`)
- **Trailing commas**: все (`all`)
- **Line width**: 100 символов

#### Линтинг
- **noExplicitAny**: предупреждение
- **noUnusedVariables**: предупреждение
- **noUnusedImports**: предупреждение
- **noConsole**: разрешен только `console.log`

#### Исключения
- `components/ai-elements/**` — отключен `noExplicitAny` для AI-компонентов
- Игнорируются: `node_modules`, `.next`, `build`, `dist`, и другие build директории

## Сравнение с ESLint

| Аспект | Biome | ESLint |
|--------|-------|--------|
| **Скорость** | ~50ms для 170 файлов | ~2-3s для 170 файлов |
| **Форматирование** | Встроенное (97% Prettier) | Требует Prettier plugin |
| **Линтинг** | Базовые + TypeScript правила | Полный набор + плагины |
| **Next.js правила** | Ограниченные | Полная поддержка |
| **Конфигурация** | Один файл `biome.json` | `eslint.config.mjs` + плагины |
| **Автофикс** | Быстрый | Медленный |

## Рекомендации по использованию

### Ежедневная разработка
1. **Форматирование при сохранении** — настройте IDE для автоматического форматирования через Biome
2. **Перед коммитом** — запустите `npm run biome:fix` для автоматических исправлений
3. **Проверка** — используйте `npm run biome:check` для проверки проблем

### CI/CD
- Запускайте `npm run biome:ci` для строгой проверки
- В сочетании с ESLint: `npm run lint:all`

### Исправление ошибок
- **Безопасные фиксы** — применяются автоматически через `biome:fix`
- **Ручные исправления** — требуют ручного вмешательства (например, замена `any` на правильный тип)

## Интеграция с IDE

### VS Code
Установите расширение [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)

Настройте `settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome",
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  }
}
```

### WebStorm
1. Откройте `Preferences` → `Tools` → `External Tools`
2. Добавьте новый инструмент:
   - **Name**: `Biome Format`
   - **Program**: `npx`
   - **Arguments**: `biome check --write $FilePath$`
   - **Working directory**: `$ProjectFileDir$`

## Часто задаваемые вопросы

### Почему Biome + ESLint?
Biome отлично справляется с форматированием и базовым линтингом, но ESLint имеет более богатую экосистему плагинов для Next.js и специфичных правил. Вместе они обеспечивают:
- Быстрое форматирование (Biome)
- Комплексный линтинг (ESLint + плагины)

### Как игнорировать правило для конкретной строки?
```typescript
// biome-ignore lint/suspicious/noExplicitAny: reason
const value: any = getValue()
```

### Как добавить новое правило?
Отредактируйте `biome.json`, секция `linter.rules`:
```json
{
  "linter": {
    "rules": {
      "style": {
        "useNamingConvention": "error"
      }
    }
  }
}
```

### Миграция с Prettier
Biome совместим с Prettier на 97%. Основные отличия:
- Точки с запятой (`asNeeded` vs `always`)
- Порядок импортов (организуется автоматически)
- Однострочные объекты (сохраняются)

## Устранение неполадок

### Ошибка: "Formatter would have printed..."
Решение: запустите `npm run biome:fix` для автоматического исправления

### Biome работает медленно
- Убедитесь, что build директории добавлены в `ignore`
- Используйте `biome check --changed` для проверки только измененных файлов

### Конфликты с ESLint
Если возникают конфликты:
1. Проверьте настройки `semicolons`, `quotes`, `trailingCommas` в `biome.json`
2. Отключите форматирование в ESLint (если используется Prettier plugin)
3. Используйте только `biome:format` для форматирования

## Ссылки

- [Официальная документация Biome](https://biomejs.dev/)
- [Конфигурация](https://biomejs.dev/reference/configuration)
- [Правила линтинга](https://biomejs.dev/reference/linting-rules)
- [Игнорирование файлов](https://biomejs.dev/reference/configuration#filesinclude)

## Примеры использования

### Проверка конкретного файла
```bash
npx biome check lib/utils.ts
```

### Форматирование с подробным выводом
```bash
npx biome format --write --verbose .
```

### Линтинг с выводом JSON
```bash
npx biome lint --formatter-enabled=false --write=false --output-format=json
```

### Интеграция с pre-commit

Проект использует [Lefthook](https://github.com/evilmartians/lefthook) для управления Git hooks. См. `doc/LEFTHOOK.md` для детальной информации.

Конфигурация в `lefthook.yml`:
```yaml
pre-commit:
  parallel: true
  commands:
    # 1. Biome: форматирование и линтинг
    biome:
      glob: "*.{ts,tsx,js,jsx,json}"
      run: npx biome check --write --changed --no-errors-on-unmatched
      stage_fixed: true

    # 2. lint-staged: ESLint, Vitest, knip
    lint-staged:
      run: npx lint-staged
```

## Статистика проекта

- **Всего файлов**: 170
- **Ошибки после исправления**: 54
- **Предупреждения**: 80
- **Время проверки**: ~50ms
- **Файлов исправлено**: 169

## Следующие шаги

1. ~~**Настройка pre-commit hook** (Lefthook)~~ ✅ Реализовано (см. `doc/LEFTHOOK.md`)
2. **Интеграция с GitHub Actions**
3. **Настройка автоформатирования в IDE**
4. **Документирование кастомных правил**
