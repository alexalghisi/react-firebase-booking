import React from 'react';
import { Calendar, Clock, Users, Plus } from 'lucide-react';
import { useBookingContext } from '../context/BookingContext';
import StatsCard from './StatsCard';
import UpcomingBookings from './UpcomingBookings';
import TodaysSchedule from './TodaysSchedule';

const Home = () => {
    const { bookings, setShowBookingModal } = useBookingContext();

    const getTodaysBookings = () => {
        const today = new Date().toISOString().split('T')[0];
        return bookings.filter(booking => booking.date === today);
    };

    const getThisMonthBookings = () => {
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        return bookings.filter(booking => booking.date.startsWith(currentMonth));
    };

    const stats = [
        {
            title: 'Total Bookings',
            value: bookings.length,
            icon: Calendar,
            color: 'blue'
        },
        {
            title: "Today's Meetings",
            value: getTodaysBookings().length,
            icon: Clock,
            color: 'green'
        },
        {
            title: 'This Month',
            value: getThisMonthBookings().length,
            icon: Users,
            color: 'purple'
        }
    ];

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your bookings.</p>
                </div>

                <button
                    onClick={() => setShowBookingModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Booking</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UpcomingBookings />
                <TodaysSchedule />
            </div>
        </div>
    );
};

export default Home;