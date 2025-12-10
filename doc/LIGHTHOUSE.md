# Lighthouse CI — Автоматизация Performance Аудитов

[Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) — инструмент Google для автоматизации Lighthouse аудитов, мониторинга Core Web Vitals и контроля performance budgets в CI/CD пайплайне.

## Установка

Lighthouse CI уже установлен как dev dependency:

```bash
npm install --save-dev @lhci/cli
```

## Доступные команды

### Локальные аудиты
```bash
# Запуск аудита для всех URL из конфига
npm run lighthouse

# Desktop preset (по умолчанию)
npm run lighthouse:ci

# Мобильный аудит
npm run lighthouse:mobile

# Открыть HTML-отчет в браузере
npm run lighthouse:report
```

### Аудит конкретной страницы
```bash
# Запуск для одной страницы
lhci autorun --url=http://localhost:3000/about-aifa

# С мобильным пресетом
lhci autorun --collect.settings.preset=mobile --url=http://localhost:3000/features
```

## Конфигурация

Конфигурация находится в файле `lighthouserc.json` в корне проекта.

### Аудируемые URL (8 страниц)

1. **http://localhost:3000/** — Home page
2. **http://localhost:3000/about-aifa** — О проекте
3. **http://localhost:3000/privacy-policy** — Политика конфиденциальности
4. **http://localhost:3000/hire-me** — Страница услуг
5. **http://localhost:3000/features** — Список фич
6. **http://localhost:3000/features/parallel-routing** — Parallel routing
7. **http://localhost:3000/features/static-generation** — Static generation
8. **http://localhost:3000/features/dynamic-generation** — Dynamic generation

### Настройки сбора данных

```json
{
  "collect": {
    "startServerCommand": "npm run dev",
    "numberOfRuns": 3,
    "settings": {
      "preset": "desktop",
      "throttlingMethod": "simulate",
      "throttling": {
        "rttMs": 150,
        "throughputKbps": 1638.4,
        "cpuSlowdownMultiplier": 4
      }
    },
    "timeout": 120000
  }
}
```

**Параметры throttling**:
- **rttMs**: 150ms — имитация сетевых задержек
- **throughputKbps**: 1638.4 — ~1.6 Mbps (средний мобильный интернет)
- **cpuSlowdownMultiplier**: 4 — 4x замедление CPU

## Performance Budgets

### Бюджеты категорий

| Категория | Бюджет | Обоснование |
|-----------|--------|-------------|
| **Performance** | ≥ 90 | SSG страницы должны быть быстрыми |
| **Accessibility** | ≥ 95 | Использование shadcn/ui с a11y |
| **Best Practices** | ≥ 90 | Настроенные security headers |
| **SEO** | ≥ 95 | Приоритет SEO-оптимизации |
| **PWA** | ≥ 50 | Настроенный service worker |

### Core Web Vitals

| Метрика | Бюджет | Google "Good" |
|---------|--------|---------------|
| **FCP** (First Contentful Paint) | ≤ 1.8s | < 1.8s |
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | < 2.5s |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | < 0.1 |
| **TBT** (Total Blocking Time) | ≤ 200ms | < 200ms |
| **Speed Index** | ≤ 3.0s | < 3.0s |

### Ресурсные бюджеты

| Ресурс | Бюджет | Описание |
|--------|--------|----------|
| **Total Byte Weight** | ≤ 1 MB | Общий размер всех ресурсов |
| **DOM Size** | ≤ 1500 | Количество DOM элементов |

## Интерпретация результатов

### Категории отчета

1. **Performance** (0-100)
   - ⭐ **90-100**: Отлично
   - ⚠️ **50-89**: Требует внимания
   - ❌ **0-49**: Критично

2. **Accessibility** (0-100)
   - Проверка ARIA, контрастности, keyboard navigation
   - Семантическая разметка

3. **Best Practices** (0-100)
   - HTTPS, безопасные headers, современные API

4. **SEO** (0-100)
   - Meta теги, viewport, структурированные данные

5. **PWA** (0-100)
   - Service worker, манифест, offline готовность

### Метрики Core Web Vitals

#### FCP (First Contentful Paint)
**Время до первого контента на странице**
- Оптимизация: preload критичных ресурсов, image optimization
- Влияет на восприятие скорости загрузки

#### LCP (Largest Contentful Paint)
**Время до самого большого элемента**
- Оптимизация: оптимизация hero images, font loading
- Критично для SEO (входит в Core Web Vitals)

#### CLS (Cumulative Layout Shift)
**Суммарный сдвиг макета**
- Оптимизация: резервировать место для динамического контента
- Критично для UX

#### TBT (Total Blocking Time)
**Время блокировки главного потока**
- Оптимизация: code splitting, уменьшение JavaScript
- Влияет на интерактивность

#### Speed Index
**Скорость заполнения видимой области**
- Оптимизация: lazy loading, critical CSS

## Рекомендации по использованию

### Перед релизом

1. **Запустить desktop аудит**
   ```bash
   npm run lighthouse:ci
   ```

2. **Проверить все URL**
   - Убедиться что все 8 страниц проходят бюджеты
   - Особое внимание к FCP, LCP, CLS

3. **Сравнить с предыдущими результатами**
   ```bash
   # Сохранить предыдущий отчет
   cp .lighthouseci/*-report.json ./lighthouse-baseline.json

   # Запустить новый
   npm run lighthouse

   # Сравнить (вручную)
   ```

### A/B тестирование оптимизаций

