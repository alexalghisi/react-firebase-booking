import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";

const App = () =>  {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Home />
                    </PrivateRoute>
                }
            />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;