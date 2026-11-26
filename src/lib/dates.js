const pad = (value) => String(value).padStart(2, '0');

export const toDateKey = (date = new Date()) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const toMonthKey = (date = new Date()) => toDateKey(date).slice(0, 7);

export const addDays = (date, days) => {
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    next.setDate(next.getDate() + days);
    return next;
};

export const parseDateKey = (key) => {
    const [year, month, day] = String(key).split('-').map(Number);
    if (!year || !month || !day) {
        return null;
    }
    return new Date(year, month - 1, day);
};

export const compareBookings = (a, b) =>
    `${a.date || ''} ${a.time || ''}`.localeCompare(`${b.date || ''} ${b.time || ''}`);
