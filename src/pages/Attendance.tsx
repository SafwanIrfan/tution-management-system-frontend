
import { useState, useEffect } from 'react';
import { CalendarCheck, ChevronLeft, ChevronRight, Save, Search } from 'lucide-react';
import api from '../services/api';
import type { Student } from '../types';
import Input from '../components/Input';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import { cn } from '../utils';

interface AttendanceState {
    status: number;
    attId?: number;
}

const Attendance = () => {
    const [students, setStudents] = useState<Student[]>([]);
    // Map stdId -> { status, attId }
    const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceState>>({});
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [saving, setSaving] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    const fetchData = async () => {
        if (!date) {
            toast.error("Please select a date");
            return;
        }
        setLoading(true);
        try {
            // Fetch students and attendance for the specific date
            // Note: In a real "memory efficient" scenario, we might want paginated students,
            // but for a tuition center, fetching active students is usually acceptable.
            const [studentsRes, attendanceRes] = await Promise.all([
                api.get('/student/all'),
                api.get(`/attendance/date/${date}`)
            ]);

            setStudents(studentsRes.data);

            const attMap: Record<string, AttendanceState> = {};
            if (Array.isArray(attendanceRes.data)) {
                attendanceRes.data.forEach((att: any) => {
                    console.log(att)
                    // Handle both object structure and flat structure if necessary, though stdId is string in interface
                    const stdId = att.student.stdId;
                    const studentIdKey = stdId?.toString();

                    if (studentIdKey) {
                        attMap[studentIdKey] = {
                            status: att.isPresent,
                            attId: att.attId
                        };
                    }
                });
            }
            console.log(attMap)
            setAttendanceMap(attMap);
            setDataLoaded(true);
        } catch (error) {
            toast.error('Failed to fetch data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Load today's data on mount
    useEffect(() => {
        fetchData();
    }, []);

    const handleAttendanceChange = (studentId: string, status: number) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId], // Keep existing attId if present
                status: status
            }
        }));
    };

    const saveAttendance = async () => {
        if (Object.keys(attendanceMap).length === 0) {
            console.log(attendanceMap)
            toast('No attendance marked to save');
            return;
        }
        setSaving(true);
        try {
            // Prepare payloads
            // We only send records that are in the map.
            // If the backend supports batch add, that's ideal.
            // If not, we iterate. Assuming we need to iterate for now based on previous api usage.

            const promises = Object.entries(attendanceMap).map(([stdId, data]) => {
                // If we have an attId, it's an update, otherwise it's a new record
                if (data.attId !== undefined) {
                    return api.put(`/attendance/update/${data.attId}`, {
                        isPresent: data.status,
                        date: date
                    });
                } else {
                    return api.post(`/attendance/add/${stdId}`, {
                        isPresent: data.status,
                        date: date // Ensure date is sent for new records
                    });
                }
            });

            await Promise.all(promises);
            toast.success('Attendance saved successfully');
            // Refresh data to get new IDs
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    // Filter local students for display
    const filteredStudents = students.filter(student =>
        student.stdName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.groupName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: students.length,
        present: Object.values(attendanceMap).filter(v => v.status === 1).length,
        absent: Object.values(attendanceMap).filter(v => v.status === 0).length,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
                    <p className="text-gray-500">Manage daily attendance</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                        <button
                            type="button"
                            onClick={() => {
                                const d = new Date(date);
                                d.setDate(d.getDate() - 1);
                                setDate(d.toISOString().split('T')[0]);
                                setDataLoaded(false); // Reset loaded state on date change
                            }}
                            className="p-2 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value);
                                setDataLoaded(false);
                            }}
                            className="border-none focus:ring-0 text-gray-900 font-medium bg-transparent cursor-pointer"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                const d = new Date(date);
                                d.setDate(d.getDate() + 1);
                                setDate(d.toISOString().split('T')[0]);
                                setDataLoaded(false);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <Button type="button" onClick={fetchData} isLoading={loading}>
                        <Search size={18} className="mr-2" />
                        Search
                    </Button>

                    {dataLoaded && (
                        <Button variant="primary" onClick={saveAttendance} isLoading={saving} className="bg-green-600 hover:bg-green-700 text-white">
                            <Save size={18} className="mr-2" />
                            Save
                        </Button>
                    )}
                </div>
            </div>

            {dataLoaded && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Students</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                            <CalendarCheck size={24} />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Present</p>
                            <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Absent</p>
                            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search students..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-semibold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Group</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {!dataLoaded ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search size={32} className="opacity-20" />
                                            <p>Select a date and click Search to view/mark attendance</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No students found.
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => {
                                    // Get status from map, default to -1 (not marked)
                                    const record = attendanceMap[student.stdId!];
                                    const status = record ? record.status : -1;

                                    return (
                                        <tr key={student.stdId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{student.stdId}</td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{student.stdName}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {student.groupName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => student.stdId && handleAttendanceChange(student.stdId, 1)}
                                                        className={cn(
                                                            "w-10 h-10 rounded-full font-bold transition-all border-2",
                                                            status === 1
                                                                ? "bg-green-600 text-white border-green-600 shadow-md transform scale-105"
                                                                : "bg-white text-green-600 border-green-200 hover:bg-green-50 opacity-60 hover:opacity-100"
                                                        )}
                                                    >
                                                        P
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => student.stdId && handleAttendanceChange(student.stdId, 0)}
                                                        className={cn(
                                                            "w-10 h-10 rounded-full font-bold transition-all border-2",
                                                            status === 0
                                                                ? "bg-red-600 text-white border-red-600 shadow-md transform scale-105"
                                                                : "bg-white text-red-600 border-red-200 hover:bg-red-50 opacity-60 hover:opacity-100"
                                                        )}
                                                    >
                                                        A
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
