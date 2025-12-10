import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { io } from "socket.io-client";

export const AuthContext = createContext();

const BACKEND_ORIGIN =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

axios.defaults.baseURL = BACKEND_ORIGIN;
axios.defaults.withCredentials = true;

export { BACKEND_ORIGIN as backendURL };

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);

  const connectSocket = (user) => {
    if (!user || socket) return;

    const newSocket = io(BACKEND_ORIGIN, {
      query: { userId: String(user._id) },
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    newSocket.on("newFriendRequest", (request) => {
      setFriendRequests((prev) => [request, ...prev]);
      toast(`Friend request from ${request.sender.fullName}`, {
        icon: "👋",
      });
    });

    newSocket.on("friendRequestAccepted", (friend) => {
      toast.success(`${friend.fullName} accepted your friend request!`);
      checkAuth(); // Refresh to get updated friend list
    });

    newSocket.on("friendRemoved", ({ userId }) => {
      toast.error("A friend removed you from their list");
      checkAuth(); // Refresh to get updated friend list
    });
  };

  const checkAuth = async () => {
    try {
      const res = await axios.get("/api/users/check");
      const user = res.data.user;
      setAuthUser(user);
      connectSocket(user);

      // Fetch friend requests
      const friendReqRes = await axios.get("/api/friends/requests");
      setFriendRequests(friendReqRes.data);
    } catch (error) {
      console.error("checkAuth error:", error);
      setAuthUser(null);
      socket?.disconnect();
      setSocket(null);
    }
  };

  useEffect(() => {
    checkAuth();
    return () => socket?.disconnect();
  }, []);

  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/users/${state}`, credentials);

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
      await axios.post("/api/users/logout"); // 👈

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
      const res = await axios.put("/api/users/update-profile", updatedData);
      toast.success("Profile updated");
      setAuthUser(res.data.user);
      return res.data.user;
    } catch (err) {
      toast.error(err.response?.data?.message || "Profile update failed");
      return null;
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      await axios.post("/api/friends/request", { userId });
      toast.success("Friend request sent!");
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data || {};
      // If blocked by self (you have blocked them) allow unblock and retry
      if (status === 403 && data.blockedUserId) {
        const shouldUnblock = window.confirm(
          "You have blocked this user. Unblock them to send a friend request?"
        );
        if (shouldUnblock) {
          try {
            await unblockUser(data.blockedUserId);
            // retry
            await axios.post("/api/friends/request", { userId });
            toast.success("Friend request sent!");
            return;
          } catch (retryErr) {
            toast.error(
              retryErr.response?.data?.message || "Failed after unblocking"
            );
            return;
          }
        }
      }

      toast.error(data.message || "Failed to send friend request");
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      await axios.put(`/api/friends/accept/${requestId}`);
      toast.success("Friend request accepted!");
      setFriendRequests((prev) => prev.filter((req) => req._id !== requestId));
      checkAuth(); // Refresh to get updated friend list
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to accept friend request"
      );
    }
  };

  const declineFriendRequest = async (requestId) => {
    try {
      await axios.put(`/api/friends/decline/${requestId}`);
      toast.success("Friend request declined");
      setFriendRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to decline friend request"
      );
    }
  };

  const removeFriend = async (friendId) => {
    try {
      await axios.delete(`/api/friends/remove/${friendId}`);
      toast.success("Friend removed");
      checkAuth(); // Refresh to get updated friend list
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove friend");
    }
  };

  const blockUser = async (userId) => {
    try {
      await axios.post(`/api/friends/block/${userId}`);
      toast.success("User blocked");
      checkAuth();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to block user");
    }
  };

  const unblockUser = async (userId) => {
    try {
      await axios.delete(`/api/friends/block/${userId}`);
      toast.success("User unblocked");
      checkAuth();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to unblock user");
    }
  };

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    friendRequests,
    login,
    logout,
    updateProfile,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
