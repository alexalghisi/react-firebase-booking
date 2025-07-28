import React from 'react';
import { useBookingContext } from '../context/BookingContext';

const UpcomingBookings = () => {
    const { bookings, setShowBookingModal } = useBookingContext();

    const getUpcomingBookings = () => {
        const today = new Date().toISOString().split('T')[0];
        return bookings
            .filter(booking => booking.date >= today)
            .sort((a, b) => {
                const dateA = new Date(a.date + ' ' + a.time);
                const dateB = new Date(b.date + ' ' + b.time);
                return dateA - dateB;
            })
            .slice(0, 5);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (dateStr === today.toISOString().split('T')[0]) {
            return 'Today';
        } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const formatTime = (timeStr) => {
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
                                {booking.duration} minutes
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