import { addDays, compareBookings, parseDateKey, toDateKey, toMonthKey } from './dates';

test('builds the date key from the local calendar day', () => {
    expect(toDateKey(new Date(2026, 10, 27, 0, 30))).toBe('2026-11-27');
    expect(toDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
});

test('builds the month key from the local calendar day', () => {
    expect(toMonthKey(new Date(2026, 11, 1, 0, 15))).toBe('2026-12');
});

test('adds days across month and year boundaries', () => {
    expect(toDateKey(addDays(new Date(2026, 11, 31, 22), 1))).toBe('2027-01-01');
    expect(toDateKey(addDays(new Date(2026, 2, 1), -1))).toBe('2026-02-28');
});

test('parses a date key as a local day', () => {
    const date = parseDateKey('2026-11-27');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(10);
    expect(date.getDate()).toBe(27);
    expect(parseDateKey('')).toBeNull();
    expect(parseDateKey(undefined)).toBeNull();
});

test('orders bookings by date then time', () => {
    const list = [
        { id: 'c', date: '2026-11-28', time: '08:00' },
        { id: 'b', date: '2026-11-27', time: '16:00' },
        { id: 'a', date: '2026-11-27', time: '09:30' },
    ];
    expect([...list].sort(compareBookings).map((b) => b.id)).toEqual(['a', 'b', 'c']);
});
