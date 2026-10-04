import React, { useMemo, useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useBookingContext } from '../context/BookingContext';

const statusClass = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
};

const AllBookings = () => {
    const { bookings, setShowBookingModal, setEditingBooking, user } = useBookingContext();
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [error, setError] = useState('');

    const visible = useMemo(() => {
        const needle = query.trim().toLowerCase();

        return bookings
            .filter((booking) => status === 'all' || booking.status === status)
            .filter((booking) => {
                if (!needle) {
                    return true;
                }
                const title = (booking.title || '').toLowerCase();
                const attendees = (booking.attendees || []).join(' ').toLowerCase();
                return title.includes(needle) || attendees.includes(needle);
            })
            .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
    }, [bookings, query, status]);

    const openCreate = () => {
        setEditingBooking(null);
        setShowBookingModal(true);
    };

    const openEdit = (booking) => {
        setEditingBooking(booking);
        setShowBookingModal(true);
    };

    const remove = async (booking) => {
        setError('');
        try {
            await deleteDoc(doc(db, 'bookings', booking.id));
            setPendingDeleteId(null);
        } catch (err) {
            console.error('Error deleting booking:', err);
            setError('Failed to delete booking. Please try again.');
        }
    };

    return (
        <div className="p-6">
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
                            <p className="text-gray-600 mt-1">Search, filter, and update your meetings.</p>
                        </div>
                        <button
                            type="button"
                            onClick={openCreate}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Booking</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="md:col-span-2">
                            <label htmlFor="booking-search" className="block text-sm font-medium text-gray-700 mb-1">
                                Search
                            </label>
                            <input
                                id="booking-search"
                                type="search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Title or attendee email"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label htmlFor="booking-status" className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                id="booking-status"
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="p-6 overflow-x-auto">
                    {visible.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No bookings match your search</p>
                        </div>
                    ) : (
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b border-gray-200">
                                    <th scope="col" className="py-3 pr-4 font-medium">Title</th>
                                    <th scope="col" className="py-3 pr-4 font-medium">Date</th>
                                    <th scope="col" className="py-3 pr-4 font-medium">Time</th>
                                    <th scope="col" className="py-3 pr-4 font-medium">Status</th>
                                    <th scope="col" className="py-3 pr-4 font-medium">Attendees</th>
                                    <th scope="col" className="py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((booking) => (
                                    <tr key={booking.id} className="border-b border-gray-100">
                                        <td className="py-3 pr-4 font-medium text-gray-900">{booking.title}</td>
                                        <td className="py-3 pr-4 text-gray-600">{booking.date}</td>
                                        <td className="py-3 pr-4 text-gray-600">{booking.time}</td>
                                        <td className="py-3 pr-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${statusClass[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4 text-gray-600">
                                            {(booking.attendees || []).join(', ')}
                                        </td>
                                        <td className="py-3 text-right">
                                            {booking.createdBy === user.uid ? (
                                                pendingDeleteId === booking.id ? (
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => remove(booking)}
                                                            className="px-3 py-1 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
                                                        >
                                                            Delete
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setPendingDeleteId(null)}
                                                            className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            type="button"
                                                            aria-label={`Edit ${booking.title}`}
                                                            onClick={() => openEdit(booking)}
                                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            aria-label={`Delete ${booking.title}`}
                                                            onClick={() => setPendingDeleteId(booking.id)}
                                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )
                                            ) : (
                                                <span className="text-xs text-gray-400">Shared</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllBookings;
