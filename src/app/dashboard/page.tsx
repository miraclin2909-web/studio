"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { runAnalysis } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ThumbsUp, ThumbsDown, Bot, AlertCircle, BarChart, Users, Percent } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs, query, where } from "firebase/firestore";


type AttendanceStatus = "Present" | "Absent";
type AttendanceRecord = {
    date: string;
    status: AttendanceStatus;
}
type AttendanceData = {
  [key: string]: AttendanceRecord[];
};
type AnalysisResult = {
  analysisResult: string;
  flaggedAbsences?: string;
} | null;

const REQUIRED_ATTENDANCE_PERCENTAGE = 90;

export default function DashboardPage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceData>({});
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResult>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [teacherAttendancePercentage, setTeacherAttendancePercentage] = useState<number | null>(null);

  const fetchAttendance = useCallback(async () => {
    if(!user) return;
    const attendanceCol = collection(db, `users/${user.id}/attendance`);
    const attendanceSnapshot = await getDocs(attendanceCol);
    const history: AttendanceRecord[] = attendanceSnapshot.docs.map(d => d.data() as AttendanceRecord);
    history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const teacherHistory = { [user.id]: history };
    setAttendance(teacherHistory);
    calculateTeacherPercentage(history);

    // Also fetch other teachers' latest status for analysis
    const allTeachersQuery = query(collection(db, 'users'), where('role', '==', 'teacher'));
    const allTeachersSnapshot = await getDocs(allTeachersQuery);
    
    let fullAttendanceData: AttendanceData = { [user.id]: history };

    for(const teacherDoc of allTeachersSnapshot.docs) {
        if (teacherDoc.id === user.id) continue;
        const teacherData = teacherDoc.data();
        const customId = teacherData.customId;
        const otherAttendanceCol = collection(db, `users/${teacherDoc.id}/attendance`);
        const otherAttendanceSnapshot = await getDocs(otherAttendanceCol);
        const otherHistory: AttendanceRecord[] = otherAttendanceSnapshot.docs.map(d => d.data() as AttendanceRecord);
        otherHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        fullAttendanceData[customId] = otherHistory;
    }
     handleAnalyzeAttendance(fullAttendanceData);

  }, [user]);

  const calculateTeacherPercentage = (history: AttendanceRecord[]) => {
    const totalDays = history.length;
    if (totalDays === 0) {
      setTeacherAttendancePercentage(null);
      return;
    }
    const presentDays = history.filter(status => status.status === "Present").length;
    const percentage = (presentDays / totalDays) * 100;
    setTeacherAttendancePercentage(percentage);
  };

  const handleAnalyzeAttendance = useCallback(async (currentAttendance: AttendanceData) => {
    if(!user) return;
    setIsLoadingAi(true);
    setAiAnalysis(null);
    try {
      const attendanceForAnalysis = Object.entries(currentAttendance)
        .map(([id, history]) => {
            if(history.length === 0) return null;
            const latestStatus = history[history.length -1];
            return {teacherId: id, status: latestStatus.status};
        }).filter(Boolean);

      if (attendanceForAnalysis.length > 0) {
        // @ts-ignore
        const result = await runAnalysis(attendanceForAnalysis);
        setAiAnalysis(result);
      }
    } catch (error) {
      console.error("AI Analysis failed", error);
    } finally {
      setIsLoadingAi(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleSetAttendance = async (status: AttendanceStatus) => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const newRecord: AttendanceRecord = { date: today, status };

    // Update DB
    await setDoc(doc(db, `users/${user.id}/attendance`, today), newRecord);

    // Update state
    fetchAttendance();
  };

  const userHistory = user ? attendance[user.id] || [] : [];
  const todayEntry = userHistory.find(r => r.date === new Date().toISOString().split('T')[0]);
  const currentStatus = todayEntry?.status;


  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-headline text-foreground">
          Welcome, {user?.name}!
        </h2>
        <Link href="/dashboard/students" passHref>
            <Button>
                <Users className="mr-2 h-5 w-5" />
                View Students
            </Button>
        </Link>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-6 w-6 text-primary" />
              Your Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-6 bg-muted rounded-lg">
              <p className="text-lg text-muted-foreground">Today&apos;s Status:</p>
              <p
                className={`text-4xl font-bold ${
                  currentStatus === "Present"
                    ? "text-primary"
                    : currentStatus === "Absent"
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {currentStatus || "Not Marked"}
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                onClick={() => handleSetAttendance("Present")}
                disabled={currentStatus === "Present"}
              >
                <ThumbsUp className="mr-2 h-5 w-5" /> Mark Present
              </Button>
              <Button
                size="lg"
                variant="destructive"
                onClick={() => handleSetAttendance("Absent")}
                disabled={currentStatus === "Absent"}
              >
                <ThumbsDown className="mr-2 h-5 w-5" /> Mark Absent
              </Button>
            </div>
             {teacherAttendancePercentage !== null && (
                <div className="pt-4 space-y-2">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold flex items-center gap-2"><Percent className="h-5 w-5 text-primary" /> Attendance Rate</h4>
                        <span className="font-bold text-lg text-primary">{teacherAttendancePercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={teacherAttendancePercentage} aria-label={`${teacherAttendancePercentage.toFixed(1)}% Attendance`} />
                    <p className="text-sm text-muted-foreground text-center">Required attendance is {REQUIRED_ATTENDANCE_PERCENTAGE}%. Keep it up!</p>
                </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              AI-Powered Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAi && (
              <div className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            )}
            {aiAnalysis && !isLoadingAi && (
              <div className="space-y-4">
                <Alert>
                  <AlertTitle className="font-semibold">Trend Analysis</AlertTitle>
                  <AlertDescription>
                    {aiAnalysis.analysisResult}
                  </AlertDescription>
                </Alert>
                {aiAnalysis.flaggedAbsences && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Flagged Absences</AlertTitle>
                    <AlertDescription>
                      {aiAnalysis.flaggedAbsences}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            {!aiAnalysis && !isLoadingAi && (
                 <div className="text-center text-muted-foreground py-8">
                    <p>Mark your attendance to generate an analysis.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
