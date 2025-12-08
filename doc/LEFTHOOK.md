# Lefthook Git Hooks

## Обзор

Lefthook — менеджер Git hooks, написанный на Go, обеспечивающий быстрое параллельное выполнение проверок качества кода.

## Установка

Хуки устанавливаются автоматически при `npm install` через npm-скрипт `prepare`.

Ручная установка:
```bash
npm run lefthook:install
```

## Конфигурация

### Pre-commit (быстрые проверки)
- **Biome**: Форматирование и линтинг измененных файлов (~50ms)
- **lint-staged**: Инкрементальные проверки (ESLint, Vitest, knip)

### Pre-push (security-сканы)
- **Snyk**: Сканирование зависимостей на уязвимости
- **Semgrep**: SAST-анализ кода (AI, Auth, API)

## Использование

### Обычный workflow
```bash
git add .
git commit -m "feat: add feature"  # Запустится pre-commit
git push  # Запустится pre-push
```

### Ручной запуск хуков
```bash
# Проверить pre-commit без коммита
npm run lefthook:run:pre-commit

# Проверить pre-push без push
npm run lefthook:run:pre-push
```

### Пропуск хуков (emergency)
```bash
# Пропустить все хуки
LEFTHOOK=0 git commit -m "WIP"

# Пропустить конкретный хук
LEFTHOOK_EXCLUDE=snyk git push
```

## Производительность

| Хук | Команды | Время (параллельно) |
|-----|---------|---------------------|
| pre-commit | Biome + lint-staged | ~2-5s |
| pre-push | Snyk + Semgrep | ~10-30s |

## Troubleshooting

### Хуки не запускаются
```bash
# Переустановить хуки
npm run lefthook:uninstall
npm run lefthook:install
```

### Ошибка "command not found"
Убедитесь, что команды доступны в PATH:
```bash
which biome  # Должен вернуть путь
which snyk
```

### Медленные проверки
- Используйте `LEFTHOOK_EXCLUDE` для пропуска тяжелых команд
- Настройте `.lefthook-local.yml` для локальных переопределений

### Конфликты при merge/rebase
Хуки автоматически пропускаются при merge/rebase через `skip: [merge, rebase]`.

## Локальные переопределения

Создайте `.lefthook-local.yml` (не коммитится) для персональных настроек:

```yaml
pre-commit:
  commands:
    biome:
      skip: true  # Отключить Biome локально
```

## Интеграция с IDE

### VS Code
Хуки работают автоматически при использовании встроенного Git UI.

### WebStorm
Settings → Version Control → Commit → Before Commit → Run Git hooks

## Ссылки
- [Lefthook Docs](https://github.com/evilmartians/lefthook)
- [lint-staged](https://github.com/okonet/lint-staged)
