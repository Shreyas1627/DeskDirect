import { useState, useCallback } from 'react';

const STORAGE_KEY = 'dd_user';

export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  /**
   * Login — saves user profile matching the DB schema:
   * { user_id, name, department, desk_number, avatar_url }
   */
  const login = useCallback((profile) => {
    const user = {
      user_id:      profile.user_id || crypto.randomUUID(),
      name:         profile.name.trim(),
      department:   profile.department.trim(),
      desk_number:  profile.desk_number.trim(),
      avatar_url:   profile.avatar_url?.trim() || null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  // Initials for avatar fallback
  const initials = user
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return { user, login, logout, initials };
}
