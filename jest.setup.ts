import '@testing-library/jest-dom';

// Mock import.meta.env for Vite environment variables
Object.defineProperty(globalThis, 'import.meta', {
  value: {
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://mock-supabase.supabase.co',
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key',
    },
  },
});