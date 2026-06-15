import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './PrescriptionDetails.css';
import { ChevronLeft, Printer, Calendar, Clock, Paperclip, Upload, Plus, FileText, AlertCircle, Sparkles, ExternalLink, Download } from 'lucide-react';
import { getAvatarUrl } from '../utils/imageHelper';

const PrescriptionDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [prescription, setPrescription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get(`/prescriptions/${id}`);
            setPrescription(data.data.prescription);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch prescription details.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleAttachmentUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        setError('');

        try {
            const { data: authParamsResponse } = await api.get('/auth/imagekit-auth');
            const { signature, expire, token, publicKey } = authParamsResponse.data;

            const uploaded = [];
            for (const file of files) {
                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    throw new Error(`File ${file.name} exceeds the 5MB size limit.`);
                }

                const formData = new FormData();
                formData.append('file', file);
                formData.append('fileName', `clinical-report-${Date.now()}-${file.name}`);
                formData.append('publicKey', publicKey);
                formData.append('signature', signature);
                formData.append('expire', expire);
                formData.append('token', token);

                const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) throw new Error(`Failed to upload ${file.name}`);
                const result = await response.json();
                uploaded.push({
                    url: result.url,
                    name: file.name,
                    type: file.type,
                });
            }

            await api.patch(`/prescriptions/${id}/attachments`, { attachments: uploaded });
            fetchDetails();
            alert('Medical report uploaded and attached successfully!');
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload attachments.');
        } finally {
            setIsUploading(false);
        }
    };

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-500 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <p className="text-sm font-medium">Retrieving medical prescription...</p>
            </div>
        );
    }

    if (error && !prescription) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
                <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Error Occurred</h2>
                    <p className="text-gray-500 text-sm mb-6">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-xl text-sm hover:bg-teal-700 transition-colors border-0 cursor-pointer"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">

            <div className="max-w-3xl mx-auto print-container">
                {/* Header Actions */}
                <div className="flex justify-between items-center mb-6 no-print">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-teal-600 transition-colors border-0 bg-transparent cursor-pointer"
                    >
                        <ChevronLeft size={16} /> Back
                    </button>

                    <div className="flex gap-3">
                        {user.role === 'doctor' && (
                            <Link
                                to={`/prescriptions/edit/${prescription._id}`}
                                className="px-4 py-2 border border-slate-300 text-slate-700 bg-white font-semibold rounded-xl text-xs hover:bg-slate-50 transition-colors no-underline flex items-center gap-1.5"
                            >
                                Edit Prescription
                            </Link>
                        )}
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-xl text-xs hover:bg-teal-700 transition-colors border-0 cursor-pointer flex items-center gap-1.5 shadow-sm shadow-teal-500/10"
                        >
                            <Printer size={14} /> Print / PDF
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-start gap-2 no-print">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Prescription Layout */}
                <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden p-8 sm:p-12 print-container">
                    {/* Medical Header */}
                    <div className="border-b-2 border-teal-600 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 print-header">
                        <div>
                            <div className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                                <span className="bg-teal-600 text-white p-2 rounded-xl flex items-center justify-center">
                                    <FileText size={22} />
                                </span>
                                Doc<span className="text-teal-600">Reserv</span> Clinical Prescription
                            </div>
                            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Verified Electronic Medical Sheet</p>
                        </div>
                        <div className="text-left sm:text-right text-xs text-gray-500">
                            <div><strong>Prescription ID:</strong> {prescription._id}</div>
                            <div className="mt-1"><strong>Issued Date:</strong> {formatDate(prescription.createdAt)}</div>
                            {prescription.appointment && (
                                <div className="mt-1"><strong>Cons. Date:</strong> {formatDate(prescription.appointment.date)} ({prescription.appointment.timeSlot})</div>
                            )}
                        </div>
                    </div>

                    {/* Profiles Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                        <div>
                            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest block mb-1">Prescribing Doctor</span>
                            <div className="font-bold text-gray-800 text-base">Dr. {prescription.doctor?.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{prescription.doctor?.specialization || 'Medical Specialist'}</div>
                            <div className="text-[11px] text-gray-400 mt-1">Email: {prescription.doctor?.email}</div>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest block mb-1">Patient Details</span>
                            <div className="font-bold text-gray-800 text-base">{prescription.patient?.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">Contact: {prescription.patient?.email}</div>
                            <div className="text-[11px] text-gray-400 mt-1">Medical Record Profile</div>
                        </div>
                    </div>

                    {/* Diagnosis */}
                    <div className="mb-8 p-4 bg-teal-50/20 border-l-4 border-teal-600 rounded-r-xl">
                        <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest block mb-1">Clinical Diagnosis</span>
                        <p className="text-gray-800 font-semibold text-lg">{prescription.diagnosis}</p>
                    </div>

                    {/* Medications Table */}
                    {prescription.medications && prescription.medications.length > 0 && (
                        <div className="mb-8">
                            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest block mb-3">Prescribed Medications</span>
                            <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                                <table className="min-w-full divide-y divide-gray-200 text-left text-xs sm:text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                                        <tr>
                                            <th className="px-6 py-4">Medicine Name</th>
                                            <th className="px-6 py-4">Dosage</th>
                                            <th className="px-6 py-4">Frequency</th>
                                            <th className="px-6 py-4">Duration</th>
                                            <th className="px-6 py-4">Special Instructions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-700">
                                        {prescription.medications.map((med, index) => (
                                            <tr key={index} className="hover:bg-gray-50/20">
                                                <td className="px-6 py-4 font-bold text-teal-700">{med.name}</td>
                                                <td className="px-6 py-4">{med.dosage}</td>
                                                <td className="px-6 py-4">{med.frequency}</td>
                                                <td className="px-6 py-4">{med.duration}</td>
                                                <td className="px-6 py-4 text-gray-500 italic">{med.instructions || 'Take as directed'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Lab Tests */}
                    {prescription.labTests && prescription.labTests.length > 0 && (
                        <div className="mb-8">
                            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest block mb-2.5">Recommended Lab Tests</span>
                            <div className="flex flex-wrap gap-2">
                                {prescription.labTests.map((test, index) => (
                                    <span key={index} className="bg-slate-100 text-slate-800 border border-slate-200 px-3.5 py-1.5 rounded-full text-xs font-semibold">
                                        {test}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes & Follow up */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {prescription.notes && (
                            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Doctor's Notes & Advice</span>
                                <p className="text-xs text-gray-600 leading-relaxed italic">"{prescription.notes}"</p>
                            </div>
                        )}

                        {prescription.followUpDate && (
                            <div className="bg-teal-50/30 border border-teal-100 p-4 rounded-2xl flex items-center gap-3">
                                <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center shrink-0">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest block">Follow-up Date</span>
                                    <span className="text-sm font-bold text-gray-800">{formatDate(prescription.followUpDate)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Attachments Section (no-print) */}
                    <div className="no-print pt-6 border-t border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Attachments & Reports</span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Upload Area */}
                            <div className="border border-dashed border-gray-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 relative hover:bg-gray-50/50 transition-colors">
                                <input
                                    type="file"
                                    multiple
                                    disabled={isUploading}
                                    onChange={handleAttachmentUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Upload size={22} className="text-gray-400" />
                                <div className="text-xs font-semibold text-gray-700">
                                    {isUploading ? 'Uploading reports...' : 'Attach Lab Reports'}
                                </div>
                                <div className="text-[10px] text-gray-400">PDF, PNG, JPG up to 5MB</div>
                            </div>

                            {/* Attachments List */}
                            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                                {prescription.attachments && prescription.attachments.length > 0 ? (
                                    prescription.attachments.map((att, idx) => (
                                        <a
                                            key={idx}
                                            href={att.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-teal-50 border border-gray-100 hover:border-teal-200 rounded-xl text-xs text-gray-600 hover:text-teal-700 transition-all font-medium no-underline group"
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <Paperclip size={14} className="shrink-0 text-gray-400 group-hover:text-teal-600" />
                                                <span className="truncate">{att.name}</span>
                                            </div>
                                            <ExternalLink size={12} className="text-gray-400 shrink-0 group-hover:text-teal-600" />
                                        </a>
                                    ))
                                ) : (
                                    <div className="h-full flex items-center justify-center text-xs text-gray-400 italic py-4 border rounded-2xl bg-gray-50/30">
                                        No attachments uploaded yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Electronic Sign-off */}
                    <div className="mt-12 text-center pt-8 border-t border-gray-100 flex flex-col items-center justify-center gap-2">
                        <div className="font-serif italic text-lg text-teal-700 font-bold select-none border-b border-teal-100 pb-1 px-4">
                            Dr. {prescription.doctor?.name}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Digitally Signed & Certified</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionDetails;
