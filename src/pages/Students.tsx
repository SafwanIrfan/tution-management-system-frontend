import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';
import type { Student } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import StudentForm from '../components/StudentForm';
import toast from 'react-hot-toast';

const Students = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);

    const fetchStudents = async () => {
        try {
            const response = await api.get('/student/all');
            setStudents(response.data);
        } catch (error) {
            toast.error('Failed to fetch students');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleAddStudent = () => {
        setEditingStudent(null);
        setIsModalOpen(true);
    };

    const handleEditStudent = (student: Student) => {
        setEditingStudent(student);
        setIsModalOpen(true);
    };

    const handleDeleteStudent = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;

        try {
            await api.delete(`/student/delete/${id}`);
            toast.success('Student deleted successfully');
            fetchStudents();
        } catch (error) {
            toast.error('Failed to delete student');
            console.error(error);
        }
    };

    const handleSubmit = async (data: Student) => {
        setSubmitLoading(true);
        try {
            if (editingStudent && editingStudent.stdId) {
                await api.put('/student/update', { ...data, stdId: editingStudent.stdId });
                toast.success('Student updated successfully');
            } else {
                await api.post('/student/add', data);
                toast.success('Student enrolled successfully');
            }
            setIsModalOpen(false);
            fetchStudents();
        } catch (error) {
            toast.error('Failed to save student');
            console.error(error);
        } finally {
            setSubmitLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.stdName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phoneNo.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Students</h1>
                    <p className="text-gray-500">Manage student enrollments</p>
                </div>
                <Button onClick={handleAddStudent}>
                    <Plus size={20} className="mr-2" />
                    Enroll Student
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by name or phone..."
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
                                <th className="px-6 py-4">Father Name</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4">Class</th>
                                <th className="px-6 py-4">Group</th>
                                <th className="px-6 py-4">Fee</th>
                                <th className="px-6 py-4">Payment</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                                        Loading students...
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                                        No students found.
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.stdId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">#{student.stdId}</td>
                                        <td className="px-6 py-4">{student.stdName}</td>
                                        <td className="px-6 py-4">{student.fatherName}</td>
                                        <td className="px-6 py-4">{student.phoneNo}</td>
                                        <td className="px-6 py-4">{student.classStudy}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                {student.groupName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {student.monthlyFee}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {student.paymentOption}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleEditStudent(student)}
                                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => student.stdId && handleDeleteStudent(student.stdId)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingStudent ? "Edit Student" : "Enroll New Student"}
            >
                {/* We pass a new instance key to reset form when opening new or switching students */}
                <StudentForm
                    key={editingStudent?.stdId || 'new'}
                    initialData={editingStudent}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={submitLoading}
                />
            </Modal>
        </div>
    );
};

export default Students;
