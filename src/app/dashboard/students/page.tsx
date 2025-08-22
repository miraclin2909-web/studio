"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, CheckCircle, XCircle, Clock, Percent, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export type AttendanceRecord = {
    date: string;
    status: "Present" | "Absent" | "Tardy";
};

export type Student = {
    id: string; // Firebase UID
    customId: string;
    name: string;
    grade: string;
    teacherId: string; // This is the custom ID of the teacher
    attendance: AttendanceRecord[];
};

const REQUIRED_STUDENT_ATTENDANCE = 85;

export default function StudentsPage() {
    const { user } = useAuth();
    const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStudents = useCallback(async () => {
        if (user && user.role === 'teacher') {
            setLoading(true);
            try {
                const q = query(collection(db, "users"), where("role", "==", "student"), where("teacherId", "==", user.customId));
                const querySnapshot = await getDocs(q);
                
                const studentsData: Student[] = [];
                for(const userDoc of querySnapshot.docs) {
                    const studentData = userDoc.data();
                    
                    const attendanceCol = collection(db, `users/${userDoc.id}/attendance`);
                    const attendanceSnapshot = await getDocs(attendanceCol);
                    const attendance: AttendanceRecord[] = attendanceSnapshot.docs.map(d => d.data() as AttendanceRecord).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                    studentsData.push({
                        id: userDoc.id,
                        customId: studentData.customId,
                        name: studentData.name,
                        grade: studentData.grade,
                        teacherId: studentData.teacherId,
                        attendance,
                    });
                };
                setAssignedStudents(studentsData);
            } catch (error) {
                console.error("Error fetching students: ", error);
            } finally {
                setLoading(false);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const getStatusIcon = (status: AttendanceRecord['status']) => {
        switch (status) {
            case "Present":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "Absent":
                return <XCircle className="h-5 w-5 text-red-500" />;
            case "Tardy":
                return <Clock className="h-5 w-5 text-yellow-500" />;
            default:
                return null;
        }
    };

    const getStatusVariant = (status: AttendanceRecord['status']) => {
        switch (status) {
            case "Present":
                return "default";
            case "Absent":
                return "destructive";
            case "Tardy":
                return "secondary";
            default:
                return "outline";
        }
    }

    const calculateAttendancePercentage = (attendance: AttendanceRecord[]) => {
        if (attendance.length === 0) return 0;
        const totalPossibleDays = attendance.length;
        const presentDays = attendance.reduce((acc, record) => {
            if (record.status === 'Present') return acc + 1;
            if (record.status === 'Tardy') return acc + 0.5;
            return acc;
        }, 0);
        return (presentDays / totalPossibleDays) * 100;
    };


    if (loading) {
        return <div className="text-center">Loading students...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="flex flex-col gap-8">
            <h2 className="text-3xl font-bold font-headline text-foreground">
                Your Students
            </h2>

            {assignedStudents.length > 0 ? (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {assignedStudents.map(student => {
                        const attendancePercentage = calculateAttendancePercentage(student.attendance);
                        return (
                            <Card key={student.id} className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <User className="h-6 w-6 text-primary" />
                                        <span>{student.name}</span>
                                        {student.grade && <Badge variant="outline">Grade {student.grade}</Badge>}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                             <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                                <Percent className="h-5 w-5 text-primary" />
                                                Attendance Rate
                                            </h3>
                                            <div className="p-4 bg-muted rounded-lg space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-muted-foreground">Overall Percentage</span>
                                                    <span className={`font-bold text-2xl ${attendancePercentage >= REQUIRED_STUDENT_ATTENDANCE ? 'text-primary' : 'text-destructive'}`}>
                                                        {attendancePercentage.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <Progress value={attendancePercentage} />
                                                <p className="text-xs text-muted-foreground text-center">Required attendance: {REQUIRED_STUDENT_ATTENDANCE}%</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                                <Calendar className="h-5 w-5 text-primary" />
                                                Attendance Log
                                            </h3>
                                            <div className="max-h-48 overflow-y-auto border rounded-md">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Date</TableHead>
                                                            <TableHead>Status</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {student.attendance.map((record, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell>{record.date}</TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        {getStatusIcon(record.status)}
                                                                        <Badge variant={getStatusVariant(record.status)}>{record.status}</Badge>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                 </div>
            ) : (
                <div className="text-center text-muted-foreground py-16 bg-card rounded-lg border border-dashed">
                    <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4">You have no students assigned to you.</p>
                </div>
            )}
        </div>
    );
}
