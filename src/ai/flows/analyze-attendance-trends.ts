'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing teacher attendance trends and flagging unusual absence patterns.
 *
 * - analyzeAttendanceTrends - A function that analyzes attendance data and identifies unusual patterns.
 * - AnalyzeAttendanceTrendsInput - The input type for the analyzeAttendanceTrends function.
 * - AnalyzeAttendanceTrendsOutput - The return type for the analyzeAttendanceTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAttendanceTrendsInputSchema = z.object({
  attendanceData: z
    .string()
    .describe(
      'A string containing attendance records for teachers, formatted as a comma-separated list of teacher IDs and attendance status (Present/Absent) pairs. Example: \'T01T001:Present,T02T002:Absent\'.' // Corrected description
    ),
});

export type AnalyzeAttendanceTrendsInput = z.infer<
  typeof AnalyzeAttendanceTrendsInputSchema
>;

const AnalyzeAttendanceTrendsOutputSchema = z.object({
  analysisResult: z
    .string()
    .describe(
      'A detailed analysis of attendance trends, highlighting any unusual absence patterns or anomalies detected in the provided attendance data.'
    ),
  flaggedAbsences: z
    .string()
    .optional()
    .describe(
      'Specific instances of unusual or unscheduled absences that require further investigation, along with reasons for flagging them.'
    ),
});

export type AnalyzeAttendanceTrendsOutput = z.infer<
  typeof AnalyzeAttendanceTrendsOutputSchema
>;

export async function analyzeAttendanceTrends(
  input: AnalyzeAttendanceTrendsInput
): Promise<AnalyzeAttendanceTrendsOutput> {
  return analyzeAttendanceTrendsFlow(input);
}

const analyzeAttendanceTrendsPrompt = ai.definePrompt({
  name: 'analyzeAttendanceTrendsPrompt',
  input: {schema: AnalyzeAttendanceTrendsInputSchema},
  output: {schema: AnalyzeAttendanceTrendsOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing teacher attendance data to identify trends and flag unusual absence patterns.

  Analyze the following attendance data and provide a detailed analysis. Highlight any unusual absence patterns or anomalies detected.

  Attendance Data: {{{attendanceData}}}

  If there are any specific instances of unusual or unscheduled absences that require further investigation, list them along with the reasons for flagging them. Otherwise, indicate that there are no flagged absences.
  Be concise and professional in your analysis.
  `,
});

const analyzeAttendanceTrendsFlow = ai.defineFlow(
  {
    name: 'analyzeAttendanceTrendsFlow',
    inputSchema: AnalyzeAttendanceTrendsInputSchema,
    outputSchema: AnalyzeAttendanceTrendsOutputSchema,
  },
  async input => {
    const {output} = await analyzeAttendanceTrendsPrompt(input);
    return output!;
  }
);
