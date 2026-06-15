import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './PrescriptionForm.css';
import { ChevronLeft, Plus, Trash2, Save, FileText, AlertCircle, Sparkles } from 'lucide-react';

const PrescriptionForm = () => {
    const { appointmentId, id } = useParams(); // appointmentId for new, id for edit
    const isEditMode = !!id;
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [appointment, setAppointment] = useState(null);

    // Form states
    const [diagnosis, setDiagnosis] = useState('');
    const [medications, setMedications] = useState([
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
    const [labTests, setLabTests] = useState(['']);
    const [followUpDate, setFollowUpDate] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (user?.role !== 'doctor') {
            navigate('/dashboard');
            return;
        }
        
        if (isEditMode) {
            fetchPrescriptionForEdit();
        } else {
            fetchAppointmentForPrescription();
        }
    }, [appointmentId, id]);

    const fetchAppointmentForPrescription = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get(`/appointments/${appointmentId}`);
            const app = data.data.appointment;
            if (app.status !== 'completed') {
                setError('Prescriptions can only be created for completed appointments.');
            }
            setAppointment(app);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch appointment details.');
        } finally {
            setLoading(false);
        }
    };

    const fetchPrescriptionForEdit = async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch prescription by its ID
            // Wait, we need an endpoint to fetch prescription by ID!
            // Let's verify: does our backend have a route GET /api/v1/prescriptions/:id?
            // Oh, wait! In prescriptionRoutes.js:
            // - POST /
            // - PUT /:id
            // - GET /patient
            // - GET /doctor
            // - GET /appointment/:appointmentId
            // - PATCH /:id/attachments
            // Wait, does it have a GET /api/v1/prescriptions/:id?
            // It has GET /api/v1/prescriptions/appointment/:appointmentId!
            // If we don't have GET /:id, we can fetch it via /appointment/:appointmentId if we have the appointmentId,
            // OR we can add a GET /:id route to the backend! Adding GET /:id is extremely simple and very standard.
            // Let's check: does prescriptionController have getPrescriptionById?
            // No, but we can write a simple endpoint or fetch it.
            // Let's add GET /:id to prescriptionController & prescriptionRoutes!
            // But wait, let's implement the frontend code to call `GET /prescriptions/:id` or query by appointmentId.
            // Let's call GET /prescriptions/:id on the frontend, and add the backend route for it!
            
            const { data } = await api.get(`/prescriptions/appointment/${appointmentId || id}`);
            // Wait! If the URL is /prescriptions/edit/:id, the param is `id` (the prescription ID).
            // Let's make sure our backend supports fetching a prescription by ID!
            // Let's fetch using a new route GET /prescriptions/:id.
            
            let presc;
            try {
                const res = await api.get(`/prescriptions/appointment/${id}`); // Let's check if the ID passed in edit URL is appointmentId or prescriptionId.
                presc = res.data.data.prescription;
            } catch (err) {
                // If not found by appointment, let's try direct ID if we add the backend endpoint.
                const res = await api.get(`/prescriptions/${id}`);
                presc = res.data.data.prescription;
            }

            setDiagnosis(presc.diagnosis || '');
            setMedications(presc.medications?.length ? presc.medications : [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
            setLabTests(presc.labTests?.length ? presc.labTests : ['']);
            setFollowUpDate(presc.followUpDate ? presc.followUpDate.split('T')[0] : '');
            setNotes(presc.notes || '');
            setAppointment(presc.appointment);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch prescription details for editing.');
        } finally {
            setLoading(false);
        }
    };

    // Medications Handlers
    const handleMedicationChange = (index, field, value) => {
        const updated = [...medications];
        updated[index][field] = value;
        setMedications(updated);
    };

    const addMedicationRow = () => {
        setMedications(prev => [...prev, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    };

    const removeMedicationRow = (index) => {
        if (medications.length === 1) return;
        setMedications(prev => prev.filter((_, idx) => idx !== index));
    };

    // Lab Tests Handlers
    const handleLabTestChange = (index, value) => {
        const updated = [...labTests];
        updated[index] = value;
        setLabTests(updated);
    };

    const addLabTestRow = () => {
        setLabTests(prev => [...prev, '']);
    };

    const removeLabTestRow = (index) => {
        setLabTests(prev => prev.filter((_, idx) => idx !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        const payload = {
            appointmentId: appointment?._id || appointmentId,
            diagnosis,
            medications: medications.filter(m => m.name.trim() !== ''),
            labTests: labTests.filter(t => t.trim() !== ''),
            followUpDate: followUpDate || undefined,
            notes
        };

        try {
            if (isEditMode) {
                // Find prescription id to edit
                // If direct param is prescription id, we can update it
                await api.put(`/prescriptions/${id}`, payload);
            } else {
                await api.post('/prescriptions', payload);
            }
            navigate(`/appointments/${appointment?._id || appointmentId}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save prescription.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-500 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <p className="text-sm font-medium">Preparing prescription sheet...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-teal-600 transition-colors mb-6 border-0 bg-transparent cursor-pointer"
                >
                    <ChevronLeft size={16} /> Cancel & Return
                </button>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden space-y-8 p-8">
                    {/* Form Header */}
                    <div className="border-b border-gray-100 pb-5 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest block mb-1">Medical Record</span>
                            <h1 className="text-xl font-bold text-gray-800">
                                {isEditMode ? 'Edit Patient Prescription' : 'Issue New Prescription'}
                            </h1>
                            {appointment && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Patient: <strong>{appointment.patient?.name}</strong> | Date: {new Date(appointment.date).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                                </p>
                            )}
                        </div>
                        <FileText size={40} className="text-teal-600/20" />
                    </div>

                    {/* Diagnosis */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">Diagnosis / Findings <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Acute Bronchitis, Essential Hypertension"
                            value={diagnosis}
                            onChange={e => setDiagnosis(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-teal-500"
                        />
                    </div>

                    {/* Medications Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Prescribed Medications</h3>
                            <button
                                type="button"
                                onClick={addMedicationRow}
                                className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-semibold border border-teal-100 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer bg-white"
                            >
                                <Plus size={14} /> Add Medicine
                            </button>
                        </div>

                        <div className="space-y-3">
                            {medications.map((med, index) => (
                                <div key={index} className="bg-gray-50/50 border border-gray-100 p-4 rounded-2xl flex flex-col gap-3 relative">
                                    {medications.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeMedicationRow(index)}
                                            className="absolute right-4 top-4 text-gray-400 hover:text-red-500 p-1 rounded-lg border-0 bg-transparent cursor-pointer"
                                            title="Remove row"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Medicine Name</span>
                                            <input
                                                type="text"
                                                required={index === 0}
                                                placeholder="e.g. Amoxicillin 500mg"
                                                value={med.name}
                                                onChange={e => handleMedicationChange(index, 'name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-teal-500"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Dosage</span>
                                            <input
                                                type="text"
                                                placeholder="e.g. 1 tablet"
                                                value={med.dosage}
                                                onChange={e => handleMedicationChange(index, 'dosage', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-teal-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Frequency</span>
                                            <input
                                                type="text"
                                                placeholder="e.g. Twice daily (after meals)"
                                                value={med.frequency}
                                                onChange={e => handleMedicationChange(index, 'frequency', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-teal-500"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Duration</span>
                                            <input
                                                type="text"
                                                placeholder="e.g. 7 days"
                                                value={med.duration}
                                                onChange={e => handleMedicationChange(index, 'duration', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-teal-500"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Instructions (Optional)</span>
                                            <input
                                                type="text"
                                                placeholder="e.g. Take with warm water"
                                                value={med.instructions}
                                                onChange={e => handleMedicationChange(index, 'instructions', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-teal-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Lab Tests Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Recommended Lab Tests</h3>
                            <button
                                type="button"
                                onClick={addLabTestRow}
                                className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-semibold border border-teal-100 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer bg-white"
                            >
                                <Plus size={14} /> Add Lab Test
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {labTests.map((test, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="e.g. Complete Blood Count (CBC)"
                                        value={test}
                                        onChange={e => handleLabTestChange(index, e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-teal-500"
                                    />
                                    {labTests.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeLabTestRow(index)}
                                            className="text-gray-400 hover:text-red-500 p-2 rounded-lg border border-transparent cursor-pointer bg-transparent"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes & Follow-up Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700">Follow-up Date</label>
                            <input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={followUpDate}
                                onChange={e => setFollowUpDate(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-teal-500 bg-white"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700">Additional Instructions / Notes</label>
                            <textarea
                                placeholder="e.g. Bed rest for 3 days. Drink plenty of fluids."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-teal-500 resize-none h-28"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-3.5 bg-teal-600 text-white font-semibold rounded-xl text-sm hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2 border-0 cursor-pointer shadow-md shadow-teal-500/10"
                        >
                            <Save size={16} /> {saving ? 'Saving...' : 'Save Prescription'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PrescriptionForm;
