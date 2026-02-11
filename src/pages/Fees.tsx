import { Plus, Search, Edit, Trash2, Download } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../services/api';
import type { Fees } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import FeeForm from '../components/FeeForm';
import toast from 'react-hot-toast';

const FeesPage = () => {
    const [fees, setFees] = useState<Fees[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [submitLoading] = useState(false);
    const [selectedFee, setSelectedFee] = useState<Fees | null>(null);

    // For Receipt Generation
    const receiptRef = useRef<HTMLDivElement>(null);
    const [receiptData, setReceiptData] = useState<Fees | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const fetchFees = async () => {
        setLoading(true);
        try {
            const response = await api.get('/fees/all');
            // Sort by date desc
            const sorted = response.data.sort((a: Fees, b: Fees) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setFees(sorted);
        } catch (error) {
            toast.error('Failed to fetch fees history');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFees();
    }, []);

    const handleSuccess = () => {
        setIsModalOpen(false);
        setSelectedFee(null);
        fetchFees();
    };

    const handleEdit = (fee: Fees) => {
        setSelectedFee(fee);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this fee record?')) return;

        try {
            await api.delete(`/fees/delete/${id}`);
            toast.success('Fee record deleted');
            fetchFees();
        } catch (error) {
            toast.error('Failed to delete fee record');
            console.error(error);
        }
    };

    const handleDownloadReceipt = async (fee: Fees) => {
        setReceiptData(fee);
        setIsGeneratingPdf(true);
        // Wait for state update and render
        setTimeout(async () => {
            if (!receiptRef.current) {
                setIsGeneratingPdf(false);
                return;
            }

            try {
                const canvas = await html2canvas(receiptRef.current, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.75);
                const pdf = new jsPDF('p', 'mm', 'a5'); // A5 for receipts
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Receipt_${fee.feesId}_${fee.student?.stdName}.pdf`);
                toast.success('Receipt downloaded');
            } catch (error) {
                console.error('Receipt generation failed:', error);
                toast.error('Failed to generate receipt');
            } finally {
                setIsGeneratingPdf(false);
                setReceiptData(null);
            }
        }, 100);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedFee(null);
    };

    const filteredFees = fees.filter(fee =>
        fee.student?.stdName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.month.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Fees</h1>
                    <p className="text-gray-500">Manage fee payments and history</p>
                </div>
                <Button onClick={() => {
                    setSelectedFee(null);
                    setIsModalOpen(true);
                }}>
                    <Plus size={20} className="mr-2" />
                    New Payment
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative max-w-sm">
                        <div className='flex flex-row gap-4 items-center'>
                            <div>
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    placeholder="Search by student or month..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <p className='text-gray-500 text-sm'>
                                Sorted by Date
                            </p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-semibold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Receipt ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Month</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Mode</th>
                                <th className="px-6 py-4">Issued By</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                        Loading history...
                                    </td>
                                </tr>
                            ) : filteredFees.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                        No fee records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredFees.map((fee) => (
                                    <tr key={fee.feesId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-indigo-600">#{fee.feesId}</td>
                                        <td className="px-6 py-4">{fee.date}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {fee.student?.stdName}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {fee.month}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            {fee.amount}Rs
                                        </td>
                                        <td className="px-6 py-4">{fee.paymentMode}</td>
                                        <td className="px-6 py-4 text-gray-400 text-xs uppercase">{fee.issuedBy}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 text-xs">
                                                <button
                                                    onClick={() => handleDownloadReceipt(fee)}
                                                    className="p-1 px-2 text-indigo-600 hover:bg-indigo-50 rounded inline-flex items-center gap-1"
                                                    title="Download Receipt"
                                                    disabled={isGeneratingPdf}
                                                >
                                                    <Download size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(fee)}
                                                    className="p-1 px-2 text-blue-600 hover:bg-blue-50 rounded inline-flex items-center gap-1"
                                                    title="Edit"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(fee.feesId!)}
                                                    className="p-1 px-2 text-red-600 hover:bg-red-50 rounded inline-flex items-center gap-1"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
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
                isOpen={isModalOpen}
                onClose={handleModalClose}
                title={selectedFee ? "Edit Fee Record" : "Record Fee Payment"}
            >
                <FeeForm
                    onSubmit={handleSuccess}
                    onCancel={handleModalClose}
                    isLoading={submitLoading}
                    initialData={selectedFee}
                />
            </Modal>

            {/* Hidden Receipt Template for PDF Generation */}
            {receiptData && (
                <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
                    <div ref={receiptRef} style={{ width: '148mm', minHeight: '100mm', padding: '2rem', backgroundColor: '#ffffff', color: '#111827', fontFamily: 'sans-serif' }}>
                        <div style={{ textAlign: 'center', borderBottom: '2px solid #4f46e5', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#312e81', letterSpacing: '0.05em', margin: 0 }}>Fee Receipt</h2>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.025em', borderTop: '1px solid #e5e7eb', display: 'inline-block', marginTop: '0.25rem', paddingTop: '0.25rem', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>TUITION MANAGEMENT SYSTEM</p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                <p style={{ margin: 0 }}><span style={{ color: '#6b7280', fontWeight: 600, width: '5rem', display: 'inline-block' }}>Receipt No:</span> <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#111827', fontSize: '1.125rem' }}>#{receiptData.feesId}</span></p>
                                <p style={{ margin: 0 }}><span style={{ color: '#6b7280', fontWeight: 600, width: '5rem', display: 'inline-block' }}>Date:</span> <span>{receiptData.date}</span></p>
                                <p style={{ margin: 0 }}><span style={{ color: '#6b7280', fontWeight: 600, width: '5rem', display: 'inline-block' }}>Issued By:</span> <span style={{ textTransform: 'uppercase' }}>{receiptData.issuedBy}</span></p>
                            </div>
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                <p style={{ margin: 0 }}><span style={{ color: '#6b7280', fontWeight: 600 }}>Student Name:</span> <span style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#111827', display: 'block' }}>{receiptData.student?.stdName}</span></p>
                                <p style={{ margin: 0 }}><span style={{ color: '#6b7280', fontWeight: 600 }}>Student ID:</span> <span>{receiptData.student?.stdId}</span></p>
                                <p style={{ margin: 0 }}><span style={{ color: '#6b7280', fontWeight: 600 }}>Class:</span> <span>{receiptData.student?.classStudy}</span></p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d1d5db' }}>
                                <thead style={{ backgroundColor: '#f3f4f6', color: '#111827', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                    <tr>
                                        <th style={{ padding: '0.75rem', border: '1px solid #d1d5db', textAlign: 'left' }}>Description</th>
                                        <th style={{ padding: '0.75rem', border: '1px solid #d1d5db', textAlign: 'right' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>
                                            Tuition Fee for <span style={{ fontWeight: 'bold' }}>{receiptData.month}</span>
                                        </td>
                                        <td style={{ padding: '0.75rem', border: '1px solid #d1d5db', textAlign: 'right', fontWeight: 'bold', color: '#111827' }}>
                                            {receiptData.amount} Rs
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '0.75rem', border: '1px solid #d1d5db', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Total Paid</td>
                                        <td style={{ padding: '0.75rem', border: '1px solid #d1d5db', textAlign: 'right', fontWeight: 'bold', color: '#4338ca', backgroundColor: '#f9fafb', fontSize: '1.125rem' }}>
                                            {receiptData.amount} Rs
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#6b7280', marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                            <div>
                                <p style={{ margin: 0 }}>Payment Mode: <span style={{ fontWeight: 600, color: '#111827', textTransform: 'uppercase' }}>{receiptData.paymentMode}</span></p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ marginBottom: '1rem', margin: 0 }}>Signature</p>
                                <div style={{ width: '8rem', borderBottom: '1px solid #9ca3af', marginTop: '2.5rem' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeesPage;
