import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const ref = collection(db, 'bookings');

export const createBooking = async ({ title, start, end, userId }) =>
  addDoc(ref, {
    title,
    start: Timestamp.fromDate(start),
    end: Timestamp.fromDate(end),
    userId,
  });

export const deleteBooking = id => deleteDoc(doc(ref, id));

export const listenBookings = cb =>
  onSnapshot(query(ref, orderBy('start', 'asc')), snap =>
    cb(
      snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          start: data.start.toDate(),
          end: data.end.toDate(),
        };
      }),
    ),
  );
