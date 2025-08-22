"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";


type User = {
  id: string; // This will be the Firebase UID
  name: string;
  role: 'teacher' | 'student';
  customId: string; // This is the original ID like T01T001
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (id: string, name: string) => Promise<void>;
  logout: () => void;
  register: (id: string, name: string, role: 'teacher' | 'student') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to create an email from ID
const createEmailFromId = (id: string) => `${id}@teacher-attendance-track-3o694.web.app`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
        } else {
          // Handle case where user exists in Auth but not Firestore
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (id: string, name: string) => {
    // In Firebase, password cannot be empty. We'll use the name as the password.
    // This is not secure for a real app, but works for this demo.
    const email = createEmailFromId(id);
    const password = name; 

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
    if (userDoc.exists()) {
        const userData = userDoc.data();
        if(userData.name.toLowerCase() === name.toLowerCase()) {
            setUser({ id: firebaseUser.uid, ...userData } as User);
        } else {
            await signOut(auth);
            throw new Error("Invalid Name. Please try again.");
        }
    } else {
      await signOut(auth);
      throw new Error("User data not found in database.");
    }
  };
  
  const register = async (id: string, name: string, role: 'teacher' | 'student') => {
    // Check if a user with that custom ID already exists in Firestore
    const userDocSnap = await getDoc(doc(db, "users_by_custom_id", id.toLowerCase()));
    if (userDocSnap.exists()) {
        throw new Error("User with this ID already exists.");
    }

    const email = createEmailFromId(id);
    const password = name; // Using name as password

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const newUser: Omit<User, 'id'> = { customId: id, name, role };
    
    // Store user details in Firestore, keyed by Firebase UID
    await setDoc(doc(db, "users", firebaseUser.uid), newUser);
    // Store a mapping from custom ID to Firebase UID for lookup
    await setDoc(doc(db, "users_by_custom_id", id.toLowerCase()), { uid: firebaseUser.uid });

    // After registration, sign them out so they can log in
    await signOut(auth);
  };


  const logout = async () => {
    await signOut(auth);
    setUser(null);
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
