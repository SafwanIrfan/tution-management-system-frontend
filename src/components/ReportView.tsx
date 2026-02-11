import { useState, useRef } from 'react';
import type { Report } from '../types';
import Button from './Button';
import { Download, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { cn } from '../utils';

interface ReportViewProps {
    report: Report;
    onClose: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ report, onClose }) => {
    const printRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        if (!printRef.current) return;
        setDownloading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(printRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.75);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Report_${report.student.stdName}_${report.month}.pdf`);
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    // Calculate totals
    const totalMax = report.reportMarks.reduce((sum, sub) => sum + (sub.maxMarks || 0), 0);
    const totalObt = report.reportMarks.reduce((sum, sub) => sum + (sub.totalMarks || 0), 0);
    const percentage = totalMax > 0 ? (totalObt / totalMax) * 100 : 0;

    let finalGrade = 'F';
    if (percentage >= 90) finalGrade = 'A+';
    else if (percentage >= 80) finalGrade = 'A';
    else if (percentage >= 70) finalGrade = 'B';
    else if (percentage >= 60) finalGrade = 'C';
    else if (percentage >= 50) finalGrade = 'D';

    const getGradeColor = (grade: string) => {
        if (grade.startsWith('A')) return '#166534'; // green-800
        if (grade === 'B') return '#1e40af'; // blue-800
        if (grade === 'F') return '#991b1b'; // red-800
        return '#1f2937'; // gray-800
    };

    const getGradeBg = (grade: string) => {
        if (grade.startsWith('A')) return '#dcfce7'; // green-100
        if (grade === 'B') return '#dbeafe'; // blue-100
        if (grade === 'F') return '#fee2e2'; // red-100
        return '#f3f4f6'; // gray-100
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl relative animate-in zoom-in-95 duration-200 print:shadow-none print:max-w-none print:w-full">
                <div className="absolute top-4 right-4 z-10 flex gap-2 print:hidden">
                    <Button onClick={handleDownload} isLoading={downloading}>
                        <Download size={16} className="mr-2" /> Download PDF
                    </Button>
                    <button
                        onClick={onClose}
                        className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 md:p-12 mb-4 bg-white">
                    <div className="text-center border-b-2 border-indigo-600 pb-6 mb-8">
                        <h1 className="text-4xl font-bold text-indigo-900 uppercase tracking-wider mb-2">Report Card</h1>
                        <p className="text-gray-500 font-medium tracking-widest text-sm uppercase">Tuition Management System</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-sm">
                        <div className="space-y-3">
                            <div className="flex">
                                <span className="font-semibold text-gray-500 w-24">Student:</span>
                                <span className="text-lg font-bold text-gray-900">{report.student.stdName}</span>
                            </div>
                            <div className="flex">
                                <span className="font-semibold text-gray-500 w-24">ID:</span>
                                <span className="text-gray-900">#{report.student.stdId}</span>
                            </div>
                            <div className="flex">
                                <span className="font-semibold text-gray-500 w-24">Class:</span>
                                <span className="text-gray-900">{report.student.classStudy}</span>
                            </div>
                        </div>
                        <div className="space-y-3 text-right">
                            <div>
                                <span className="font-semibold text-gray-500">Month:</span>
                                <span className="text-gray-900 font-medium ml-2">{report.month}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500">Year:</span>
                                <span className="text-gray-900 font-medium ml-2">{report.year}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500">Date:</span>
                                <span className="text-gray-900 font-medium ml-2">{report.date}</span>
                            </div>
                        </div>
                    </div>

                    <table className="w-full text-left mb-8 border-collapse border border-gray-200">
                        <thead>
                            <tr className="bg-gray-50 text-gray-900 uppercase text-xs tracking-wider">
                                <th className="p-3 border border-gray-200 font-semibold">Subject</th>
                                <th className="p-3 border border-gray-200 text-right font-semibold">Max Marks</th>
                                <th className="p-3 border border-gray-200 text-right font-semibold">Obtained</th>
                                <th className="p-3 border border-gray-200 text-center font-semibold">Grade</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {report.reportMarks.map((sub, i) => (
                                <tr key={i}>
                                    <td className="p-3 border border-gray-200 font-medium text-gray-800">{sub.subjectName}</td>
                                    <td className="p-3 border border-gray-200 text-right text-gray-600">{sub.maxMarks}</td>
                                    <td className="p-3 border border-gray-200 text-right font-semibold text-gray-900">{sub.totalMarks}</td>
                                    <td className="p-3 border border-gray-200 text-center">
                                        <span className={cn(
                                            "inline-block px-2 py-0.5 rounded text-xs font-bold",
                                            sub.grade?.startsWith('A') ? "bg-green-100 text-green-800" :
                                                sub.grade === 'B' ? "bg-blue-100 text-blue-800" :
                                                    sub.grade === 'F' ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                                        )}>
                                            {sub.grade || '-'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 font-bold text-gray-900">
                            <tr>
                                <td className="p-3 border border-gray-200">Total</td>
                                <td className="p-3 border border-gray-200 text-right">{totalMax}</td>
                                <td className="p-3 border border-gray-200 text-right text-indigo-700">{totalObt}</td>
                                <td className="p-3 border border-gray-200"></td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                        <div className="text-center p-4 bg-gray-50 rounded border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Percentage</p>
                            <p className="text-2xl font-bold text-gray-900">{percentage.toFixed(1)}%</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Overall Grade</p>
                            <p className={cn(
                                "text-3xl font-extrabold",
                                finalGrade.startsWith('A') ? "text-green-600" :
                                    finalGrade === 'F' ? "text-red-600" : "text-indigo-600"
                            )}>{finalGrade}</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Remarks</p>
                            <p className="font-semibold text-gray-900 mt-1">
                                {finalGrade.startsWith('A') ? "Excellent Work!" :
                                    finalGrade === 'B' ? "Very Good!" :
                                        finalGrade === 'C' ? "Good Job!" :
                                            finalGrade === 'F' ? "Needs Hard Work" : "Satisfactory"}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between items-end mt-20">
                        <div className="text-center w-40">
                            <div className="border-b border-gray-400 mb-2"></div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Teacher Signature</p>
                        </div>
                        <div className="text-center w-40">
                            <div className="border-b border-gray-400 mb-2"></div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Principal Signature</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Print Template with Inline Styles */}
            <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
                <div ref={printRef} style={{ width: '210mm', minHeight: '297mm', padding: '15mm', backgroundColor: '#ffffff', fontFamily: 'sans-serif', color: '#111827' }}>

                    {/* Header */}
                    <div style={{ textAlign: 'center', borderBottom: '2px solid #4f46e5', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#312e81', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', margin: 0 }}>Report Card</h1>
                        <p style={{ color: '#6b7280', fontWeight: 500, letterSpacing: '0.1em', fontSize: '0.875rem', textTransform: 'uppercase', margin: 0 }}>Tuition Management System</p>
                    </div>

                    {/* Student Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex' }}>
                                <span style={{ fontWeight: 600, color: '#6b7280', width: '6rem' }}>Student:</span>
                                <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827' }}>{report.student.stdName}</span>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <span style={{ fontWeight: 600, color: '#6b7280', width: '6rem' }}>ID:</span>
                                <span style={{ color: '#111827' }}>#{report.student.stdId}</span>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <span style={{ fontWeight: 600, color: '#6b7280', width: '6rem' }}>Class:</span>
                                <span style={{ color: '#111827' }}>{report.student.classStudy}</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div>
                                <span style={{ fontWeight: 600, color: '#6b7280' }}>Month:</span>
                                <span style={{ color: '#111827', fontWeight: 500, marginLeft: '0.5rem' }}>{report.month}</span>
                            </div>
                            <div>
                                <span style={{ fontWeight: 600, color: '#6b7280' }}>Year:</span>
                                <span style={{ color: '#111827', fontWeight: 500, marginLeft: '0.5rem' }}>{report.year}</span>
                            </div>
                            <div>
                                <span style={{ fontWeight: 600, color: '#6b7280' }}>Date:</span>
                                <span style={{ color: '#111827', fontWeight: 500, marginLeft: '0.5rem' }}>{report.date}</span>
                            </div>
                        </div>
                    </div>

                    {/* Marks Table */}
                    <table style={{ width: '100%', textAlign: 'left', marginBottom: '2rem', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9fafb', color: '#111827', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                                <th style={{ padding: '0.75rem', border: '1px solid #e5e7eb', fontWeight: 600 }}>Subject</th>
                                <th style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 600 }}>Max Marks</th>
                                <th style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 600 }}>Obtained</th>
                                <th style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 600 }}>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.reportMarks.map((sub, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', fontWeight: 500, color: '#1f2937' }}>{sub.subjectName}</td>
                                    <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'right', color: '#4b5563' }}>{sub.maxMarks}</td>
                                    <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 600, color: '#111827' }}>{sub.totalMarks}</td>
                                    <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.125rem 0.5rem',
                                            borderRadius: '0.25rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            backgroundColor: getGradeBg(sub.grade || ''),
                                            color: getGradeColor(sub.grade || '')
                                        }}>
                                            {sub.grade || '-'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot style={{ backgroundColor: '#f9fafb', fontWeight: 'bold', color: '#111827' }}>
                            <tr>
                                <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>Total</td>
                                <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'right' }}>{totalMax}</td>
                                <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'right', color: '#4338ca' }}>{totalObt}</td>
                                <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}></td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Summary Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
                        <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.25rem', border: '1px solid #f3f4f6' }}>
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', marginTop: 0 }}>Percentage</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>{percentage.toFixed(1)}%</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.25rem', border: '1px solid #f3f4f6' }}>
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', marginTop: 0 }}>Overall Grade</p>
                            <p style={{
                                fontSize: '1.875rem',
                                fontWeight: 800,
                                margin: 0,
                                color: finalGrade.startsWith('A') ? '#16a34a' : finalGrade === 'F' ? '#dc2626' : '#4f46e5'
                            }}>{finalGrade}</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.25rem', border: '1px solid #f3f4f6' }}>
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', marginTop: 0 }}>Remarks</p>
                            <p style={{ fontWeight: 600, color: '#111827', marginTop: '0.25rem', margin: 0 }}>
                                {finalGrade.startsWith('A') ? "Excellent Work!" :
                                    finalGrade === 'B' ? "Very Good!" :
                                        finalGrade === 'C' ? "Good Job!" :
                                            finalGrade === 'F' ? "Needs Hard Work" : "Satisfactory"}
                            </p>
                        </div>
                    </div>

                    {/* Signatures */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '5rem' }}>
                        <div style={{ textAlign: 'center', width: '10rem' }}>
                            <div style={{ borderBottom: '1px solid #9ca3af', marginBottom: '0.5rem' }}></div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', margin: 0 }}>Teacher Signature</p>
                        </div>
                        <div style={{ textAlign: 'center', width: '10rem' }}>
                            <div style={{ borderBottom: '1px solid #9ca3af', marginBottom: '0.5rem' }}></div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', margin: 0 }}>Principal Signature</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportView;
