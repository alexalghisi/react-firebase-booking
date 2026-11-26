import React from 'react';
import { useBookingContext } from '../context/BookingContext';
import { addDays, compareBookings, parseDateKey, toDateKey } from '../lib/dates';

const UpcomingBookings = () => {
    const { bookings, setShowBookingModal } = useBookingContext();

    const getUpcomingBookings = () => {
        const today = toDateKey();
        return bookings
            .filter(booking => booking.date >= today)
            .sort(compareBookings)
            .slice(0, 5);
    };

    const formatDate = (dateStr) => {
        const today = new Date();

        if (dateStr === toDateKey(today)) {
            return 'Today';
        } else if (dateStr === toDateKey(addDays(today, 1))) {
            return 'Tomorrow';
        } else {
            const date = parseDateKey(dateStr);
            if (!date) {
                return '';
            }
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr || !timeStr.includes(':')) {
            return '';
        }
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const upcomingBookings = getUpcomingBookings();

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Bookings</h3>
                <button
                    onClick={() => setShowBookingModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                    + New
                </button>
            </div>

            <div className="space-y-3">
                {upcomingBookings.length > 0 ? (
                    upcomingBookings.map(booking => (
                        <div key={booking.id} className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 rounded-r transition-colors">
                            <h4 className="font-semibold text-gray-900">{booking.title}</h4>
                            <p className="text-gray-600 text-sm">
                                {formatDate(booking.date)} at {formatTime(booking.time)}
                            </p>
                            <p className="text-gray-500 text-xs">
                                {booking.duration ? `${booking.duration} minutes` : ''}
                                {booking.attendees.length > 0 && (
                                    <span> • {booking.attendees.length} attendee{booking.attendees.length !== 1 ? 's' : ''}</span>
                                )}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No upcoming bookings</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Create your first booking to get started
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpcomingBookings;