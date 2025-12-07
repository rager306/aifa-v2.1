# План интеграции MiniMax вместо ChatGPT

## 📋 Анализ текущего состояния

### Установленные зависимости:
- ✅ `@ai-sdk/react`: "^2.0.87"
- ✅ `ai`: "^5.0.87"

### Текущее состояние:
- ❌ Нет реальной интеграции с OpenAI API
- ✅ UI компоненты для чата уже готовы
- ✅ Демонстрационные данные в `chat-example.tsx`

---

## 🎯 План интеграции MiniMax

### Этап 1: Настройка окружения

#### 1.1 Переменные окружения
```bash
# Добавить в .env.local
OPENAI_BASE_URL=https://api.minimax.io/v1
OPENAI_API_KEY=your_minimax_api_key_here
```

#### 1.2 Обновление package.json
```json
{
  "dependencies": {
    "openai": "^4.0.0"
  }
}
```

### Этап 2: Создание API роутов

#### 2.1 Создать `/app/api/chat/route.ts`
```typescript
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('MiniMax-M2'),
    messages,
    temperature: 1.0,
    maxTokens: 4000,
  });

  return result.toAIStreamResponse();
}
```

#### 2.2 Создать `/app/api/completion/route.ts`
```typescript
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = await streamText({
    model: openai('MiniMax-M2'),
    prompt,
    temperature: 1.0,
    maxTokens: 4000,
  });

  return result.toAIStreamResponse();
}
```

### Этап 3: Создание провайдера MiniMax

#### 3.1 Создать `/lib/minimax-provider.tsx`
```typescript
'use client';

import { createOpenAI } from '@ai-sdk/openai';
import { AIProvider } from '@ai-sdk/react';

const openai = createOpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.NEXT_PUBLIC_OPENAI_BASE_URL || process.env.OPENAI_BASE_URL,
});

export function MiniMaxProvider({ children }: { children: React.ReactNode }) {
  return (
    <AIProvider
      apiKey={process.env.NEXT_PUBLIC_OPENAI_API_KEY}
      baseURL={process.env.NEXT_PUBLIC_OPENAI_BASE_URL}
    >
      {children}
    </AIProvider>
  );
}
```

### Этап 4: Обновление компонентов

#### 4.1 Создать `/components/chat/chat-minimax.tsx`
```typescript
'use client';

import { useChat } from '@ai-sdk/react';

export default function ChatMiniMax() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
  } = useChat({
    api: '/api/chat',
    body: {
      model: 'MiniMax-M2',
    },
  });

  return (
    <div className="chat-container">
      {/* UI компоненты для отображения чата */}
    </div>
  );
}
```

#### 4.2 Обновить `/components/ai-elements/prompt-input.tsx`
- Изменить модель по умолчанию с `gpt-4` на `MiniMax-M2`
- Обновить список доступных моделей

### Этап 5: Обновление демонстрационных данных

#### 5.1 Обновить `/components/chat-example/chat-example.tsx`
```typescript
// Заменить упоминания OpenAI на MiniMax
const initialMessages = [
  {
    key: nanoid(),
    from: "user",
    versions: [
      {
        id: nanoid(),
        content: "Can you explain how to use MiniMax effectively?",
      },
    ],
    avatar: "https://github.com/minimax-ai.png",
    name: "MiniMax AI",
  },
  // ...
];
```

### Этап 6: Обновление документации

#### 6.1 Обновить README.md
- Удалить упоминания ChatGPT
- Добавить инструкции по настройке MiniMax
- Добавить примеры использования

#### 6.2 Обновить `/app/@rightStatic/(_PUBLIC)/(_HOME)/hire-me/page.tsx`
- Заменить список "OpenAI" на "MiniMax"

### Этап 7: Тестирование

#### 7.1 Проверка API
```bash
# Тест API роутов
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello MiniMax"}]}'
```

#### 7.2 Проверка UI
- Запуск dev сервера: `npm run dev`
- Проверка работы чата
- Проверка streaming ответов
- Проверка reasoning details (если включено)

---

## ⚙️ Конфигурация MiniMax

### Модели для использования:
1. **MiniMax-M2** - для обычных задач
2. **MiniMax-M2-Stable** - для production с высокой нагрузкой

### Особенности:
- ✅ Совместимость с OpenAI SDK
- ✅ Поддержка reasoning details
- ✅ Stream ответы
- ✅ Temperature диапазон: (0.0, 1.0]
- ❌ Не поддерживает image/audio входы
- ❌ Не поддерживает presence_penalty, frequency_penalty, logit_bias

---

## 📦 Файлы для изменения/создания

### Новые файлы:
1. `/app/api/chat/route.ts`
2. `/app/api/completion/route.ts`
3. `/lib/minimax-provider.tsx`
4. `/components/chat/chat-minimax.tsx`

### Файлы для изменения:
1. `.env.local` - добавить переменные окружения
2. `package.json` - добавить openai
3. `app/layout.tsx` - обернуть в MiniMaxProvider
4. `components/chat-example/chat-example.tsx` - обновить демо данные
5. `components/ai-elements/prompt-input.tsx` - изменить модель по умолчанию
6. `README.md` - обновить документацию

---

## 🚀 Последовательность выполнения

1. ✅ Настроить переменные окружения
2. ✅ Установить зависимости
3. ✅ Создать API роуты
4. ✅ Создать провайдер
5. ✅ Обновить UI компоненты
6. ✅ Обновить демо данные
7. ✅ Обновить документацию
8. ✅ Протестировать интеграцию
9. ✅ Зафиксировать в git

---

## 🔍 Возможные проблемы

### Проблема 1: API Key
- **Решение**: Убедиться, что API key валидный и имеет права доступа

### Проблема 2: Base URL
- **Решение**: Проверить правильность URL для региона (Китай vs международный)

### Проблема 3: Streaming
- **Решение**: Убедиться, что клиент корректно обрабатывает stream

### Проблема 4: Reasoning Details
- **Решение**: Опционально включать через `extra_body.reasoning_split: true`

---

## 📊 Преимущества MiniMax

1. **Совместимость с OpenAI API** - легкая миграция
2. **РеASONING** - встроенная способность к рассуждению
3. **Быстрый отклик** - оптимизированная производительность
4. **Стабильность** - модель MiniMax-M2-Stable для production

---

## 📝 Следующие шаги

1. Получить API key от MiniMax
2. Выполнить этапы интеграции по порядку
3. Протестировать все функции
4. Обновить документацию
5. Развернуть в production
