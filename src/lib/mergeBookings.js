const mergeBookings = (...lists) => {
    const byId = new Map();
    lists.flat().forEach((booking) => {
        if (booking && booking.id && !byId.has(booking.id)) {
            byId.set(booking.id, booking);
        }
    });
    return Array.from(byId.values());
};

export default mergeBookings;
