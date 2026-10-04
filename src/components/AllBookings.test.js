import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { deleteDoc, doc } from 'firebase/firestore';
import { BookingProvider } from '../context/BookingContext';
import AllBookings from './AllBookings';

jest.mock('../firebase/config', () => ({
    db: { name: 'db' },
    auth: {},
}));

jest.mock('firebase/firestore', () => ({
    deleteDoc: jest.fn(() => Promise.resolve()),
    doc: jest.fn((db, collectionName, id) => ({ db, collectionName, id })),
}));

const bookings = [
    {
        id: '1',
        title: 'Design review',
        date: '2026-10-15',
        time: '09:30',
        status: 'confirmed',
        attendees: ['sam@example.com'],
        createdBy: 'u1',
    },
    {
        id: '2',
        title: 'Payroll',
        date: '2026-10-16',
        time: '11:00',
        status: 'pending',
        attendees: [],
        createdBy: 'u1',
    },
    {
        id: '3',
        title: 'Offsite',
        date: '2026-10-17',
        time: '13:00',
        status: 'cancelled',
        attendees: ['alex@example.com'],
        createdBy: 'other',
    },
];

const renderList = () => {
    const setShowBookingModal = jest.fn();
    const setEditingBooking = jest.fn();

    render(
        <BookingProvider
            value={{
                bookings,
                setShowBookingModal,
                setEditingBooking,
                user: { uid: 'u1', email: 'alex@example.com' },
            }}
        >
            <AllBookings />
        </BookingProvider>
    );

    return { setShowBookingModal, setEditingBooking };
};

beforeEach(() => {
    doc.mockImplementation((db, collectionName, id) => ({ db, collectionName, id }));
    deleteDoc.mockResolvedValue();
});

test('filters by title, attendee and status', async () => {
    renderList();

    expect(screen.getByText('Design review')).toBeInTheDocument();
    expect(screen.getByText('Payroll')).toBeInTheDocument();
    expect(screen.getByText('Offsite')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Search'), 'sam@example.com');
    expect(screen.getByText('Design review')).toBeInTheDocument();
    expect(screen.queryByText('Payroll')).not.toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText('Search'));
    await userEvent.selectOptions(screen.getByLabelText('Status'), 'cancelled');
    expect(screen.getByText('Offsite')).toBeInTheDocument();
    expect(screen.queryByText('Design review')).not.toBeInTheDocument();
    expect(screen.getByText('Shared')).toBeInTheDocument();
});

test('opens the editor for a booking you own', async () => {
    const { setShowBookingModal, setEditingBooking } = renderList();

    await userEvent.click(screen.getByRole('button', { name: 'Edit Design review' }));

    expect(setEditingBooking).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
    expect(setShowBookingModal).toHaveBeenCalledWith(true);
});

test('asks for confirmation before deleting', async () => {
    renderList();

    await userEvent.click(screen.getByRole('button', { name: 'Delete Design review' }));
    expect(deleteDoc).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(deleteDoc).toHaveBeenCalledTimes(1);
    expect(doc).toHaveBeenCalledWith({ name: 'db' }, 'bookings', '1');
    expect(deleteDoc).toHaveBeenCalledWith({
        db: { name: 'db' },
        collectionName: 'bookings',
        id: '1',
    });
});

test('shows an empty message when nothing matches', async () => {
    renderList();

    await userEvent.type(screen.getByLabelText('Search'), 'missing');

    expect(screen.getByText('No bookings match your search')).toBeInTheDocument();
});
