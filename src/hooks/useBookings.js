import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import normalizeBooking from '../lib/normalizeBooking';
import mergeBookings from '../lib/mergeBookings';

const EMPTY = { bookings: [], error: null };

export const useBookings = (user) => {
    const uid = user?.uid || '';
    const email = typeof user?.email === 'string' ? user.email.trim().toLowerCase() : '';
    const [state, setState] = useState(EMPTY);

    useEffect(() => {
        setState(EMPTY);
        if (!uid) {
            return undefined;
        }

        const bookingsRef = collection(db, 'bookings');
        const sources = { owned: [], shared: [] };

        const listen = (key, bookingsQuery) => onSnapshot(
            bookingsQuery,
            (snapshot) => {
                sources[key] = snapshot.docs.map((docSnap) => normalizeBooking(docSnap.id, docSnap.data()));
                setState((prev) => ({ ...prev, bookings: mergeBookings(sources.owned, sources.shared) }));
            },
            (error) => {
                setState((prev) => ({ ...prev, error }));
            }
        );

        const unsubscribers = [listen('owned', query(bookingsRef, where('createdBy', '==', uid)))];
        if (email) {
            unsubscribers.push(listen('shared', query(bookingsRef, where('attendees', 'array-contains', email))));
        }

        return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
    }, [uid, email]);

    return state;
};

export default useBookings;
