"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  role: 'teacher' | 'student';
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (id: string, name: string) => Promise<void>;
  logout: () => void;
  register: (id: string, name: string, role: 'teacher' | 'student') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getStoredUsers = useCallback(() => {
    try {
      const storedUsers = localStorage.getItem("users");
      if (storedUsers) {
        return JSON.parse(storedUsers);
      }
    } catch (error) {
      console.error("Failed to parse users from localStorage", error);
    }
    return [];
  }, []);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (id: string, name: string) => {
    const storedUsers = getStoredUsers();
    const foundUser = storedUsers.find(
      (u: User) => u.id.toLowerCase() === id.toLowerCase() && u.name.toLowerCase() === name.toLowerCase()
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem("user", JSON.stringify(foundUser));
    } else {
      throw new Error("Invalid ID or Name. Please try again or register.");
    }
  };
  
  const register = async (id: string, name: string, role: 'teacher' | 'student') => {
    const storedUsers = getStoredUsers();
    const existingUser = storedUsers.find((u: User) => u.id.toLowerCase() === id.toLowerCase());

    if(existingUser) {
        throw new Error("User with this ID already exists.");
    }

    const newUser: User = { id, name, role };
    const updatedUsers = [...storedUsers, newUser];
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };


  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("teacher_attendance_history");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
