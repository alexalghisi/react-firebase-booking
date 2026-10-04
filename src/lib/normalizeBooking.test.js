import normalizeBooking from './normalizeBooking';

test('keeps a complete booking and its id', () => {
    const booking = normalizeBooking('b1', {
        title: 'Design review',
        date: '2026-10-04',
        time: '09:30',
        attendees: ['sam@example.com'],
        createdBy: 'u1',
    });

    expect(booking).toMatchObject({
        id: 'b1',
        title: 'Design review',
        date: '2026-10-04',
        time: '09:30',
        attendees: ['sam@example.com'],
        createdBy: 'u1',
    });
});

test('fills date, time and attendees when a record is partial', () => {
    const booking = normalizeBooking('b2', { createdBy: 'u1', attendees: 'sam@example.com' });

    expect(booking.date).toBe('');
    expect(booking.time).toBe('');
    expect(booking.attendees).toEqual([]);
    expect(booking.createdBy).toBe('u1');
});
