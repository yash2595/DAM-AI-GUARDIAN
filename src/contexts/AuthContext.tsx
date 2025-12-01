import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: string;
  phone?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Partial<User> & { email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo accounts
const demoAccounts = [
  {
    id: '1',
    email: 'admin@dam.com',
    password: 'demo123',
    name: 'Sachin Agarwal',
    role: 'Project Guide',
    organization: 'IMS Engineering College',
  },
  {
    id: '2',
    email: 'engineer@dam.com',
    password: 'demo123',
    name: 'Rajesh Kumar',
    role: 'Safety Engineer',
    organization: 'Central Water Commission',
  },
  {
    id: '3',
    email: 'viewer@dam.com',
    password: 'demo123',
    name: 'Priya Sharma',
    role: 'Government Official',
    organization: 'Ministry of Water Resources',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('dam_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check demo accounts
    const account = demoAccounts.find(
      (acc) => acc.email === email && acc.password === password
    );

    if (account) {
      const user: User = {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
        organization: account.organization,
      };
      setCurrentUser(user);
      localStorage.setItem('dam_user', JSON.stringify(user));
      return true;
    }

    // Check if user exists in localStorage (for signup users)
    const users = JSON.parse(localStorage.getItem('dam_users') || '[]');
    const existingUser = users.find(
      (u: any) => u.email === email && u.password === password
    );

    if (existingUser) {
      const user: User = {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        organization: existingUser.organization,
        phone: existingUser.phone,
      };
      setCurrentUser(user);
      localStorage.setItem('dam_user', JSON.stringify(user));
      return true;
    }

    return false;
  };

  const signup = async (userData: Partial<User> & { email: string; password: string }): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('dam_users') || '[]');
    
    // Check if email already exists
    if (users.some((u: any) => u.email === userData.email)) {
      return false;
    }

    const newUser = {
      id: Date.now().toString(),
      ...userData,
    };

    users.push(newUser);
    localStorage.setItem('dam_users', JSON.stringify(users));

    const user: User = {
      id: newUser.id,
      name: newUser.name || '',
      email: newUser.email,
      role: newUser.role || 'User',
      organization: newUser.organization,
      phone: newUser.phone,
    };

    setCurrentUser(user);
    localStorage.setItem('dam_user', JSON.stringify(user));
    // Try to notify a backend (if configured) so signups are recorded server-side (e.g., in a CSV)
    try {
      const signupEndpoint = (import.meta as any).env.VITE_SIGNUP_ENDPOINT;
      const signupKey = (import.meta as any).env.VITE_SIGNUP_API_KEY || (import.meta as any).env.VITE_ALERT_API_KEY;
      if (signupEndpoint) {
        const payload = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          organization: newUser.organization,
          phone: newUser.phone,
          createdAt: new Date().toISOString(),
        };

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (signupKey) headers['x-api-key'] = signupKey;

        // Fire-and-forget; do not fail signup if backend is unreachable
        fetch(signupEndpoint, { method: 'POST', headers, body: JSON.stringify(payload) }).catch((err) => {
          // eslint-disable-next-line no-console
          console.warn('Failed to POST signup to backend:', err?.message ?? err);
        });
      }
    } catch (err) {
      // ignore
    }

    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dam_user');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      localStorage.setItem('dam_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
