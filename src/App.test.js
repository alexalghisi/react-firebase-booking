import { render, screen } from '@testing-library/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { onSnapshot } from 'firebase/firestore';
import App from './App';

jest.mock('react-firebase-hooks/auth', () => ({
    useAuthState: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({})),
    collection: jest.fn(() => ({ path: 'bookings' })),
    query: jest.fn((ref, ...constraints) => ({ ref, constraints })),
    where: jest.fn((field, op, value) => ({ field, op, value })),
    onSnapshot: jest.fn((ref, onNext) => {
        onNext({ docs: [] });
        return jest.fn();
    }),
    addDoc: jest.fn(),
    doc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
}));

const user = {
    uid: 'u1',
    email: 'alex@example.com',
    displayName: 'Alex',
};

beforeEach(() => {
    useAuthState.mockReset();
    onSnapshot.mockImplementation((ref, onNext) => {
        onNext({ docs: [] });
        return jest.fn();
    });
});

test('shows the sign in screen when nobody is logged in', () => {
    useAuthState.mockReturnValue([null, false, undefined]);

    render(<App />);

    expect(screen.getByRole('heading', { name: /booking system/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
});

test('shows a loading state while auth is resolving', () => {
    useAuthState.mockReturnValue([undefined, true, undefined]);

    render(<App />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

test('shows the auth error message', () => {
    useAuthState.mockReturnValue([null, false, { message: 'Auth down' }]);

    render(<App />);

    expect(screen.getByText(/auth down/i)).toBeInTheDocument();
});

test('opens the dashboard for a signed in user', () => {
    useAuthState.mockReturnValue([user, false, undefined]);
    onSnapshot.mockImplementation((ref, onNext) => {
        onNext({
            docs: [
                {
                    id: 'bare',
                    data: () => ({ createdBy: 'u1', title: 'Untitled' }),
                },
            ],
        });
        return jest.fn();
    });

    render(<App />);

    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Total Bookings' })).toHaveTextContent('1');
    expect(screen.getByText('Alex')).toBeInTheDocument();
});

test('tells the user when their bookings cannot be loaded', () => {
    useAuthState.mockReturnValue([user, false, undefined]);
    onSnapshot.mockImplementation((ref, onNext, onError) => {
        onError(Object.assign(new Error('denied'), { code: 'permission-denied' }));
        return jest.fn();
    });

    render(<App />);

    expect(screen.getByRole('alert')).toHaveTextContent('Your bookings could not be loaded.');
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
});
