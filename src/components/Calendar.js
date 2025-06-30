import React from "react";

export default function Calendar({ bookings = [] }) {
  const daysInMonth = 31; // static example
  const today = new Date().getDate();

  const isBooked = (day) => bookings.includes(day);

  return (
      <div className="grid grid-cols-7 gap-1 p-4 max-w-3xl mx-auto">
        {Array.from({ length: daysInMonth }, (_, i) => (
            <div
                key={i}
                className={`rounded p-4 text-center border 
            ${isBooked(i + 1) ? "bg-red-300" : "bg-gray-100"}
            ${i + 1 === today ? "border-2 border-blue-500" : ""}
            hover:bg-blue-200 cursor-pointer transition`}
            >
              {i + 1}
            </div>
        ))}
      </div>
  );
}
