// Temporary simplified Supabase client for debugging
export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signOut: () => Promise.resolve({ error: null }),
    signUp: () => Promise.resolve({ error: null }),
    signInWithPassword: () => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ data: { user: null } }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: () => Promise.resolve({ data: null }),
        single: () => Promise.resolve({ data: null }),
      }),
    }),
    insert: () => Promise.resolve({ error: null }),
    update: () => Promise.resolve({ error: null }),
    delete: () => Promise.resolve({ error: null }),
  }),
};