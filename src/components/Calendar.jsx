import React, { useMemo } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    isSameDay,
    isSameMonth,
} from "date-fns";
import clsx from "clsx";

/**
 * Props:
 *  - currentMonth: Date
 *  - bookings: Date[]  (JS Dates of booked startDate)
 *  - onDayClick(Date)
 *  - onPrevMonth()
 *  - onNextMonth()
 */
export default function Calendar({
                                     currentMonth,
                                     bookings = [],
                                     onDayClick,
                                     onPrevMonth,
                                     onNextMonth,
                                 }) {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = useMemo(() => {
        const arr = [];
        let day = startDate;
        while (day <= endDate) {
            arr.push(day);
            day = addDays(day, 1);
        }
        return arr;
    }, [startDate, endDate]);

    const isBooked = (day) => bookings.some((d) => isSameDay(d, day));

    return (
        <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <button onClick={onPrevMonth} className="px-3 py-1 rounded border">
                    ‹
                </button>
                <h2 className="text-xl font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
                <button onClick={onNextMonth} className="px-3 py-1 rounded border">
                    ›
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500 mb-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <div key={d}>{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                    const otherMonth = !isSameMonth(day, monthStart);
                    return (
                        <button
                            type="button"
                            key={day.toISOString()}
                            onClick={() => onDayClick(day)}
                            className={clsx(
                                "rounded p-3 border min-h-[60px] flex flex-col items-center justify-center transition",
                                otherMonth && "text-gray-400",
                                isBooked(day) && "bg-red-300 text-white border-red-400",
                                !isBooked(day) && "hover:bg-blue-50"
                            )}
                        >
                            <span>{format(day, "d")}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
