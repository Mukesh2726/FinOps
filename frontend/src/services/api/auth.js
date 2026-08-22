import { supabase } from '../supabase';

const authUnavailable = {
  message: 'Authentication is not configured. Add the Supabase variables to frontend/.env.',
};

const localGoogleUser = {
  id: 'local-google-user',
  email: 'demo@google.local',
  user_metadata: { full_name: 'Google Demo User' },
};

const LOCAL_SESSION_KEY = 'finops.local-session';

export const authApi = {
  signUp: (email, password, name) =>
    supabase
      ? supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
      : Promise.resolve({ data: null, error: authUnavailable }),

  signIn: (email, password) =>
    supabase
      ? supabase.auth.signInWithPassword({ email, password })
      : Promise.resolve({ data: null, error: authUnavailable }),

  signInWithGoogle: () =>
    supabase
      ? supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/dashboard` } })
      : Promise.resolve().then(() => {
        window.localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(localGoogleUser));
        return { data: { user: localGoogleUser }, error: null, local: true };
      }),

  signOut: () => supabase ? supabase.auth.signOut() : Promise.resolve().then(() => {
    window.localStorage.removeItem(LOCAL_SESSION_KEY);
    return { error: null };
  }),

  getSession: () => supabase
    ? supabase.auth.getSession()
    : Promise.resolve({
      data: {
        session: (() => {
          try {
            const user = JSON.parse(window.localStorage.getItem(LOCAL_SESSION_KEY));
            return user ? { user } : null;
          } catch {
            return null;
          }
        })(),
      },
      error: null,
    }),

  onAuthStateChange: (cb) => supabase
    ? supabase.auth.onAuthStateChange(cb)
    : { data: { subscription: { unsubscribe: () => {} } } },
};
