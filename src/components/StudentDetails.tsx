import { useEffect, useState } from 'react';
import type { Student, AttendanceDTO } from '../types';
import api from '../services/api';
import { CalendarCheck, CheckCircle2, XCircle } from 'lucide-react';
import { cn, formatDate } from '../utils';
import Button from './Button';
import Spinner from './Spinner';

interface StudentDetailsProps {
    student: Student;
    onClose: () => void;
}

const StudentDetails: React.FC<StudentDetailsProps> = ({ student, onClose }) => {
    const [presentCount, setPresentCount] = useState<number | null>(null);
    const [history, setHistory] = useState<AttendanceDTO[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch count and history in parallel
                // Using exact endpoints provided by user
                const [countRes, historyRes] = await Promise.all([
                    api.get(`/attendance/present/student/${student.stdId}`),
                    api.get(`/attendance/student/${student.stdId}`)
                ]);

                setPresentCount(countRes.data);

                // Sort history by date descending (newest first)
                const sortedHistory = (Array.isArray(historyRes.data) ? historyRes.data : [])
                    .sort((a: AttendanceDTO, b: AttendanceDTO) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    );
                setHistory(sortedHistory);
            } catch (error) {
                console.error("Failed to fetch student details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [student.stdId]);

    // Calculate attendance percentage if we have total days (history length)
    const totalDays = history.length;
    const percentage = totalDays > 0 && presentCount !== null
        ? ((presentCount / totalDays) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="space-y-6">
            {/* Header / Summary */}
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                    <h3 className="text-lg font-bold text-indigo-900">{student.stdName}</h3>
                    <p className="text-sm text-indigo-600">ID: {student.stdId}</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-center">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Present</p>
                        <p className="text-xl font-bold text-green-600">{presentCount ?? '-'}</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-center">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Total Days</p>
                        <p className="text-xl font-bold text-gray-700">{totalDays}</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-center">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Percent</p>
                        <p className={cn(
                            "text-xl font-bold",
                            parseFloat(percentage) >= 75 ? "text-green-600" :
                                parseFloat(percentage) >= 50 ? "text-yellow-600" : "text-red-600"
                        )}>{percentage}%</p>
                    </div>
                </div>
            </div>

            {/* Attendance History List */}
            <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CalendarCheck size={18} className="text-indigo-600" />
                    Attendance History
                </h4>

                <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                    {loading ? (
                        <div className="p-8 flex justify-center items-center">
                            <Spinner size="lg" />
                        </div>
                    ) : history.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No attendance records found.</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-semibold sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 border-b">Date</th>
                                    <th className="px-4 py-3 border-b text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {history.map((record, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-800">
                                            {formatDate(record.date)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {record.isPresent === 1 ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    <CheckCircle2 size={14} /> Present
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                    <XCircle size={14} /> Absent
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={onClose} variant="secondary">Close</Button>
            </div>
        </div>
    );
};

export default StudentDetails;
