const MINUTES_PER_DAY = 24 * 60;
const DEFAULT_DURATION = 60;

const toMinutes = (time) => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(String(time || ''));
    if (!match) {
        return null;
    }
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) {
        return null;
    }
    return hours * 60 + minutes;
};

const toDayNumber = (dateKey) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateKey || ''));
    if (!match) {
        return null;
    }
    return Math.round(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 86400000);
};

export const bookingInterval = (booking) => {
    const day = toDayNumber(booking?.date);
    const minutes = toMinutes(booking?.time);
    if (day === null || minutes === null) {
        return null;
    }
    const duration = Number(booking.duration);
    const length = Number.isFinite(duration) && duration > 0 ? duration : DEFAULT_DURATION;
    const start = day * MINUTES_PER_DAY + minutes;
    return { start, end: start + length };
};

export const findConflicts = (candidate, bookings = [], ignoreId = null) => {
    if (!candidate || candidate.status === 'cancelled') {
        return [];
    }
    const target = bookingInterval(candidate);
    if (!target) {
        return [];
    }
    return bookings.filter((booking) => {
        if (!booking || booking.status === 'cancelled') {
            return false;
        }
        if (ignoreId && booking.id === ignoreId) {
            return false;
        }
        const other = bookingInterval(booking);
        return Boolean(other) && target.start < other.end && other.start < target.end;
    });
};

export const describeConflicts = (conflicts) => {
    if (!conflicts.length) {
        return '';
    }
    const names = conflicts
        .map((booking) => `${booking.title || 'Untitled'} (${booking.date} ${booking.time})`)
        .join(', ');
    return `This time overlaps with ${names}. Pick another time or cancel the other booking.`;
};
