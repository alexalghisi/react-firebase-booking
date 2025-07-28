import React, { createContext, useContext } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children, value }) => {
    return (
        <BookingContext.Provider value={value}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBookingContext = () => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBookingContext must be used within a BookingProvider');
    }
    return context;
};