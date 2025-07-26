import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, onSnapshot } from "firebase/firestore";

export const useBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, "bookings"),
            (snap) => {
                setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
                setLoading(false);
            },
            (err) => {
                setError(err);
                setLoading(false);
            }
        );
        return unsub;
    }, []);

    return { bookings, loading, error };
};
