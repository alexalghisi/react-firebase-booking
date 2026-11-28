import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useBookingContext } from '../context/BookingContext';
import { describeConflicts, findConflicts } from '../lib/conflicts';

const TITLE_LIMIT = 200;
const DESCRIPTION_LIMIT = 2000;
const ATTENDEE_LIMIT = 50;

export const parseAttendees = (value) => Array.from(new Set(
    String(value || '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
));

const BookingModal = () => {
    const {
        setShowBookingModal,
        editingBooking,
        setEditingBooking,
        bookings = [],
        user
    } = useBookingContext();

    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        duration: 60,
        attendees: '',
        description: '',
        status: 'confirmed'
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (editingBooking) {
            setFormData({
                title: editingBooking.title || '',
                date: editingBooking.date || '',
                time: editingBooking.time || '',
                duration: editingBooking.duration || 60,
                attendees: editingBooking.attendees?.join(', ') || '',
                description: editingBooking.description || '',
                status: editingBooking.status || 'confirmed'
            });
        }
    }, [editingBooking]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.trim().length > TITLE_LIMIT) {
            newErrors.title = `Title must be ${TITLE_LIMIT} characters or fewer`;
        }

        if (!formData.date) {
            newErrors.date = 'Date is required';
        }

        if (!formData.time) {
            newErrors.time = 'Time is required';
        }

        if (formData.attendees) {
            const emails = parseAttendees(formData.attendees);
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const invalidEmails = emails.filter(email => email && !emailRegex.test(email));

            if (invalidEmails.length > 0) {
                newErrors.attendees = `Invalid email format: ${invalidEmails.join(', ')}`;
            } else if (emails.length > ATTENDEE_LIMIT) {
                newErrors.attendees = `Invite at most ${ATTENDEE_LIMIT} attendees`;
            }
        }

        if (formData.description.trim().length > DESCRIPTION_LIMIT) {
            newErrors.description = `Description must be ${DESCRIPTION_LIMIT} characters or fewer`;
        }

        if (Object.keys(newErrors).length === 0) {
            const conflicts = findConflicts(formData, bookings, editingBooking?.id);
            if (conflicts.length > 0) {
                newErrors.conflict = describeConflicts(conflicts);
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const bookingData = {
                title: formData.title.trim(),
                date: formData.date,
                time: formData.time,
                duration: parseInt(formData.duration),
                attendees: parseAttendees(formData.attendees),
                description: formData.description.trim(),
                status: formData.status,
                createdBy: editingBooking?.createdBy || user.uid,
                updatedAt: new Date()
            };

            if (editingBooking) {
                const bookingRef = doc(db, 'bookings', editingBooking.id);
                await updateDoc(bookingRef, bookingData);
            } else {
                bookingData.createdAt = new Date();
                await addDoc(collection(db, 'bookings'), bookingData);
            }

            handleClose();
        } catch (error) {
            setErrors({
                general: error?.code === 'permission-denied'
                    ? 'You do not have permission to save this booking.'
                    : 'Failed to save booking. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !loading) {
                handleClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    });

    const handleClose = () => {
        setShowBookingModal(false);
        setEditingBooking(null);
        setFormData({
            title: '',
            date: '',
            time: '',
            duration: 60,
            attendees: '',
            description: '',
            status: 'confirmed'
        });
        setErrors({});
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field] || errors.conflict) {
            setErrors(prev => ({
                ...prev,
                [field]: '',
                conflict: ['date', 'time', 'duration', 'status'].includes(field) ? '' : prev.conflict
            }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="booking-modal-title"
                className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 id="booking-modal-title" className="text-lg font-semibold text-gray-900">
                        {editingBooking ? 'Edit Booking' : 'Create New Booking'}
                    </h3>
                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close"
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {errors.general && (
                        <div role="alert" className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                            {errors.general}
                        </div>
                    )}
                    {errors.conflict && (
                        <div role="alert" className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
                            {errors.conflict}
                        </div>
                    )}

                    <div>
                        <label htmlFor="booking-title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                        </label>
                        <input
                            id="booking-title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.title ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter booking title"
                            maxLength={TITLE_LIMIT}
                        />
                        {errors.title && (
                            <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="booking-date" className="block text-sm font-medium text-gray-700 mb-1">
                                Date *
                            </label>
                            <input
                                id="booking-date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleInputChange('date', e.target.value)}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.date ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.date && (
                                <p className="text-red-600 text-sm mt-1">{errors.date}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="booking-time" className="block text-sm font-medium text-gray-700 mb-1">
                                Time *
                            </label>
                            <input
                                id="booking-time"
                                type="time"
                                value={formData.time}
                                onChange={(e) => handleInputChange('time', e.target.value)}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.time ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.time && (
                                <p className="text-red-600 text-sm mt-1">{errors.time}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="booking-duration" className="block text-sm font-medium text-gray-700 mb-1">
                            Duration
                        </label>
                        <select
                            id="booking-duration"
                            value={formData.duration}
                            onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={45}>45 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={90}>1.5 hours</option>
                            <option value={120}>2 hours</option>
                            <option value={180}>3 hours</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="booking-attendees" className="block text-sm font-medium text-gray-700 mb-1">
                            Attendees (optional)
                        </label>
                        <input
                            id="booking-attendees"
                            type="text"
                            value={formData.attendees}
                            onChange={(e) => handleInputChange('attendees', e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.attendees ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter email addresses, separated by commas"
                        />
                        {errors.attendees && (
                            <p className="text-red-600 text-sm mt-1">{errors.attendees}</p>
                        )}
                        <p className="text-gray-500 text-sm mt-1">
                            Example: john@example.com, jane@example.com
                        </p>
                    </div>

                    <div>
                        <label htmlFor="booking-status" className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            id="booking-status"
                            value={formData.status}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="booking-description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description (optional)
                        </label>
                        <textarea
                            id="booking-description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={3}
                            maxLength={DESCRIPTION_LIMIT}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Add any additional details..."
                        />
                        {errors.description && (
                            <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : editingBooking ? 'Update Booking' : 'Create Booking'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;