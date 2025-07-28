import React from 'react';
import { useBookingContext } from '../context/BookingContext';

const TodaysSchedule = () => {
    const { bookings } = useBookingContext();

    const getTodaysBookings = () => {
        const today = new Date().toISOString().split('T')[0];
        return bookings
            .filter(booking => booking.date === today)
            .sort((a, b) => a.time.localeCompare(b.time));
    };

    const formatTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getStatusColor = (status) => {
        const colors = {
            confirmed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const isUpcoming = (timeStr) => {
        const now = new Date();
        const [hours, minutes] = timeStr.split(':');
        const bookingTime = new Date();
        bookingTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return bookingTime > now;
    };

    const todaysBookings = getTodaysBookings();

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>

            <div className="space-y-3">
                {todaysBookings.length > 0 ? (
                    todaysBookings.map(booking => (
                        <div
                            key={booking.id}
                            className={`flex justify-between items-center p-3 rounded-lg transition-colors ${
                                isUpcoming(booking.time) ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                            }`}
                        >
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{booking.title}</h4>
                                <p className="text-gray-600 text-sm">
                                    {formatTime(booking.time)} ({booking.duration}m)
                                </p>
                                {booking.attendees.length > 0 && (
                                    <p className="text-gray-500 text-xs mt-1">
                                        With: {booking.attendees.slice(0, 2).join(', ')}
                                        {booking.attendees.length > 2 && ` +${booking.attendees.length - 2} more`}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col items-end space-y-1">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
                                {isUpcoming(booking.time) && (
                                    <span className="text-xs text-blue-600 font-medium">Upcoming</span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No meetings scheduled for today</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Enjoy your free day! 🎉
                        </p>
                    </div>
                )}
            </div>

            {todaysBookings.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-gray-500 text-sm text-center">
                        {todaysBookings.filter(b => isUpcoming(b.time)).length} upcoming, {todaysBookings.length} total today
                    </p>
                </div>
            )}
        </div>
    );
};

export default TodaysSchedule;