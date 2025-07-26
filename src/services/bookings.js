import { db } from "../firebase/config";
import {
    collection,
    doc,
    getDocs,
    query,
    where,
    runTransaction,
    serverTimestamp,
    setDoc,
    deleteDoc,
    updateDoc,
} from "firebase/firestore";

const BOOKINGS = "bookings";

export const getBookings = async () => {
    const snapshot = await getDocs(collection(db, BOOKINGS));
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

// Atomic-ish: check duplicate day for user, then create
export const createBookingAtomic = async ({ userId, startDate, endDate }) => {
    const colRef = collection(db, BOOKINGS);
    const newRef = doc(colRef); // pre-generate id

    await runTransaction(db, async (tx) => {
        // check if user already booked this startDate
        const q = query(
            colRef,
            where("userId", "==", userId),
            where("startDate", "==", startDate)
        );
        const snap = await getDocs(q);
        if (!snap.empty) throw new Error("You already booked this day");

        tx.set(newRef, {
            userId,
            startDate,
            endDate,
            status: "confirmed",
            createdAt: serverTimestamp(),
        });
    });

    return newRef.id;
};

export const deleteBooking = async (id) => deleteDoc(doc(db, BOOKINGS, id));
export const updateBooking = async (id, updates) =>
    updateDoc(doc(db, BOOKINGS, id), updates);
