import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore'; // Added query and where

// Components
import Navigation from './components/Navigation';
import Home from './components/Home';
import Calendar from './components/Calendar';
import AllBookings from './components/AllBookings';
import BookingModal from './components/BookingModal';
import Login from './components/Login';
import LoadingSpinner from './components/LoadingSpinner';

// Context
import { BookingProvider } from './context/BookingContext';

function App() {
    const [user, loading, error] = useAuthState(auth);
    const [bookings, setBookings] = useState([]);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);

    // Subscribe to bookings when user is authenticated
    useEffect(() => {
        if (!user) return;

        console.log('🔍 Setting up Firestore listener for user:', user.uid);

        // FIXED: Query only user's bookings instead of all bookings
        const bookingsRef = collection(db, 'bookings');
        const userBookingsQuery = query(
            bookingsRef,
            where('createdBy', '==', user.uid)
        );

        const unsubscribe = onSnapshot(
            userBookingsQuery,
            (snapshot) => {
                console.log('📱 Firestore snapshot received:', snapshot.docs.length, 'documents');

                const bookingsData = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data
                    };
                });

                console.log('✅ User bookings loaded:', bookingsData.length);
                setBookings(bookingsData);
            },
            (error) => {
                console.error('❌ Firestore listener error:', error);
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);
            }
        );

        return unsubscribe;
    }, [user]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 p-4">Error: {error.message}</div>;

    // If not authenticated, show login
    if (!user) {
        return <Login />;
    }

    const contextValue = {
        bookings,
        setBookings,
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