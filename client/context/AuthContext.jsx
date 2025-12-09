// AuthContext.jsx
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { io } from "socket.io-client";

export const AuthContext = createContext();

const BACKEND_ORIGIN =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

axios.defaults.baseURL = `${BACKEND_ORIGIN}/api`;
axios.defaults.withCredentials = true;

export { BACKEND_ORIGIN as backendURL };

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  const connectSocket = (user) => {
    if (!user || socket) {
      console.log("connectSocket skipped:", {
        hasUser: !!user,
        hasSocket: !!socket,
      });
      return;
    }

    const newSocket = io(BACKEND_ORIGIN, {
      query: { userId: String(user._id) },
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected!", newSocket.id, "user:", user._id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err);
    });
  };

  const checkAuth = async () => {
    try {
      const res = await axios.get("/users/check");
      const user = res.data.user;
      setAuthUser(user);
      connectSocket(user);
    } catch (error) {
      console.error("checkAuth error:", error);
      setAuthUser(null);
      if (socket) socket.disconnect();
    }
  };

  useEffect(() => {
    checkAuth();
    return () => socket?.disconnect();
  }, []);

  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/users/${state}`, credentials);

      await checkAuth();

      toast.success(
        data?.message || `${state === "login" ? "Login" : "Sign up"} successful`
      );
      return true;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (state === "login" ? "Login failed" : "Sign up failed");
      toast.error(msg);
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post("/users/logout");
      toast.success("Logged out successfully");
      setAuthUser(null);
      socket?.disconnect();
      setSocket(null);
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      const res = await axios.put("/users/update-profile", updatedData);
      toast.success("Profile updated");
      setAuthUser(res.data.user);
      return res.data.user;
    } catch (err) {
      toast.error(err.response?.data?.message || "Profile update failed");
      return null;
    }
  };

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
