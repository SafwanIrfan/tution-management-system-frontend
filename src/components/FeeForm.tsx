import { useState, useEffect } from 'react';
import type { Fees, Student } from '../types';
import Input from './Input';
import Button from './Button';
import api from '../services/api';
import toast from 'react-hot-toast';
import Spinner from './Spinner';

interface FeeFormProps {
    onSubmit: () => void;
    onCancel: () => void;
    isLoading: boolean;
    initialData?: Fees | null;
}

const FeeForm: React.FC<FeeFormProps> = ({ onSubmit, onCancel, isLoading, initialData }) => {
    const [students, setStudents] = useState<Student[]>([]);
    // student state seems unused in original code, removing it to clean up
    const [formData, setFormData] = useState<Partial<Fees>>({
        amount: 0,
        month: new Date().toLocaleString('default', { month: 'long' }),
        date: new Date().toISOString().split('T')[0],
        paymentMode: 'Cash',
    });
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [loadingStudents, setLoadingStudents] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await api.get('/student/all');
                setStudents(response.data);
            } catch (error) {
                toast.error('Failed to load students');
            } finally {
                setLoadingStudents(false);
            }
        };
        fetchStudents();
    }, []);

    // Load initial data if editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                amount: initialData.amount,
                month: initialData.month,
                date: initialData.date,
                paymentMode: initialData.paymentMode,
            });
            if (initialData.student) {
                setSelectedStudentId(initialData.student.stdId || '');
            }
        }
    }, [initialData]);

    useEffect(() => {
        // Only auto-fill amount if NOT editing (initialData is null)
        // or if the user changes the student AND we are not in edit mode (or maybe we should let them change it?)
        // Let's stick to: if editing, don't auto-override amount unless user manually changes student?
        // Actually, if I change student, the amount should probably update to that student's fee.
        if (selectedStudentId && !initialData) {
            const std = students.find(s => s.stdId === selectedStudentId);
            if (std) {
                setFormData(prev => ({
                    ...prev,
                    amount: std.monthlyFee || 0
                }));
            }
        }
    }, [selectedStudentId, students, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || " " : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedStudentId) {
            toast.error('Please select a student');
            return;
        }

        const student = students.find(s => s.stdId === selectedStudentId);
        if (!student) return;

        try {
            const payload = {
                ...formData,
                student: { stdId: student.stdId }
            };

            if (initialData && initialData.feesId) {
                await api.put(`/fees/update/${initialData.feesId}`, payload);
                toast.success('Fee receipt updated');
            } else {
                await api.post('/fees/add', payload);
                toast.success('Fee receipt generated');
            }
            onSubmit();
        } catch (error) {
            toast.error(initialData ? 'Failed to update receipt' : 'Failed to generate receipt');
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 block">Select Student</label>
                {loadingStudents ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 flex items-center justify-center">
                        <Spinner size="sm" className="mr-2" />
                        <span className="text-sm text-gray-500">Loading students...</span>
                    </div>
                ) : (
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        required
                    >
                        <option value="">-- Select Student --</option>
                        {students.map(std => (
                            <option key={std.stdId} value={std.stdId}>
                                {std.stdName} (ID: {std.stdId})
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Amount"
                    name="amount"
                    type="number"
                    value={formData.amount || 0}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Month"
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                />
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 block">Payment Mode</label>
                    <select
                        name="paymentMode"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.paymentMode}
                        onChange={handleChange}
                    >
                        <option value="Cash">Cash</option>
                        <option value="Online">Online</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                    {initialData ? 'Update Receipt' : 'Generate Receipt'}
                </Button>
            </div>
        </form>
    );
};

export default FeeForm;
