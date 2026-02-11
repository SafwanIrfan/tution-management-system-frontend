import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';
import type { Report } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import ReportForm from '../components/ReportForm';
import ReportView from '../components/ReportView';
import toast from 'react-hot-toast';

const Reports = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [viewReport, setViewReport] = useState<Report | null>(null);
    const [editReport, setEditReport] = useState<Report | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await api.get('/report/all');
            // assuming endpoint returns list of reports with subjects loaded
            setReports(response.data);
            console.log(response.data);
        } catch (error) {
            toast.error('Failed to fetch reports');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleSuccess = () => {
        setIsFormOpen(false);
        setEditReport(null);
        fetchReports();
    };

    const handleEdit = (report: Report) => {
        setEditReport(report);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;

        try {
            await api.delete(`/report/delete/${id}`);
            toast.success('Report deleted successfully');
            fetchReports();
        } catch (error) {
            toast.error('Failed to delete report');
            console.error(error);
        }
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditReport(null);
    };

    const filteredReports = reports?.filter(rep =>
        rep.student?.stdName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rep.month.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                    <p className="text-gray-500">Generate and view student report cards</p>
                </div>
                <Button onClick={() => {
                    setEditReport(null);
                    setIsFormOpen(true);
                }}>
                    <Plus size={20} className="mr-2" />
                    Generate Report
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search reports..."
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
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Month/Year</th>
                                <th className="px-6 py-4">Subjects</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Loading reports...
                                    </td>
                                </tr>
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No reports found.
                                    </td>
                                </tr>
                            ) : (
                                filteredReports.map((rep) => (
                                    <tr key={rep.repId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">#{rep.repId}</td>
                                        <td className="px-6 py-4 font-medium">{rep.student?.stdName}</td>
                                        <td className="px-6 py-4">{rep.month} {rep.year}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                                {rep.reportMarks?.length || 0} Subjects
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 text-xs">
                                                <button
                                                    onClick={() => setViewReport(rep)}
                                                    className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                                                    title="View"
                                                >
                                                    <Eye size={14} /> View
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(rep)}
                                                    className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={14} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(rep.repId!)}
                                                    className="text-red-600 hover:text-red-900 inline-flex items-center gap-1 bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isFormOpen}
                onClose={handleFormClose}
                title={editReport ? "Edit Report Card" : "Generate New Report Card"}
            >
                <ReportForm
                    onSubmit={handleSuccess}
                    onCancel={handleFormClose}
                    initialData={editReport}
                />
            </Modal>

            {viewReport && (
                <ReportView
                    report={viewReport}
                    onClose={() => setViewReport(null)}
                />
            )}
        </div>
    );
};

export default Reports;
