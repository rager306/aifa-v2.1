# Next.js Bundle Analyzer

[@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer) — официальный плагин Next.js для визуального анализа размеров бандлов, выявления дубликатов зависимостей и оптимизации tree-shaking.

## Установка

Bundle Analyzer уже установлен как dev dependency:

```bash
npm install --save-dev @next/bundle-analyzer
```

## Доступные команды

### Анализ бандлов
```bash
# Анализ клиентского бандла (по умолчанию)
npm run analyze

# Анализ серверного бандла
npm run analyze:server

# Анализ обоих бандлов (клиент + сервер)
npm run analyze:both
```

### Интерпретация результатов

После запуска `npm run analyze` автоматически откроется интерактивная визуализация в браузере с интерактивным treemap:

- **Размеры модулей**: Отображаются в KB/MB с gzipped размером
- **Цветовая кодировка**: Красный = большие модули, зеленый = маленькие
- **Кликабельные узлы**: Можно разворачивать/сворачивать для детального анализа
- **Hover информация**: Показывает точные размеры и зависимости

## Конфигурация

Настройки находятся в `next.config.mjs`:

```javascript
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',  // Активация через ANALYZE=true
  openAnalyzer: true,                       // Автоматически открывать в браузере
});
```

**Важно**: Bundle Analyzer активируется только при `ANALYZE=true`, что позволяет:
- Избегать overhead в production билдах
- Запускать анализ только по необходимости
- Использовать в CI/CD через переменные окружения

## Интерпретация результатов

### Что искать в treemap

1. **Дубликаты библиотек**
   - Поиск: несколько версий одной библиотеки (например, `react`, `react-dom`)
   - Решение: проверить `package.json`, обновить зависимости

2. **Неиспользуемые зависимости**
   - Поиск: большие библиотеки, которые импортируются, но не используются
   - Решение: запустить `npm run knip` для выявления

3. **Большие модули (>200 KB gzipped)**
   - Поиск: критически большие чанки
   - Решение: code splitting, dynamic imports, замена на lighter альтернативы

4. **Framework overhead**
   - Ожидаемо: React (~100 KB), Next.js (~50 KB), Radix UI компоненты (~20-50 KB)

### Оптимизация

#### Code Splitting
```typescript
// Вместо статического импорта
import HeavyComponent from './HeavyComponent';

// Использовать динамический импорт
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Loading />,
  ssr: false  // Если компонент не требует SSR
});
```

#### Tree-shaking
```typescript
// ❌ Неправильно: импорт всей библиотеки
import _ from 'lodash';

// ✅ Правильно: импорт конкретной функции
import debounce from 'lodash/debounce';
```

#### Замена тяжелых библиотек
- `moment` → `date-fns` или `dayjs`
- `lodash` → нативные методы или `es-toolkit`
- `classnames` → `clsx` или `tailwind-merge`

## Рекомендации по использованию

### Перед добавлением новой зависимости
1. Запустить `npm run analyze` для получения baseline
2. Добавить зависимость
3. Снова запустить `npm run analyze` и сравнить
4. Если рост >10% — исследовать причины

### Перед релизом
1. Проверить финальный размер бандла
2. Убедиться в отсутствии критических проблем
3. Зафиксировать метрики в документации

### Мониторинг трендов
- Сохранять скриншоты treemap для сравнения
- Ведить журнал изменений размеров
- Использовать Vercel Analytics для отслеживания в production

## Интеграция с Vercel

Vercel автоматически интегрируется с Bundle Analyzer:

- **PR Comments**: Автоматические комментарии с изменением размеров бандлов
- **Deploy Preview**: Сравнение с предыдущим деплоем
- **Bundle Size Tracking**: История изменений в дашборде

### Активация в Vercel
1. Перейти в Project Settings → Functions
2. Включить "Bundle Analyzer" (если доступно)
3. Или использовать environment variable `ANALYZE=true` для конкретного билда

## Часто задаваемые вопросы

### Почему бандл такой большой?

**Возможные причины**:
1. **node_modules**: Сторонние библиотеки могут составлять 50-70% размера
2. **Статические ресурсы**: Изображения, шрифты, видео
3. **Неоптимальные импорты**: Импорт целых библиотек вместо конкретных функций

**Решение**:
```bash
# Проверить неиспользуемые зависимости
npm run knip

# Проанализировать конкретный чанк
npm run analyze

# Сравнить с предыдущей версией
npm run analyze:both
```

### Как уменьшить размер бандла?

**Стратегии оптимизации**:
1. **Удалить неиспользуемый код**: `npm run knip:report`
2. **Динамические импорты**: для тяжелых компонентов
3. **Bundle splitting**: разнести код на несколько чанков
4. **Lazy loading**: загружать компоненты по требованию
5. **Замена библиотек**: на lighter альтернативы

### Анализатор не открывается

**Решение**:
```bash
# Проверить настройки в next.config.mjs
openAnalyzer: true  # Должно быть true

# Запустить вручную
npm run analyze && open .next/analyze/index.html
```

## Устранение неполадок

### Ошибка "Cannot find module '@next/bundle-analyzer'"

```bash
# Переустановить зависимости
npm install

# Или установить явно
npm install --save-dev @next/bundle-analyzer
```

### Bundle Analyzer зависает

```bash
# Увеличить timeout
ANALYZE=true ANALYZE_TIMEOUT=300000 npm run build

# Или анализировать только клиентский бандл
npm run analyze
```

### Неточные размеры

**Причины**:
- Turbopack vs Webpack различия
- Development vs Production сборки

**Решение**:
```bash
# Использовать production build
ANALYZE=true npm run build

# Сравнить client и server отдельно
npm run analyze:server
npm run analyze
```

## Ссылки

- [Официальная документация @next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Next.js Optimizing Bundle Size](https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Lighthouse Performance](https://web.dev/performance/)

## Примеры использования

### Анализ конкретной страницы

```bash
# Сначала создать production build
npm run build

# Затем запустить анализ
ANALYZE=true npm run start &
ANALYZE=true npm run analyze

# Открыть отчет
open .next/analyze/index.html
```

### Сравнение размеров между ветками

```bash
# Ветка feature
git checkout feature-branch
npm run analyze

# Ветка main
git checkout main
npm run analyze

# Сравнить .next/analyze/index.html
```

### Экспорт результатов

```bash
# Получить JSON отчет
npm run analyze -- --json > bundle-report.json

# Импорт в Excel/Google Sheets
# Для анализа трендов и построения графиков
```

## Связанная документация

- **[LIGHTHOUSE.md](./LIGHTHOUSE.md)** — Мониторинг производительности
- **[RENOVATE.md](./RENOVATE.md)** — Отслеживание размеров при обновлениях
- **[PERFORMANCE_WORKFLOW.md](./PERFORMANCE_WORKFLOW.md)** — Комплексный workflow оптимизации