import { useState, useRef } from 'react';
import type { Report } from '../types';
import Button from './Button';
import { Download, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { cn, formatDate } from '../utils';
import logo from '../assets/logo1.png';

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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto print:shadow-none print:max-w-none print:w-full print:max-h-none print:overflow-visible">
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

                <div className="p-12 mt-8 bg-white flex flex-col items-center">
                    {/* Header */}
                    <div className="text-center mb-10 w-full">
                        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-widest mb-2">Report Card</h1>
                        <div className="h-1 w-full bg-indigo-600 mx-auto rounded-full"></div>
                        <p className="text-gray-500 text-xl font-semibold uppercase tracking-widest mt-3">HS Learning Center</p>
                        <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mt-1">{report.examName}</p>
                    </div>

                    {/* Student Info Grid */}
                    <div className="w-full grid grid-cols-2 gap-x-12 gap-y-6 mb-10 text-sm border-b border-gray-100 pb-10">
                        <div className="grid grid-cols-[80px_1fr] gap-y-2 items-baseline">
                            <span className="text-gray-500 font-semibold uppercase text-xs tracking-wide">Student</span>
                            <span className="text-gray-900 font-bold text-lg">{report.student.stdName}</span>

                            <span className="text-gray-500 font-semibold uppercase text-xs tracking-wide">ID</span>
                            <span className="text-gray-900 font-medium">{report.student.stdId}</span>

                            <span className="text-gray-500 font-semibold uppercase text-xs tracking-wide">Class</span>
                            <span className="text-gray-900 font-medium">{report.student.classStudy}</span>
                        </div>
                        <div className="grid grid-cols-[80px_1fr] gap-y-2 items-baseline text-right justify-items-end content-start">
                            {/* Wrapper div to force right alignment in the grid cell */}
                            <div className="col-span-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 items-baseline w-full">
                                <span className="text-gray-500 font-semibold uppercase text-xs tracking-wide">Month</span>
                                <span className="text-gray-900 font-medium">{report.month}</span>

                                <span className="text-gray-500 font-semibold uppercase text-xs tracking-wide">Date</span>
                                <span className="text-gray-900 font-medium">{formatDate(report.date)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Marks Table */}
                    <div className="w-full mb-10">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                                    <th className="py-4 font-semibold text-center w-1/4">Subject</th>
                                    <th className="py-4 font-semibold text-center w-1/4">Max Marks</th>
                                    <th className="py-4 font-semibold text-center w-1/4">Obtained</th>
                                    <th className="py-4 font-semibold text-center w-1/4">Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.reportMarks.map((sub, i) => (
                                    <tr key={i} className="border-b border-gray-50">
                                        <td className="py-4 text-center text-gray-900 font-medium">{sub.subjectName}</td>
                                        <td className="py-4 text-center text-gray-500">{sub.maxMarks}</td>
                                        <td className="py-4 text-center text-gray-900 font-semibold">{sub.totalMarks}</td>
                                        <td className="py-4 text-center">
                                            <div className="flex justify-center">
                                                <span className="text-gray-900 font-semibold">
                                                    {sub.grade || '-'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-gray-100">
                                    <td className="py-6 text-center font-bold text-gray-900 uppercase text-xs tracking-wider">Total</td>
                                    <td className="py-6 text-center font-bold text-gray-900">{totalMax}</td>
                                    <td className="py-6 text-center font-bold text-indigo-600 text-lg">{totalObt}</td>
                                    <td className="py-6"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Summary Footer */}
                    <div className="w-full grid grid-cols-3 gap-4 mb-16">
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                            <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Percentage</span>
                            <span className="text-xl font-bold text-gray-900">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                            <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Grade</span>
                            <span className={cn(
                                "text-2xl font-extrabold",
                                finalGrade.startsWith('A') ? "text-green-600" :
                                    finalGrade === 'F' ? "text-red-600" : "text-indigo-600"
                            )}>
                                {finalGrade}
                            </span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                            <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Remarks</span>
                            <span className="text-sm font-semibold text-gray-900 text-center">
                                {finalGrade.startsWith('A') ? "Excellent Work!" :
                                    finalGrade === 'B' ? "Very Good!" :
                                        finalGrade === 'C' ? "Good Job!" :
                                            finalGrade === 'F' ? "Needs Hard Work" : "Satisfactory"}
                            </span>
                        </div>
                    </div>

                    <p className="text-center text-gray-500 text-sm font-semibold uppercase tracking-widest mt-3">Issue by Admin HS_LC</p>

                </div>
            </div>

            {/* Hidden Print Template */}
            <div style={{ position: 'absolute', top: -9999, left: -9999 }}>
                <div ref={printRef} style={{ width: '210mm', minHeight: '297mm', padding: '15mm', backgroundColor: '#ffffff', fontFamily: 'sans-serif', color: '#111827' }}>

                    {/* PDF Header */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}>

                        {/* Logo and Institute Name */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '34px', height: '34px', padding: '3px', backgroundColor: 'black', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.75rem' }}>
                                <img src={logo} alt="HS_LOGO" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#111827', margin: 0 }}>
                                HS Learning Center
                            </h2>
                        </div>

                        {/* Divider */}
                        <div style={{ height: '4px', width: '100%', backgroundColor: '#4f46e5', borderRadius: '9999px', marginBottom: '1.5rem' }}></div>

                        {/* Title and Exam Name */}
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', color: '#111827' }}>Report Card</h1>
                        <p style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', margin: 0 }}>
                            {report.examName}
                        </p>
                    </div>

                    {/* PDF Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', rowGap: '0.5rem', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>Student</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>{report.student.stdName}</span>

                            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>ID</span>
                            <span style={{ fontWeight: 500, color: '#111827' }}>{report.student.stdId}</span>

                            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>Class</span>
                            <span style={{ fontWeight: 500, color: '#111827' }}>{report.student.classStudy}</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', columnGap: '1rem', rowGap: '0.5rem', alignItems: 'baseline', textAlign: 'right' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>Month</span>
                            <span style={{ fontWeight: 500, color: '#111827' }}>{report.month}</span>

                            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>Date</span>
                            <span style={{ fontWeight: 500, color: '#111827' }}>{formatDate(report.date)}</span>
                        </div>
                    </div>

                    {/* PDF Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f3f4f6', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>
                                <th style={{ padding: '1rem 0', fontWeight: 600, textAlign: 'center', width: '25%' }}>Subject</th>
                                <th style={{ padding: '1rem 0', fontWeight: 600, textAlign: 'center', width: '25%' }}>Max Marks</th>
                                <th style={{ padding: '1rem 0', fontWeight: 600, textAlign: 'center', width: '25%' }}>Obtained</th>
                                <th style={{ padding: '1rem 0', fontWeight: 600, textAlign: 'center', width: '25%' }}>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.reportMarks.map((sub, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                                    <td style={{ padding: '1rem 0', textAlign: 'center', fontWeight: 500, color: '#111827' }}>{sub.subjectName}</td>
                                    <td style={{ padding: '1rem 0', textAlign: 'center', color: '#6b7280' }}>{sub.maxMarks}</td>
                                    <td style={{ padding: '1rem 0', textAlign: 'center', fontWeight: 600, color: '#111827' }}>{sub.totalMarks}</td>
                                    <td style={{ padding: '1rem 0', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <span style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2rem', height: '2rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 'bold',

                                                color: getGradeColor(sub.grade || '')
                                            }}>
                                                {sub.grade || '-'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ borderTop: '2px solid #f3f4f6' }}>
                                <td style={{ padding: '1.5rem 0', textAlign: 'center', fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#111827' }}>Total</td>
                                <td style={{ padding: '1.5rem 0', textAlign: 'center', fontWeight: 'bold', color: '#111827' }}>{totalMax}</td>
                                <td style={{ padding: '1.5rem 0', textAlign: 'center', fontWeight: 'bold', fontSize: '1.125rem', color: '#4f46e5' }}>{totalObt}</td>
                                <td style={{ padding: '1.5rem 0' }}></td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* PDF Summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.25rem' }}>Percentage</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>{percentage.toFixed(1)}%</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.25rem' }}>Grade</span>
                            <span style={{
                                fontSize: '1.5rem', fontWeight: 800,
                                color: finalGrade.startsWith('A') ? '#16a34a' : finalGrade === 'F' ? '#dc2626' : '#4f46e5'
                            }}>
                                {finalGrade}
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.25rem' }}>Remarks</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
                                {finalGrade.startsWith('A') ? "Excellent Work!" :
                                    finalGrade === 'B' ? "Very Good!" :
                                        finalGrade === 'C' ? "Good Job!" :
                                            finalGrade === 'F' ? "Needs Hard Work" : "Satisfactory"}
                            </span>
                        </div>
                    </div>

                    <p style={{ fontSize: '0.75rem', color: '#72777eff', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.25rem', textAlign: 'center' }}>Issue by Admin HS_LC</p>


                </div>
            </div>
        </div>
    );
};

export default ReportView;
