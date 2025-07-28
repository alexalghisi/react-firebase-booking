import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useBookingContext } from '../context/BookingContext';

const Calendar = () => {
    const { bookings, setShowBookingModal } = useBookingContext();
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const generateCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDate = firstDay.getDay();

        const days = [];

        // Empty cells for days before month starts
        for (let i = 0; i < startDate; i++) {
            days.push(null);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayBookings = bookings.filter(booking => booking.date === dateStr);
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            days.push({
                day,
                date: dateStr,
                bookings: dayBookings,
                isToday
            });
        }

        return days;
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const days = generateCalendarDays();

    return (
        <div className="p-6">
            <div className="bg-white rounded-lg shadow-md">
                {/* Calendar Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h1>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => navigateMonth(-1)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={goToToday}
                                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Today
                                </button>

                                <button
                                    onClick={() => navigateMonth(1)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowBookingModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Booking</span>
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-6">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="p-3 text-center font-semibold text-gray-600">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, index) => (
                            <CalendarDay key={index} day={day} />
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="px-6 pb-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                            <span>Has bookings</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span>Today</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CalendarDay = ({ day }) => {
    if (!day) {
        return <div className="h-24 bg-gray-50"></div>;
    }

    const { date, day: dayNum, bookings, isToday } = day;

    return (
        <div className={`h-24 border border-gray-200 p-1 cursor-pointer transition-colors ${
            isToday
                ? 'bg-blue-50 border-blue-300'
                : bookings.length > 0
                    ? 'bg-blue-25 hover:bg-blue-50'
                    : 'bg-white hover:bg-gray-50'
        }`}>
            <div className={`text-sm font-semibold ${
                isToday ? 'text-blue-600' : 'text-gray-900'
            }`}>
                {dayNum}
            </div>

            <div className="space-y-1 mt-1">
                {bookings.slice(0, 2).map(booking => (
                    <div
                        key={booking.id}
                        className="text-xs bg-blue-100 text-blue-800 p-1 rounded truncate cursor-pointer hover:bg-blue-200 transition-colors"
                        title={`${booking.title} - ${booking.time}`}
                    >
                        {booking.title}
                    </div>
                ))}

                {bookings.length > 2 && (
                    <div className="text-xs text-gray-500 font-medium">
                        +{bookings.length - 2} more
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calendar;