// This file is now deprecated as data is being fetched from Firebase.
// It is kept for reference but is no longer used in the application.

export type AttendanceRecord = {
    date: string;
    status: "Present" | "Absent" | "Tardy";
};

export type Student = {
    id: string;
    name: string;
    grade: string;
    teacherId: string;
    attendance: AttendanceRecord[];
};

export const students: Student[] = [
    {
        id: "S01",
        name: "Alice",
        grade: "5",
        teacherId: "T01T001",
        attendance: [
            { date: "2024-05-20", status: "Present" },
            { date: "2024-05-21", status: "Present" },
            { date: "2024-05-22", status: "Absent" },
            { date: "2024-05-23", status: "Present" },
            { date: "2024-05-24", status: "Tardy" },
        ],
    },
    {
        id: "S02",
        name: "Bob",
        grade: "5",
        teacherId: "T01T001",
        attendance: [
            { date: "2024-05-20", status: "Present" },
            { date: "2024-05-21", status: "Present" },
            { date: "2024-05-22", status: "Present" },
            { date: "2024-05-23", status: "Present" },
            { date: "2024-05-24", status: "Present" },
        ],
    },
    {
        id: "S03",
        name: "Charlie",
        grade: "6",
        teacherId: "T02T002",
        attendance: [
            { date: "2024-05-20", status: "Absent" },
            { date: "2024-05-21", status: "Absent" },
            { date: "2024-05-22", status: "Present" },
            { date: "2024-05-23", status: "Present" },
            { date: "2024-05-24", status: "Present" },
        ],
    },
    {
        id: "S04",
        name: "David",
        grade: "6",
        teacherId: "T02T002",
        attendance: [
            { date: "2024-05-20", status: "Present" },
            { date: "2024-05-21", status: "Tardy" },
            { date: "2024-05-22", status: "Tardy" },
            { date: "2024-05-23", status: "Present" },
            { date: "2024-05-24", status: "Present" },
        ],
    },
     {
        id: "S05",
        name: "Eve",
        grade: "5",
        teacherId: "T01T001",
        attendance: [
            { date: "2024-05-20", status: "Present" },
            { date: "2024-05-21", status: "Present" },
            { date: "2024-05-22", status: "Present" },
            { date: "2024-05-23", status: "Absent" },
            { date: "2024-05-24", status: "Present" },
        ],
    },
];
