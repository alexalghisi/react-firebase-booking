import { render, screen } from '@testing-library/react';
import { BookingProvider } from '../context/BookingContext';
import Home from './Home';

const bookings = [
    { id: '1', title: 'Night sync', date: '2026-11-27', time: '07:00', status: 'confirmed', attendees: [] },
    { id: '2', title: 'Late review', date: '2026-11-26', time: '18:00', status: 'pending', attendees: [] },
    { id: '3', title: 'Planning', date: '2026-11-28', time: '10:00', status: 'confirmed', attendees: [] },
    { id: '4', title: 'Retro', date: '2026-12-02', time: '15:00', status: 'confirmed', attendees: [] },
];

const renderHome = () =>
    render(
        <BookingProvider value={{ bookings, setShowBookingModal: jest.fn() }}>
            <Home />
        </BookingProvider>
    );

const statValue = (title) => screen.getByRole('region', { name: title }).textContent;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 10, 27, 0, 30));
});

afterEach(() => {
    jest.useRealTimers();
});

test('counts today by the local day just after midnight', () => {
    renderHome();

    expect(statValue("Today's Meetings")).toContain('1');
    expect(statValue('This Month')).toContain('3');
    expect(statValue('Total Bookings')).toContain('4');
});

test('labels the local today and tomorrow in upcoming bookings', () => {
    renderHome();

    expect(screen.getByText(/^Today at 7:00 AM$/)).toBeInTheDocument();
    expect(screen.getByText(/^Tomorrow at 10:00 AM$/)).toBeInTheDocument();
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
    expect(screen.queryByText('Late review')).not.toBeInTheDocument();
});
