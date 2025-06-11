import { login } from '../hooks/useAuth';

export default function Login() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-semibold">React Firebase Booking</h1>
      <button
        onClick={login}
        className="rounded bg-blue-600 px-6 py-3 text-white shadow hover:bg-blue-700"
      >
        Sign in with Google
      </button>
    </div>
  );
}
