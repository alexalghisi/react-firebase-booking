import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import Login from './Login';

jest.mock('../firebase/config', () => ({
    auth: { app: 'test' },
    db: {},
}));

jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signInWithPopup: jest.fn(),
    GoogleAuthProvider: jest.fn(),
}));

beforeEach(() => {
    signInWithEmailAndPassword.mockReset();
    createUserWithEmailAndPassword.mockReset();
    signInWithPopup.mockReset();
});

test('requires an email and a password', async () => {
    render(<Login />);

    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
});

test('rejects a badly formed email', async () => {
    render(<Login />);

    await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'alex');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
});

test('signs in with email and password', async () => {
    signInWithEmailAndPassword.mockResolvedValue({});
    render(<Login />);

    await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'alex@example.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
            { app: 'test' },
            'alex@example.com',
            'secret'
        );
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeEnabled();
    });
});

test('creates an account from the sign up form', async () => {
    createUserWithEmailAndPassword.mockResolvedValue({});
    render(<Login />);

    await userEvent.click(screen.getByRole('button', { name: /don't have an account/i }));
    await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'alex@example.com');
    await userEvent.type(screen.getByPlaceholderText(/create a password/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
            { app: 'test' },
            'alex@example.com',
            'secret'
        );
        expect(screen.getByRole('button', { name: 'Create Account' })).toBeEnabled();
    });
});

test('starts Google sign in', async () => {
    signInWithPopup.mockResolvedValue({});
    render(<Login />);

    await userEvent.click(screen.getByRole('button', { name: 'Google' }));

    await waitFor(() => {
        expect(signInWithPopup).toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Google' })).toBeEnabled();
    });
});

test('shows a readable message for a bad password', async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/wrong-password', message: 'raw' });
    render(<Login />);

    await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'alex@example.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
    await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeEnabled();
    });
});
