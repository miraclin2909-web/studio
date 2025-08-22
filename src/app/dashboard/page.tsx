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

type AttendanceStatus = "Present" | "Absent";
type AttendanceData = {
  [key: string]: AttendanceStatus[];
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

  const fetchAttendance = useCallback(() => {
    const storedAttendance = localStorage.getItem("teacher_attendance_history");
    if (storedAttendance) {
      const parsedAttendance = JSON.parse(storedAttendance);
      setAttendance(parsedAttendance);
      if (user && parsedAttendance[user.id]) {
        calculateTeacherPercentage(parsedAttendance[user.id]);
      }
    }
  }, [user]);

  const calculateTeacherPercentage = (history: AttendanceStatus[]) => {
    const totalDays = history.length;
    if (totalDays === 0) {
      setTeacherAttendancePercentage(null);
      return;
    }
    const presentDays = history.filter(status => status === "Present").length;
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
            const latestStatus = history[history.length -1];
            return {teacherId: id, status: latestStatus};
        });

      if (attendanceForAnalysis.length > 0) {
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

  const handleSetAttendance = (status: AttendanceStatus) => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const userHistory = attendance[user.id] || [];

    // For simplicity, we assume one entry per day.
    // In a real app, you'd check if an entry for today already exists.
    const updatedHistory = [...userHistory, status];
    const updatedAttendance = { ...attendance, [user.id]: updatedHistory };

    setAttendance(updatedAttendance);
    localStorage.setItem("teacher_attendance_history", JSON.stringify(updatedAttendance));
    calculateTeacherPercentage(updatedHistory);
    handleAnalyzeAttendance(updatedAttendance);
  };

  const currentStatus = user ? attendance[user.id]?.[attendance[user.id].length -1] : undefined;

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
              <p className="text-lg text-muted-foreground">Current Status:</p>
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
              >
                <ThumbsUp className="mr-2 h-5 w-5" /> Mark Present
              </Button>
              <Button
                size="lg"
                variant="destructive"
                onClick={() => handleSetAttendance("Absent")}
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
