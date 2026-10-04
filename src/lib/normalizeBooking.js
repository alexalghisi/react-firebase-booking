const normalizeBooking = (id, data = {}) => ({
    ...data,
    id,
    date: typeof data.date === 'string' ? data.date : '',
    time: typeof data.time === 'string' ? data.time : '',
    attendees: Array.isArray(data.attendees) ? data.attendees : [],
});

export default normalizeBooking;
