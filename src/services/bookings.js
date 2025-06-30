import { db } from "../firebase/config";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

export const getBookings = async () => {
    const snapshot = await getDocs(collection(db, "bookings"));
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
};

export const createBooking = async (booking) => {
    const docRef = await addDoc(collection(db, "bookings"), booking);
    return docRef.id;
};

export const deleteBooking = async (id) => {
    await deleteDoc(doc(db, "bookings", id));
};

export const updateBooking = async (id, updates) => {
    await updateDoc(doc(db, "bookings", id), updates);
};