import React, { useEffect, useState } from "react";
import Calendar from "../components/Calendar";
import { getBookings, createBooking } from "../services/bookings";

export default function Home() {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            const data = await getBookings();
            const bookedDays = data.map((b) => b.day); // each booking has a 'day'
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
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-center">
            <div className="max-w-4xl w-full mx-auto p-6">
                <h1 className="text-4xl font-bold mb-8 text-center">📅 Book your day</h1>
                <Calendar bookings={bookings} />
                <button
                    onClick={handleBookToday}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded mt-8 mx-auto block transition"
                >
                    Book Today
                </button>
            </div>
        </div>
    );
}
