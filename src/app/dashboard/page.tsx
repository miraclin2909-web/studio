"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { runAnalysis } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ThumbsUp, ThumbsDown, Bot, AlertCircle, BarChart, Users } from "lucide-react";
import Link from "next/link";

type AttendanceStatus = "Present" | "Absent";
type AttendanceData = {
  [key: string]: AttendanceStatus;
};
type AnalysisResult = {
  analysisResult: string;
  flaggedAbsences?: string;
} | null;

export default function DashboardPage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceData>({});
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResult>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const fetchAttendance = useCallback(() => {
    const storedAttendance = localStorage.getItem("attendance");
    if (storedAttendance) {
      setAttendance(JSON.parse(storedAttendance));
    }
  }, []);

  const handleAnalyzeAttendance = useCallback(async (currentAttendance: AttendanceData) => {
    setIsLoadingAi(true);
    setAiAnalysis(null);
    try {
      const attendanceString = Object.entries(currentAttendance)
        .map(([id, status]) => `${id}:${status}`)
        .join(",");

      if (attendanceString) {
        const result = await runAnalysis(attendanceString);
        setAiAnalysis(result);
      }
    } catch (error) {
      console.error("AI Analysis failed", error);
    } finally {
      setIsLoadingAi(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleSetAttendance = (status: AttendanceStatus) => {
    if (!user) return;
    const updatedAttendance = { ...attendance, [user.id]: status };
    setAttendance(updatedAttendance);
    localStorage.setItem("attendance", JSON.stringify(updatedAttendance));
    handleAnalyzeAttendance(updatedAttendance);
  };

  const currentStatus = user ? attendance[user.id] : undefined;

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
