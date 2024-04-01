// src/__mocks__/supabaseClient.ts
export const supabase = {
  auth: {
    signInWithPassword: jest.fn(() =>
      Promise.resolve({
        user: { id: "user-id" },
        session: "session-id",
        error: null,
      })
    ),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
  // Add more mocked functions as needed for your tests
};
