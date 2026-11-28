import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useBookings } from './hooks/useBookings';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Calendar from './components/Calendar';
import AllBookings from './components/AllBookings';
import BookingModal from './components/BookingModal';
import Login from './components/Login';
import LoadingSpinner from './components/LoadingSpinner';
import { BookingProvider } from './context/BookingContext';

function App() {
    const [user, loading, error] = useAuthState(auth);
    const { bookings, error: bookingsError } = useBookings(user);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 p-4">Error: {error.message}</div>;

    if (!user) {
        return <Login />;
    }

    const contextValue = {
        bookings,
        showBookingModal,
        setShowBookingModal,
        editingBooking,
        setEditingBooking,
        user
    };

    return (
        <BookingProvider value={contextValue}>
            <Router>
                <div className="min-h-screen bg-gray-100">
                    <Navigation />

                    <main>
                        {bookingsError && (
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                                <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    Your bookings could not be loaded. Check your connection and try again.
                                </div>
                            </div>
                        )}
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/calendar" element={<Calendar />} />
                            <Route path="/bookings" element={<AllBookings />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>

                    {showBookingModal && <BookingModal />}
                </div>
            </Router>
        </BookingProvider>
    );
}

export default App;