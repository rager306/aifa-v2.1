'use client';

// lib/minimax-provider.tsx

import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.NEXT_PUBLIC_OPENAI_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.minimax.io/v1',
});

export function MiniMaxProvider({ children }: { children: React.ReactNode }) {
  // MiniMax provider - useChat hooks work without a provider in this version
  return children;
}

export { openai };
