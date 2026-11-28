import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addDoc, collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import App from './App';
import { toDateKey } from './lib/dates';

jest.mock('react-firebase-hooks/auth', () => ({
    useAuthState: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({})),
    collection: jest.fn(() => ({ path: 'bookings' })),
    query: jest.fn((ref, ...constraints) => ({ ref, constraints })),
    where: jest.fn((field, op, value) => ({ field, op, value })),
    onSnapshot: jest.fn(),
    addDoc: jest.fn(() => Promise.resolve({ id: 'new' })),
    doc: jest.fn((db, collectionName, id) => ({ collectionName, id })),
    updateDoc: jest.fn(() => Promise.resolve()),
    deleteDoc: jest.fn(() => Promise.resolve()),
}));

const user = {
    uid: 'u1',
    email: 'alex@example.com',
    displayName: 'Alex',
};

const localDate = (day) => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${String(day).padStart(2, '0')}`;
};

const records = () => ([
    {
        id: '1',
        title: 'Design review',
        date: localDate(15),
        time: '09:30',
        duration: 60,
        status: 'confirmed',
        attendees: ['sam@example.com'],
        description: 'Board',
        createdBy: 'u1',
    },
    {
        id: '2',
        title: 'Standup',
        date: toDateKey(),
        time: '16:00',
        duration: 15,
        status: 'pending',
        attendees: [],
        description: '',
        createdBy: 'u1',
    },
]);

const openNav = async (name) => {
    const links = screen.getAllByRole('link', { name });
    await userEvent.click(links[0]);
};

beforeEach(() => {
    window.history.pushState({}, '', '/');
    useAuthState.mockReturnValue([user, false, undefined]);
    collection.mockReturnValue({ path: 'bookings' });
    doc.mockImplementation((database, collectionName, id) => ({ collectionName, id }));
    addDoc.mockResolvedValue({ id: 'new' });
    onSnapshot.mockImplementation((ref, onNext) => {
        onNext({
            docs: records().map((booking) => ({
                id: booking.id,
                data: () => booking,
            })),
        });
        return jest.fn();
    });
});

test('moves from the dashboard to the calendar and creates a booking', async () => {
    const today = toDateKey();
    const todayCount = records().filter((booking) => booking.date === today).length;

    render(<App />);

    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Total Bookings' })).toHaveTextContent('2');
    expect(screen.getByRole('region', { name: "Today's Meetings" })).toHaveTextContent(String(todayCount));

    await openNav('Calendar');
    expect(screen.getByText('Design review')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Add Booking' }));
    expect(screen.getByRole('heading', { name: 'Create New Booking' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Create Booking' }));
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Date is required')).toBeInTheDocument();
    expect(screen.getByText('Time is required')).toBeInTheDocument();
    expect(addDoc).not.toHaveBeenCalled();

    await userEvent.type(screen.getByPlaceholderText('Enter booking title'), 'Lunch');
    fireEvent.change(screen.getByLabelText(/^Date/), {
        target: { value: '2026-10-20' },
    });
    fireEvent.change(screen.getByLabelText(/^Time/), {
        target: { value: '10:15' },
    });
    await userEvent.type(
        screen.getByPlaceholderText('Enter email addresses, separated by commas'),
        'sam@example.com'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Create Booking' }));

    expect(addDoc).toHaveBeenCalledWith(
        { path: 'bookings' },
        expect.objectContaining({
            title: 'Lunch',
            date: '2026-10-20',
            time: '10:15',
            attendees: ['sam@example.com'],
            createdBy: 'u1',
            status: 'confirmed',
        })
    );
});

test('lists bookings and edits one from the bookings page', async () => {
    render(<App />);

    await openNav('All Bookings');

    expect(screen.getByRole('heading', { name: 'All Bookings' })).toBeInTheDocument();
    expect(screen.getByText('Standup')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Search'), 'design');
    expect(screen.getByText('Design review')).toBeInTheDocument();
    expect(screen.queryByText('Standup')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Edit Design review' }));
    expect(screen.getByRole('heading', { name: 'Edit Booking' })).toBeInTheDocument();
    expect(await screen.findByDisplayValue('Design review')).toBeInTheDocument();
});

test('blocks a booking that overlaps an existing one until the time is moved', async () => {
    render(<App />);

    await openNav('Calendar');
    await userEvent.click(screen.getByRole('button', { name: 'Add Booking' }));

    await userEvent.type(screen.getByPlaceholderText('Enter booking title'), 'Clash');
    fireEvent.change(screen.getByLabelText(/^Date/), { target: { value: localDate(15) } });
    fireEvent.change(screen.getByLabelText(/^Time/), { target: { value: '10:00' } });
    await userEvent.click(screen.getByRole('button', { name: 'Create Booking' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
        `This time overlaps with Design review (${localDate(15)} 09:30)`
    );
    expect(addDoc).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/^Time/), { target: { value: '10:30' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Create Booking' }));

    expect(addDoc).toHaveBeenCalledWith(
        { path: 'bookings' },
        expect.objectContaining({ title: 'Clash', date: localDate(15), time: '10:30' })
    );
});

test('allows a booking that only overlaps a cancelled one', async () => {
    render(<App />);

    await openNav('Calendar');
    await userEvent.click(screen.getByRole('button', { name: 'Add Booking' }));

    await userEvent.type(screen.getByPlaceholderText('Enter booking title'), 'Second');
    fireEvent.change(screen.getByLabelText(/^Date/), { target: { value: localDate(15) } });
    fireEvent.change(screen.getByLabelText(/^Time/), { target: { value: '09:45' } });
    await userEvent.selectOptions(screen.getByLabelText('Status'), 'cancelled');
    await userEvent.click(screen.getByRole('button', { name: 'Create Booking' }));

    expect(addDoc).toHaveBeenCalledWith(
        { path: 'bookings' },
        expect.objectContaining({ title: 'Second', status: 'cancelled' })
    );
});

test('saves an edited booking without flagging itself as a conflict', async () => {
    render(<App />);

    await openNav('All Bookings');
    await userEvent.click(screen.getByRole('button', { name: 'Edit Design review' }));
    await screen.findByDisplayValue('Design review');
    await userEvent.click(screen.getByRole('button', { name: 'Update Booking' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(updateDoc).toHaveBeenCalledWith(
        { collectionName: 'bookings', id: '1' },
        expect.objectContaining({ title: 'Design review', time: '09:30' })
    );
});

test('exposes the booking form as a dialog that closes with Escape', async () => {
    render(<App />);

    await openNav('Calendar');
    await userEvent.click(screen.getByRole('button', { name: 'Add Booking' }));

    expect(screen.getByRole('dialog', { name: 'Create New Booking' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Add Booking' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('saves attendee emails in lower case without duplicates', async () => {
    render(<App />);

    await openNav('Calendar');
    await userEvent.click(screen.getByRole('button', { name: 'Add Booking' }));

    await userEvent.type(screen.getByPlaceholderText('Enter booking title'), 'Planning');
    fireEvent.change(screen.getByLabelText(/^Date/), { target: { value: localDate(20) } });
    fireEvent.change(screen.getByLabelText(/^Time/), { target: { value: '12:00' } });
    fireEvent.change(screen.getByLabelText(/^Attendees/), {
        target: { value: 'Sam@Example.com, sam@example.com , ,JO@example.com' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Create Booking' }));

    expect(addDoc).toHaveBeenCalledWith(
        { path: 'bookings' },
        expect.objectContaining({ attendees: ['sam@example.com', 'jo@example.com'], createdBy: 'u1' })
    );
});

test('rejects a title longer than the stored limit', async () => {
    render(<App />);

    await openNav('Calendar');
    await userEvent.click(screen.getByRole('button', { name: 'Add Booking' }));

    expect(screen.getByLabelText(/^Title/)).toHaveAttribute('maxLength', '200');
    fireEvent.change(screen.getByLabelText(/^Title/), { target: { value: 'x'.repeat(201) } });
    fireEvent.change(screen.getByLabelText(/^Date/), { target: { value: localDate(20) } });
    fireEvent.change(screen.getByLabelText(/^Time/), { target: { value: '12:00' } });
    await userEvent.click(screen.getByRole('button', { name: 'Create Booking' }));

    expect(screen.getByText('Title must be 200 characters or fewer')).toBeInTheDocument();
    expect(addDoc).not.toHaveBeenCalled();
});

test('explains when the server refuses to save a booking', async () => {
    addDoc.mockRejectedValueOnce(Object.assign(new Error('denied'), { code: 'permission-denied' }));
    render(<App />);

    await openNav('Calendar');
    await userEvent.click(screen.getByRole('button', { name: 'Add Booking' }));

    await userEvent.type(screen.getByPlaceholderText('Enter booking title'), 'Planning');
    fireEvent.change(screen.getByLabelText(/^Date/), { target: { value: localDate(20) } });
    fireEvent.change(screen.getByLabelText(/^Time/), { target: { value: '12:00' } });
    await userEvent.click(screen.getByRole('button', { name: 'Create Booking' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('You do not have permission to save this booking.');
    expect(screen.getByRole('dialog', { name: 'Create New Booking' })).toBeInTheDocument();
});

test('keeps the original owner when an edited booking is saved', async () => {
    render(<App />);

    await openNav('All Bookings');
    await userEvent.click(screen.getByRole('button', { name: 'Edit Standup' }));
    await screen.findByDisplayValue('Standup');
    await userEvent.click(screen.getByRole('button', { name: 'Update Booking' }));

    expect(updateDoc).toHaveBeenCalledWith(
        { collectionName: 'bookings', id: '2' },
        expect.objectContaining({ createdBy: 'u1' })
    );
});
