import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import IncomingCallModal from "./components/call/IncomingCallModal";
import ActiveCallBar from "./components/call/ActiveCallBar";

import { AuthContext } from "../context/AuthContext";
import { ThemeContextProvider } from "../context/ThemeContext";

const AppContent = () => {
  const { authUser } = useContext(AuthContext);

  return (
    <div className="bg-[url('/bgImage.svg')] bg-cover bg-center min-h-screen transition-colors duration-300 dark:bg-gray-900 bg-gray-50">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Call UI Components */}
      <IncomingCallModal />
      <ActiveCallBar />

      <Routes>
        <Route
          path="/"
          element={authUser ? <Home /> : <Navigate to="/login" />}
        />

        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />

        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <ThemeContextProvider>
      <AppContent />
    </ThemeContextProvider>
  );
};

export default App;
