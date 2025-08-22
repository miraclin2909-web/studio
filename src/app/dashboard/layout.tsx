"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { BookOpenCheck, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (user.role !== 'teacher') {
    // A non-teacher has logged in, but there's no dashboard for them yet.
    // For now, let's just show a simple message.
     return (
       <div className="min-h-screen bg-background">
         <header className="bg-card shadow-sm">
           <div className="container mx-auto flex h-16 items-center justify-between px-4">
             <div className="flex items-center gap-2">
               <BookOpenCheck className="h-7 w-7 text-primary" />
               <h1 className="text-xl font-bold font-headline text-foreground">
                 Attendance Tracker
               </h1>
             </div>
             <Button variant="ghost" onClick={logout}>
               <LogOut className="mr-2 h-4 w-4" />
               Logout
             </Button>
           </div>
         </header>
         <main className="container mx-auto p-4 md:p-8">
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold">Welcome, {user.name}!</h2>
                <p className="text-muted-foreground mt-2">Student dashboard is coming soon.</p>
            </div>
         </main>
       </div>
     );
  }


  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BookOpenCheck className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold font-headline text-foreground">
              Teacher Attendance Tracker
            </h1>
          </div>
          <Button variant="ghost" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
