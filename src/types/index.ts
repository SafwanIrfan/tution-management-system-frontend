export interface Student {
    stdId: string;
    stdName: string;
    fatherName: string;
    phoneNo: string;
    classStudy: number;
    groupName: string;
    classesPerWeek: number;
    paymentOption: string;
    monthlyFee: number;
}

export interface Attendance {
    attId?: number;
    stdId: string;
    isPresent: number; // 1 for present, 0 for absent
    date: string; // ISO Date string YYYY-MM-DD
}

export interface Fees {
    feesId?: number;
    student: Student;
    issuedBy: string;
    month: string;
    date: string;
    paymentMode: 'Cash' | 'Online';
    amount: number;
}

export interface ReportMarks {
    repMarksId?: number;
    subjectName: string;
    maxMarks: number;
    totalMarks: number;
    grade?: string;
    percentage?: number;
    reportCard?: Report;
}

export interface Report {
    repId?: number;
    student: Student;
    reportMarks: ReportMarks[];
    month: string;
    date: string;
    year: string;
}
