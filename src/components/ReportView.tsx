import { useState, useRef } from 'react';
import type { Report } from '../types';
import Button from './Button';
import { Download, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatDate } from '../utils';
import logo from '../assets/logo1.png';
import logoCheck2 from '../assets/logoCheck2.jpeg';

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
            // wait for DOM + images to load (slightly longer for off-screen render)
            await new Promise(r => setTimeout(r, 500));

            const images = printRef.current.querySelectorAll("img");
            await Promise.all(
                Array.from(images).map(img =>
                    img.complete
                        ? Promise.resolve()
                        : new Promise(res => {
                            img.onload = res;
                            img.onerror = res;
                        })
                )
            );

            // capture with logging enabled to debug if needed
            const canvas = await html2canvas(printRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false, // Turn on if debugging needed
                windowWidth: 210 * 3.7795275591, // A4 width in px (approx)
            });

            // create pdf
            const pdf = new jsPDF("p", "mm", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = (canvas.height * pageWidth) / canvas.width;

            pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pageWidth, pageHeight);
            pdf.save(`Report_${report.student.stdName}_${report.month}.pdf`);

        } catch (err) {
            console.error("PDF Generation Error:", err);
            alert("Failed to generate PDF. check console for details.");
        } finally {
            setDownloading(false);
        }
    };


    /* ================= CALCULATIONS ================= */

    const totalMax = report.reportMarks.reduce((s, x) => s + (x.maxMarks || 0), 0);
    const totalObt = report.reportMarks.reduce((s, x) => s + (x.totalMarks || 0), 0);
    const percentage = totalMax ? (totalObt / totalMax) * 100 : 0;

    let finalGrade = 'F';
    if (percentage >= 80) finalGrade = 'A+';
    else if (percentage >= 70) finalGrade = 'A';
    else if (percentage >= 60) finalGrade = 'B';
    else if (percentage >= 50) finalGrade = 'C';
    else if (percentage >= 40) finalGrade = 'D';

    const remarks =
        finalGrade === 'A+' ? 'Excellent Performance'
            : finalGrade === 'A' ? 'Very Good'
                : finalGrade === 'B' ? 'Good'
                    : finalGrade === 'C' ? 'Needs Improvement'
                        : 'Unsatisfactory';

    /* ================= UI ================= */

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:bg-white">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl relative overflow-y-auto max-h-[90vh] print:shadow-none print:max-w-none print:max-h-none">

                {/* ACTION BUTTONS */}
                <div className="absolute top-4 right-4 flex gap-2 print:hidden">
                    <Button onClick={handleDownload} isLoading={downloading}>
                        <Download size={16} className="mr-2" /> Download PDF
                    </Button>

                    <button onClick={onClose} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full">
                        <X size={18} />
                    </button>
                </div>

                {/* SCREEN REPORT */}
                <div className="p-10 flex flex-col items-center">
                    <ReportContent
                        report={report}
                        totalMax={totalMax}
                        totalObt={totalObt}
                        percentage={percentage}
                        finalGrade={finalGrade}
                        remarks={remarks}
                    />
                </div>
            </div>

            {/* ================= PDF TEMPLATE ================= */}
            <div style={{ position: 'fixed', top: 0, left: -10000 }}>
                <div
                    ref={printRef}
                    style={{
                        width: '210mm',
                        minHeight: '297mm',
                        padding: '12mm 15mm',
                        fontFamily: 'Arial, sans-serif',
                        background: '#ffffff',
                        color: '#111111'
                    }}
                >
                    <ReportContent
                        report={report}
                        totalMax={totalMax}
                        totalObt={totalObt}
                        percentage={percentage}
                        finalGrade={finalGrade}
                        remarks={remarks}
                        pdfMode
                    />
                </div>
            </div>
        </div>
    );
};

export default ReportView;


/* ========================================================= */
/* ================= REUSABLE REPORT CONTENT =============== */
/* ========================================================= */

interface ContentProps {
    report: Report;
    totalMax: number;
    totalObt: number;
    percentage: number;
    finalGrade: string;
    remarks: string;
    pdfMode?: boolean;
}

