import { bookingInterval, describeConflicts, findConflicts } from './conflicts';

const existing = [
    { id: 'a', title: 'Design review', date: '2026-11-27', time: '09:30', duration: 60, status: 'confirmed' },
    { id: 'b', title: 'Standup', date: '2026-11-27', time: '11:00', duration: 15, status: 'pending' },
    { id: 'c', title: 'Old call', date: '2026-11-27', time: '14:00', duration: 60, status: 'cancelled' },
    { id: 'd', title: 'Late deploy', date: '2026-11-27', time: '23:30', duration: 60, status: 'confirmed' },
];

test('builds an interval from date, time and duration', () => {
    const interval = bookingInterval({ date: '2026-11-27', time: '09:30', duration: 45 });
    expect(interval.end - interval.start).toBe(45);
});

test('falls back to an hour when the duration is missing', () => {
    const interval = bookingInterval({ date: '2026-11-27', time: '09:30' });
    expect(interval.end - interval.start).toBe(60);
});

test('returns no interval for malformed dates or times', () => {
    expect(bookingInterval({ date: '', time: '09:30' })).toBeNull();
    expect(bookingInterval({ date: '2026-11-27', time: '25:00' })).toBeNull();
    expect(bookingInterval({ date: '2026-11-27', time: 'soon' })).toBeNull();
    expect(bookingInterval(null)).toBeNull();
});

test('finds a booking that overlaps the candidate', () => {
    const conflicts = findConflicts({ date: '2026-11-27', time: '10:00', duration: 30 }, existing);
    expect(conflicts.map((b) => b.id)).toEqual(['a']);
});

test('treats back to back bookings as free', () => {
    expect(findConflicts({ date: '2026-11-27', time: '10:30', duration: 30 }, existing)).toEqual([]);
    expect(findConflicts({ date: '2026-11-27', time: '09:00', duration: 30 }, existing)).toEqual([]);
});

test('catches a booking that wraps around another one', () => {
    const conflicts = findConflicts({ date: '2026-11-27', time: '09:00', duration: 180 }, existing);
    expect(conflicts.map((b) => b.id)).toEqual(['a', 'b']);
});

test('ignores cancelled bookings and the booking being edited', () => {
    expect(findConflicts({ date: '2026-11-27', time: '14:30', duration: 30 }, existing)).toEqual([]);
    expect(findConflicts({ date: '2026-11-27', time: '09:30', duration: 60 }, existing, 'a')).toEqual([]);
});

test('never reports conflicts for a cancelled candidate', () => {
    expect(
        findConflicts({ date: '2026-11-27', time: '09:30', duration: 60, status: 'cancelled' }, existing)
    ).toEqual([]);
});

test('detects overlaps that cross midnight', () => {
    const conflicts = findConflicts({ date: '2026-11-28', time: '00:15', duration: 30 }, existing);
    expect(conflicts.map((b) => b.id)).toEqual(['d']);
});

test('skips other days and records without a valid time', () => {
    const list = [...existing, { id: 'e', title: 'Broken', date: '2026-11-27', time: '' }];
    expect(findConflicts({ date: '2026-11-26', time: '09:30', duration: 60 }, list)).toEqual([]);
});

test('describes the overlapping bookings', () => {
    expect(describeConflicts([])).toBe('');
    expect(describeConflicts([existing[0]])).toBe(
        'This time overlaps with Design review (2026-11-27 09:30). Pick another time or cancel the other booking.'
    );
});
