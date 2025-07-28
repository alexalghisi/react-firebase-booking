import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useBookingContext } from '../context/BookingContext';

const BookingModal = () => {
    const {
        setShowBookingModal,
        editingBooking,
        setEditingBooking,
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

    // Populate form when editing
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
        }

        if (!formData.date) {
            newErrors.date = 'Date is required';
        }

        if (!formData.time) {
            newErrors.time = 'Time is required';
        }

        // Validate attendees email format if provided
        if (formData.attendees) {
            const emails = formData.attendees.split(',').map(email => email.trim());
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const invalidEmails = emails.filter(email => email && !emailRegex.test(email));

            if (invalidEmails.length > 0) {
                newErrors.attendees = `Invalid email format: ${invalidEmails.join(', ')}`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

// Add this debug code to your BookingModal.jsx handleSubmit function

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            // Debug: Check authentication state
            console.log('🔍 Debug - User state:', {
                uid: user?.uid,
                email: user?.email,
                authenticated: !!user
            });

            if (!user || !user.uid) {
                throw new Error('User not authenticated or missing UID');
            }

            const bookingData = {
                title: formData.title.trim(),
                date: formData.date,
                time: formData.time,
                duration: parseInt(formData.duration),
                attendees: formData.attendees
                    ? formData.attendees.split(',').map(email => email.trim()).filter(email => email)
                    : [],
                description: formData.description.trim(),
                status: formData.status,
                createdBy: user.uid, // This must match the authenticated user's UID
                updatedAt: new Date()
            };

            // Debug: Log the data being sent
            console.log('📝 Booking data to be saved:', bookingData);
            console.log('🔑 CreatedBy field:', bookingData.createdBy);
            console.log('👤 Current user UID:', user.uid);

            if (editingBooking) {
                // Update existing booking
                const bookingRef = doc(db, 'bookings', editingBooking.id);
                await updateDoc(bookingRef, bookingData);
                console.log('✅ Booking updated successfully');
            } else {
                // Create new booking
                bookingData.createdAt = new Date();
                console.log('📝 Final booking data with createdAt:', bookingData);

                const docRef = await addDoc(collection(db, 'bookings'), bookingData);
                console.log('✅ Booking created successfully with ID:', docRef.id);
            }

            handleClose();
        } catch (error) {
            console.error('❌ Error saving booking:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);

            let errorMessage = 'Failed to save booking. Please try again.';

            if (error.code === 'permission-denied') {
                errorMessage = 'Permission denied. Please check your Firestore security rules.';
            } else if (error.code === 'unauthenticated') {
                errorMessage = 'You must be signed in to create bookings.';
            }

            setErrors({ general: errorMessage });
        } finally {
            setLoading(false);
        }
    };
    
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
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {editingBooking ? 'Edit Booking' : 'Create New Booking'}
                    </h3>
                    <button
                        onClick={handleClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                            {errors.general}
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.title ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter booking title"
                        />
                        {errors.title && (
                            <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                        )}
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date *
                            </label>
                            <input
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Time *
                            </label>
                            <input
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

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration
                        </label>
                        <select
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

                    {/* Attendees */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Attendees (optional)
                        </label>
                        <input
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

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description (optional)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Add any additional details..."
                        />
                    </div>
                </div>

                {/* Footer */}
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