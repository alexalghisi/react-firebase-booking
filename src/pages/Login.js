import './styles/Login.css';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
    const { login } = useAuth();

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">React Firebase Booking</h1>
                <p className="login-tagline">Book your appointments with ease</p>
                <button className="login-button" onClick={login}>
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}
