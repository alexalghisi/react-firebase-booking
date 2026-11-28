import { act, renderHook } from '@testing-library/react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useBookings } from './useBookings';

jest.mock('../firebase/config', () => ({ db: { name: 'db' } }));

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(() => ({ path: 'bookings' })),
    query: jest.fn((ref, ...constraints) => ({ ref, constraints })),
    where: jest.fn((field, op, value) => ({ field, op, value })),
    onSnapshot: jest.fn(),
}));

const snapshot = (records) => ({
    docs: records.map(({ id, ...data }) => ({ id, data: () => data })),
});

let listeners;

beforeEach(() => {
    listeners = [];
    collection.mockImplementation(() => ({ path: 'bookings' }));
    query.mockImplementation((ref, ...constraints) => ({ ref, constraints }));
    where.mockImplementation((field, op, value) => ({ field, op, value }));
    onSnapshot.mockImplementation((ref, onNext, onError) => {
        const unsubscribe = jest.fn();
        listeners.push({ ref, onNext, onError, unsubscribe });
        return unsubscribe;
    });
});

const listenerFor = (field) => listeners.find((listener) => listener.ref.constraints[0].field === field);

test('only queries bookings the user owns or attends', () => {
    renderHook(() => useBookings({ uid: 'u1', email: ' Alex@Example.com ' }));

    expect(collection).toHaveBeenCalledWith({ name: 'db' }, 'bookings');
    expect(where).toHaveBeenCalledWith('createdBy', '==', 'u1');
    expect(where).toHaveBeenCalledWith('attendees', 'array-contains', 'alex@example.com');
    expect(query).toHaveBeenCalledTimes(2);
    expect(onSnapshot).toHaveBeenCalledTimes(2);
    listeners.forEach((listener) => expect(listener.ref.constraints).toHaveLength(1));
});

test('merges owned and shared bookings without duplicates', () => {
    const { result } = renderHook(() => useBookings({ uid: 'u1', email: 'alex@example.com' }));

    act(() => {
        listenerFor('createdBy').onNext(snapshot([
            { id: 'a', title: 'Mine', createdBy: 'u1', attendees: ['alex@example.com'] },
        ]));
        listenerFor('attendees').onNext(snapshot([
            { id: 'a', title: 'Mine', createdBy: 'u1', attendees: ['alex@example.com'] },
            { id: 'b', title: 'Invited', createdBy: 'u2', attendees: ['alex@example.com'] },
        ]));
    });

    expect(result.current.bookings.map((booking) => booking.id)).toEqual(['a', 'b']);
    expect(result.current.bookings[1]).toMatchObject({ date: '', time: '' });
    expect(result.current.error).toBeNull();
});

test('drops a booking when the user is removed from its attendees', () => {
    const { result } = renderHook(() => useBookings({ uid: 'u1', email: 'alex@example.com' }));

    act(() => {
        listenerFor('attendees').onNext(snapshot([{ id: 'b', title: 'Invited', createdBy: 'u2' }]));
    });
    expect(result.current.bookings).toHaveLength(1);

    act(() => {
        listenerFor('attendees').onNext(snapshot([]));
    });
    expect(result.current.bookings).toEqual([]);
});

test('skips the attendee query when the account has no email', () => {
    renderHook(() => useBookings({ uid: 'u1', email: null }));

    expect(onSnapshot).toHaveBeenCalledTimes(1);
    expect(where).toHaveBeenCalledWith('createdBy', '==', 'u1');
});

test('does not subscribe while signed out', () => {
    const { result } = renderHook(() => useBookings(null));

    expect(onSnapshot).not.toHaveBeenCalled();
    expect(result.current).toEqual({ bookings: [], error: null });
});

test('reports listener errors and keeps bookings already loaded', () => {
    const { result } = renderHook(() => useBookings({ uid: 'u1', email: 'alex@example.com' }));
    const failure = Object.assign(new Error('denied'), { code: 'permission-denied' });

    act(() => {
        listenerFor('createdBy').onNext(snapshot([{ id: 'a', title: 'Mine' }]));
        listenerFor('attendees').onError(failure);
    });

    expect(result.current.error).toBe(failure);
    expect(result.current.bookings.map((booking) => booking.id)).toEqual(['a']);
});

test('unsubscribes and clears bookings when the user signs out', () => {
    const { result, rerender } = renderHook(({ user }) => useBookings(user), {
        initialProps: { user: { uid: 'u1', email: 'alex@example.com' } },
    });
    act(() => {
        listenerFor('createdBy').onNext(snapshot([{ id: 'a', title: 'Mine' }]));
    });
    const first = [...listeners];

    rerender({ user: null });

    first.forEach((listener) => expect(listener.unsubscribe).toHaveBeenCalledTimes(1));
    expect(result.current.bookings).toEqual([]);
});

test('resubscribes for a different account', () => {
    const { rerender } = renderHook(({ user }) => useBookings(user), {
        initialProps: { user: { uid: 'u1', email: 'alex@example.com' } },
    });

    rerender({ user: { uid: 'u2', email: 'sam@example.com' } });

    expect(onSnapshot).toHaveBeenCalledTimes(4);
    expect(where).toHaveBeenLastCalledWith('attendees', 'array-contains', 'sam@example.com');
    listeners.slice(0, 2).forEach((listener) => expect(listener.unsubscribe).toHaveBeenCalled());
});