```bash
# Запустить для ветки с оптимизацией
git checkout feature/optimize-images
npm run lighthouse

# Сравнить с baseline
git checkout main
npm run lighthouse

# Принять решение на основе результатов
```

### Мониторинг трендов

- Ведить журнал результатов в JSON
- Строить графики изменений метрик
- Настраивать алерты при ухудшении

## Оптимизация производительности

### Улучшение LCP

```typescript
// Оптимизация hero image
<img
  src="/hero.webp"
  alt="Hero"
  width="1920"
  height="1080"
  loading="eager"
  fetchpriority="high"
/>

// Предзагрузка критичных ресурсов
<link rel="preload" href="/critical.css" as="style">
```

### Улучшение CLS

```typescript
// Резервировать место для динамического контента
<div style={{ height: '200px' }}>
  {content ? <DynamicContent /> : <Skeleton />}
</div>

// Указывать размеры изображений
<img width="100" height="100" />
```

### Улучшение FCP

```typescript
// Критичный CSS inline
<style>{`critical styles here`}</style>

// Предзагрузка шрифтов
<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>
```

### Уменьшение TBT

```typescript
// Code splitting
const HeavyComponent = dynamic(() => import('./HeavyComponent'));

// Lazy loading вне экрана
<LazyComponent loading={<Spinner />} />
```

## Интеграция с CI/CD (Phase 10)

В будущем планируется автоматизация в GitHub Actions:

```yaml
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v10
  with:
    configPath: './lighthouserc.json'
    uploadArtifacts: true
    temporaryPublicStorage: true
```

### Автоматические проверки

- **На PR**: Блокировка merge при ухудшении метрик
- **На master**: Сохранение baseline
- **Еженедельно**: Мониторинг трендов

## Часто задаваемые вопросы

### Почему Performance < 90?

**Возможные причины**:

1. **Большой бандл**
   ```bash
   # Проверить размеры
   npm run analyze
   ```

2. **Неоптимизированные изображения**
   ```bash
   # Использовать next/image
   import Image from 'next/image'
   ```

3. **Блокирующие ресурсы**
   ```bash
   # Проверить в Network tab
   # Синхронные скрипты, CSS блокируют рендеринг
   ```

4. **Медленный сервер**
   - Проверить TTFB (Time to First Byte)
   - Оптимизировать SSR/SSG

### Как улучшить LCP?

**Стратегии**:

1. **Оптимизировать hero image**
   ```typescript
   <Image
     src="/hero.webp"
     alt="Hero"
     width={1920}
     height={1080}
     priority
     sizes="100vw"
     style={{ width: '100%', height: 'auto' }}
   />
   ```

2. **Предзагрузить критичные ресурсы**
   ```html
   <link rel="preload" href="/hero.webp" as="image">
   ```

3. **Уменьшить серверное время**
   - Оптимизировать запросы к БД
   - Использовать кэширование

### Почему CLS высокий?

**Причины**:

1. **Динамический контент без резервирования**
   ```typescript
   // ❌ Плохо
   {showBanner && <Banner />}

   // ✅ Хорошо
   <div style={{ height: showBanner ? '60px' : '0' }}>
     {showBanner && <Banner />}
   </div>
   ```

2. **Реклама/виджеты без размеров**
   ```html
   <div id="ad" style="min-height: 250px;"></div>
   ```

3. **Шрифты без fallback**
   ```css
   body {
     font-family: 'Inter', system-ui, sans-serif;
   }
   ```

## Устранение неполадок

### "Port 3000 already in use"

```bash
# Остановить процесс на порту 3000
lsof -ti:3000 | xargs kill -9

# Или использовать другой порт
npm run dev -- --port 3001

# И обновить lighthouserc.json
```

### Timeout errors

```json
{
  "collect": {
    "timeout": 300000  // Увеличить до 5 минут
  }
}
```

### Inconsistent results

```json
{
  "collect": {
    "numberOfRuns": 5  // Увеличить до 5 запусков
  }
}
```

### "Failed to start server"

```bash
# Проверить что dev server запускается
npm run dev

# И в отдельном терминале
npm run lighthouse
```

## Ссылки

- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Core Web Vitals](https://web.dev/vitals/#core-web-vitals)
- [Lighthouse Scoring](https://developer.chrome.com/docs/lighthouse/performance/)

## Примеры использования

### Аудит конкретной страницы

```bash
# Запуск для одной страницы
lhci autorun --url=http://localhost:3000/about-aifa

# С мобильным пресетом
lhci autorun --collect.settings.preset=mobile --url=http://localhost:3000/features

# С дополнительными настройками
lhci autorun --collect.numberOfRuns=5 --assert.assertions.performance=0.95
```

### Экспорт результатов

```bash
# JSON отчет
lhci autorun --upload.target=filesystem --upload.outputDir=./reports

# Временное хранилище (для просмотра)
lhci autorun --upload.target=temporary-public-storage
```

### Сравнение desktop vs mobile

```bash
# Desktop
npm run lighthouse:ci

# Mobile
npm run lighthouse:mobile

# Сравнить результаты
diff .lighthouseci/*desktop*.json .lighthouseci/*mobile*.json
```

## Связанная документация

- **[BUNDLE_ANALYZER.md](./BUNDLE_ANALYZER.md)** — Анализ размеров бандлов
- **[PLAYWRIGHT.md](./PLAYWRIGHT.md)** — E2E тесты
- **[VITEST.md](./VITEST.md)** — Unit тесты
- **[PERFORMANCE_WORKFLOW.md](./PERFORMANCE_WORKFLOW.md)** — Комплексный workflow