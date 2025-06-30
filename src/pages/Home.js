import React, { useEffect, useState } from "react";
import Calendar from "../components/Calendar";
import { getBookings, createBooking } from "../services/bookings";

export default function Home() {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            const data = await getBookings();
            const bookedDays = data.map((b) => b.day); // assuming each booking has a 'day'
            setBookings(bookedDays);
        };
        fetchBookings();
    }, []);

    const handleBookToday = async () => {
        const today = new Date().getDate();
        await createBooking({ day: today, createdAt: new Date() });
        setBookings((prev) => [...prev, today]);
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-center mb-4">Book your day</h1>
            <Calendar bookings={bookings} />
            <button
                onClick={handleBookToday}
                className="bg-green-500 text-white py-2 px-4 rounded block mx-auto mt-6"
            >
                Book Today
            </button>
        </div>
    );
}