const ReportContent: React.FC<ContentProps> = ({
    report,
    totalMax,
    totalObt,
    percentage,
    finalGrade,
    remarks,
    pdfMode
}) => {

    const pdfBoxStyle = pdfMode
        ? {
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
        }
        : undefined;

    const uiBoxClass = !pdfMode
        ? "w-full border border-gray-200 rounded-lg p-6 mb-8"
        : undefined;

    return (
        <>
            {/* HEADER */}
            <div className="flex flex-col items-center mb-8">
                <img src={logoCheck2} style={{ height: 56, marginBottom: 6, borderRadius: '50%' }} />
                <h2 className="text-xl font-bold uppercase" style={{ color: '#000000' }}>HS Learning Center</h2>
                <div className="w-full h-1 rounded-full my-3" style={{ backgroundColor: '#4f46e5' }}></div>
                <h1 className="text-2xl font-bold tracking-widest uppercase" style={{ color: '#000000' }}>Report Card</h1>
                <p className="uppercase text-sm mt-1" style={{ color: '#6b7280' }}>{report.examName}</p>
            </div>

            {/* STUDENT INFO */}
            <div style={pdfBoxStyle} className={uiBoxClass}>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#6b7280' }}>
                    Student Information
                </h3>

                <div className="grid grid-cols-4 gap-y-3 text-sm">
                    <span className="font-semibold" style={{ color: '#6b7280' }}>Student</span>
                    <span className="font-semibold" style={{ color: '#000000' }}>{report.student.stdName}</span>

                    <span className="font-semibold" style={{ color: '#6b7280' }}>Month</span>
                    <span style={{ color: '#000000' }}>{report.month}</span>

                    <span className="font-semibold" style={{ color: '#6b7280' }}>ID</span>
                    <span style={{ color: '#000000' }}>{report.student.stdId}</span>

                    <span className="font-semibold" style={{ color: '#6b7280' }}>Date</span>
                    <span style={{ color: '#000000' }}>{formatDate(report.date)}</span>

                    <span className="font-semibold" style={{ color: '#6b7280' }}>Class</span>
                    <span style={{ color: '#000000' }}>{report.student.classStudy}</span>
                </div>
            </div>

            {/* MARKS TABLE */}
            <div style={pdfBoxStyle} className={uiBoxClass}>
                <table className="w-full border text-sm" style={{ borderColor: '#d1d5db' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th className="border py-3" style={{ borderColor: '#d1d5db', color: '#000000' }}>Subject</th>
                            <th className="border py-3" style={{ borderColor: '#d1d5db', color: '#000000' }}>Max Marks</th>
                            <th className="border py-3" style={{ borderColor: '#d1d5db', color: '#000000' }}>Obtained</th>
                            <th className="border py-3" style={{ borderColor: '#d1d5db', color: '#000000' }}>Grade</th>
                        </tr>
                    </thead>

                    <tbody>
                        {report.reportMarks.map((s, i) => (
                            <tr key={i}>
                                <td className="border py-3 text-center" style={{ borderColor: '#e5e7eb', color: '#000000' }}>{s.subjectName}</td>
                                <td className="border py-3 text-center" style={{ borderColor: '#e5e7eb', color: '#000000' }}>{s.maxMarks}</td>
                                <td className="border py-3 text-center font-semibold" style={{ borderColor: '#e5e7eb', color: '#000000' }}>{s.totalMarks}</td>
                                <td className="border py-3 text-center" style={{ borderColor: '#e5e7eb', color: '#000000' }}>{s.grade}</td>
                            </tr>
                        ))}
                    </tbody>

                    <tfoot>
                        <tr className="font-bold" style={{ backgroundColor: '#f3f4f6' }}>
                            <td className="border py-3 text-center" style={{ borderColor: '#d1d5db', color: '#000000' }}>TOTAL</td>
                            <td className="border py-3 text-center" style={{ borderColor: '#d1d5db', color: '#000000' }}>{totalMax}</td>
                            <td className="border py-3 text-center" style={{ borderColor: '#d1d5db', color: '#4f46e5' }}>{totalObt}</td>
                            <td className="border" style={{ borderColor: '#d1d5db' }}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* RESULT SUMMARY */}
            <div style={pdfBoxStyle} className={uiBoxClass}>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#6b7280' }}>
                    Result Summary
                </h3>

                <div className="grid grid-cols-3 text-center">
                    <div>
                        <p className="text-xs uppercase" style={{ color: '#6b7280' }}>Percentage</p>
                        <p className="text-xl font-bold" style={{ color: '#000000' }}>{percentage.toFixed(1)}%</p>
                    </div>

                    <div className="border-x" style={{ borderColor: '#e5e7eb' }}>
                        <p className="text-xs uppercase" style={{ color: '#6b7280' }}>Grade</p>
                        <p className="text-2xl font-extrabold" style={{ color: '#000000' }}>{finalGrade}</p>
                    </div>

                    <div>
                        <p className="text-xs uppercase" style={{ color: '#6b7280' }}>Remarks</p>
                        <p className="font-semibold" style={{ color: '#000000' }}>{remarks}</p>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="border-t pt-4 mt-10 text-center text-xs uppercase tracking-widest" style={{ borderColor: '#e5e7eb', color: '#9ca3af' }}>
                Issued by HS Learning Center
            </div>
        </>
    );
};
