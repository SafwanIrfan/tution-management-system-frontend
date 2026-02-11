import { useState, useEffect } from 'react';
import type { Student } from '../types';
import Input from './Input';
import Button from './Button';

interface StudentFormProps {
    initialData?: Student | null;
    onSubmit: (data: Student) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
    const [formData, setFormData] = useState<Student>({
        stdId: "",
        stdName: '',
        fatherName: '',
        phoneNo: '',
        classStudy: 0,
        groupName: '',
        classesPerWeek: 0,
        paymentOption: '',
        monthlyFee: 0
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'classStudy' || name === 'classesPerWeek' || name === 'monthlyFee')
                ? (value === '' ? 0 : parseFloat(value))
                : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Student ID"
                name="stdId"
                type="string"
                value={formData.stdId || ''}
                onChange={handleChange}
                required
                placeholder="Enter ID"
                readOnly={!!initialData}
                className={initialData ? "bg-gray-100" : ""}
            />

            <Input
                label="Student Name"
                name="stdName"
                value={formData.stdName}
                onChange={handleChange}
                required
                placeholder="Enter student name"
            />
            <Input
                label="Father's Name"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                required
                placeholder="Enter father's name"
            />
            <Input
                label="Phone Number"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleChange}
                required
                placeholder="03XXXXXXXXX"
                pattern="^0[0-9]{10}$"
                title="11 digit phone number starting with 0"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Class"
                    name="classStudy"
                    type="number"
                    value={formData.classStudy || ''}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 10"
                />
                <Input
                    label="Group"
                    name="groupName"
                    value={formData.groupName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Science"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                    label="Classes/Week"
                    name="classesPerWeek"
                    type="number"
                    value={formData.classesPerWeek || ''}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 5"
                />
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 block">Payment Option</label>
                    <select
                        name="paymentOption"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.paymentOption}
                        onChange={handleChange}
                        required
                    >
                        <option disabled value="">Select Option</option>
                        <option value="Monthly">Advance Payment</option>
                        <option value="Package">After Month Payment</option>
                    </select>
                </div>
                <Input
                    label="Monthly Fee"
                    name="monthlyFee"
                    type="number"
                    value={formData.monthlyFee || ''}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 2000"
                />
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                    {initialData ? 'Update Student' : 'Enroll Student'}
                </Button>
            </div>
        </form>
    );
};

export default StudentForm;
