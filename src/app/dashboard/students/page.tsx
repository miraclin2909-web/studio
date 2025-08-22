"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { students, type Student, type AttendanceRecord } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

export default function StudentsPage() {
    const { user } = useAuth();
    const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);

    useEffect(() => {
        if (user) {
            const filteredStudents = students.filter(student => student.teacherId === user.id);
            setAssignedStudents(filteredStudents);
        }
    }, [user]);

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
                    {assignedStudents.map(student => (
                        <Card key={student.id} className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <User className="h-6 w-6 text-primary" />
                                    <span>{student.name}</span>
                                    <Badge variant="outline">Grade {student.grade}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    Attendance Records
                                </h3>
                                <div className="max-h-60 overflow-y-auto">
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
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            ) : (
                <div className="text-center text-muted-foreground py-16">
                    <p>You have no students assigned to you.</p>
                </div>
            )}
        </div>
    );
}
