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
  attendanceData: z.array(z.object({
    teacherId: z.string(),
    status: z.string(),
  }))
    .describe(
      'An array of objects containing teacher attendance records. Each object should have a teacherId and a status (e.g., "Present" or "Absent").'
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

  Attendance Data:
  {{#each attendanceData}}
  - Teacher ID: {{teacherId}}, Status: {{status}}
  {{/each}}

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
