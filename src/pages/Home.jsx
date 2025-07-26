import React, { useState, useMemo } from "react";
import Calendar from "../components/Calendar";
import ConfirmModal from "../components/ConfirmModal";
import { createBookingAtomic } from "../services/bookings";
import { useBookings } from "../hooks/useBookings";
import { useAuth } from "../hooks/useAuth";
import { startOfDay, endOfDay } from "date-fns";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
    const { user } = useAuth();
    const { bookings: allBookings, loading, error } = useBookings();

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [saving, setSaving] = useState(false);

    const bookedDates = useMemo(
        () =>
            allBookings.map((b) =>
                b.startDate?.toDate ? b.startDate.toDate() : new Date(b.startDate)
            ),
        [allBookings]
    );

    const onDayClick = (day) => setSelectedDay(day);
    const onPrevMonth = () =>
        setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    const onNextMonth = () =>
        setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

    const handleConfirm = async () => {
        if (!selectedDay || !user) return;
        setSaving(true);
        try {
            const startDate = startOfDay(selectedDay);
            const endDate = endOfDay(selectedDay);
            await createBookingAtomic({ userId: user.uid, startDate, endDate });
            toast.success("Booked!");
            // no need to manually push into state; onSnapshot will update
        } catch (e) {
            toast.error(e.message || "Could not book");
        } finally {
            setSaving(false);
            setSelectedDay(null);
        }
    };

    if (loading) return <div className="p-6 text-center">Loading…</div>;
    if (error) return <div className="p-6 text-center text-red-600">{error.message}</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
            <Toaster position="top-center" />
            <header className="p-6 text-center">
                <h1 className="text-3xl font-bold">📅 Book your day</h1>
            </header>

            <main className="flex-1 p-4">
                <Calendar
                    currentMonth={currentMonth}
                    bookings={bookedDates}
                    onDayClick={onDayClick}
                    onPrevMonth={onPrevMonth}
                    onNextMonth={onNextMonth}
                />
            </main>

            <ConfirmModal
                open={!!selectedDay}
                date={selectedDay}
                onCancel={() => setSelectedDay(null)}
                loading={saving}
                onConfirm={handleConfirm}
            />
        </div>
    );
}
