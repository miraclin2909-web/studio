"use server";

import { analyzeAttendanceTrends } from "@/ai/flows/analyze-attendance-trends";
import type { AnalyzeAttendanceTrendsOutput } from "@/ai/flows/analyze-attendance-trends";

type AttendanceRecord = {
  teacherId: string;
  status: string;
}

export async function runAnalysis(
  attendanceData: AttendanceRecord[]
): Promise<AnalyzeAttendanceTrendsOutput> {
  try {
    const result = await analyzeAttendanceTrends({ attendanceData });
    return result;
  } catch (error) {
    console.error("Error in AI analysis:", error);
    throw new Error("Failed to analyze attendance data.");
  }
}
