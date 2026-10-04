import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import App from './App';

jest.mock('react-firebase-hooks/auth', () => ({
    useAuthState: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({})),
    collection: jest.fn(() => ({ path: 'bookings' })),
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
        date: new Date().toISOString().split('T')[0],
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
    const utcToday = new Date().toISOString().split('T')[0];
    const todayCount = records().filter((booking) => booking.date === utcToday).length;

    render(<App />);

    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByText('Total Bookings').parentElement).toHaveTextContent('2');
    expect(screen.getByText("Today's Meetings").parentElement).toHaveTextContent(String(todayCount));

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
    fireEvent.change(document.querySelector('input[type="date"]'), {
        target: { value: '2026-10-20' },
    });
    fireEvent.change(document.querySelector('input[type="time"]'), {
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
