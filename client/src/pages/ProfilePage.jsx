import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext.jsx";
import { ChatContext } from "../../context/ChatContext";
import { motion, AnimatePresence } from "framer-motion";

function ProfilePage() {
  const { authUser, updateProfile } = useContext(AuthContext);
  const { axios, blockUser, unblockUser } = useContext(AuthContext);

  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [showStarredModal, setShowStarredModal] = useState(false);
  const [starredMessages, setStarredMessages] = useState([]);
  const { setSelectedUser, setScrollToMessageId } = useContext(ChatContext);

  useEffect(() => {
    const fetchBlocked = async () => {
      try {
        const res = await axios.get("/api/friends/blocked");
        setBlockedUsers(res.data.blocked || []);
      } catch (err) {
        // ignore
      }
    };
    if (authUser) fetchBlocked();
    // fetch starred messages lazily when opening modal (handled by UI)
  }, [authUser]);

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(authUser?.ProfilePic || null);

  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(
    authUser?.bio || "Hey there, I am using VibeTalk!"
  );

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      await updateProfile({ fullName: name, bio });
      navigate("/");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result;
      await updateProfile({
        fullName: name,
        bio,
        profilePicture: dataUrl,
      });
      navigate("/");
    };
    reader.readAsDataURL(imageFile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-6 bg-fixed">
        
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-4xl bg-gray-900/40 backdrop-blur-3xl border border-white/10 flex items-start justify-between max-md:flex-col-reverse rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 p-10 flex-1 w-full"
        >
          <div className="space-y-1">
            <h3 className="text-3xl font-bold text-white tracking-tight">Profile Settings</h3>
            <p className="text-gray-400 text-sm">Update your personal information</p>
          </div>

          <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-white/10 transition-colors">
            <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Your User ID</p>
                <p className="text-xl font-mono font-bold tracking-wider text-purple-300">
                {authUser?.userId || "N/A"}
                </p>
            </div>
            <button 
                type="button"
                className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg transition-colors border border-white/5"
                onClick={() => {
                    navigator.clipboard.writeText(authUser?.userId);
                    // could add toast here
                }}
            >
                Copy
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer">
                <input
                onChange={handleImageChange}
                type="file"
                id="avatar"
                accept=".png, .jpg, .jpeg"
                hidden
                />
                <label htmlFor="avatar" className="cursor-pointer block relative">
                    <img
                        src={previewUrl || assets.avatar_icon}
                        alt="Avatar"
                        className={`w-24 h-24 rounded-full object-cover border-4 border-gray-800 shadow-xl group-hover:border-purple-500/50 transition-all duration-300 ${previewUrl ? "" : "opacity-80"}`}
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                        <span className="text-white text-xs font-medium">Change</span>
                    </div>
                    {/* Online Status Indicator (Decoration) */}
                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-gray-900 rounded-full" />
                </label>
            </div>
            <div className="flex-1">
                 <p className="text-white font-medium text-lg">Profile Photo</p>
                 <p className="text-gray-500 text-sm">Click to upload a new avatar</p>
            </div>
          </div>

          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-sm text-gray-300 font-medium ml-1">Full Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-black/40 transition-all placeholder-gray-600"
                />
             </div>

             <div className="space-y-2">
                <label className="text-sm text-gray-300 font-medium ml-1">Bio</label>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-black/40 transition-all placeholder-gray-600 resize-none"
                />
             </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-3.5 px-8 rounded-xl shadow-lg shadow-purple-900/20 transition-all"
          >
            Save Changes
          </motion.button>
        </form>

        <div className="p-10 bg-black/20 md:w-80 md:border-l border-white/5 flex flex-col gap-4 h-full shrink-0">
           <h4 className="text-white font-semibold mb-2">Account Actions</h4>
           
           <motion.button
            whileHover={{ x: 5, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
            onClick={() => setShowBlockedModal(true)}
            className="w-full text-left bg-white/5 text-gray-300 px-4 py-3 rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group"
          >
            Blocked Users
            <span className="text-gray-500 group-hover:text-white transition-colors">→</span>
          </motion.button>
          
          <motion.button
            whileHover={{ x: 5, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
            onClick={async () => {
              try {
                const res = await axios.get("/api/messages/starred");
                setStarredMessages(res.data.starred || []);
                setShowStarredModal(true);
              } catch (err) {
                console.error("fetch starred failed:", err);
              }
            }}
            className="w-full text-left bg-white/5 text-gray-300 px-4 py-3 rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group"
          >
            Starred Messages
            <span className="text-gray-500 group-hover:text-white transition-colors">→</span>
          </motion.button>

        </div>

        {/* Modals Reuse Existing Logic with Improved Styling Wrapper if needed, 
            but keeping structure simple for now as per "clean css" request 
            Mocking improved modal look by classNames in existing structure? 
            Or simple re-render. 
            The existing modals are inline conditionally rendered. 
            I will keep them but wrap in a portal or just style them better inline.
        */}
        
        <AnimatePresence>
        {showBlockedModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
                 initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                 className="bg-[#1a1625] border border-white/10 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/20">
                <h3 className="text-lg font-bold text-white">Blocked Users</h3>
                <button
                  onClick={() => setShowBlockedModal(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
              {blockedUsers.length > 0 ? (
                <div className="space-y-1">
                  {blockedUsers.map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center gap-3 hover:bg-white/5 rounded-xl p-3 transition-colors group"
                    >
                      <img
                        src={u.ProfilePic || assets.avatar_icon}
                        alt={u.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-200 truncate">{u.fullName}</p>
                        <p className="text-xs text-gray-500 font-mono">ID: {u.userId}</p>
                      </div>
                      <button
                          onClick={() => {
                            unblockUser(u._id);
                            setBlockedUsers(
                              blockedUsers.filter((b) => b._id !== u._id)
                            );
                          }}
                          className="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors"
                        >
                          Unblock
                        </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                   <p>No blocked users found</p>
                </div>
              )}
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        <AnimatePresence>
        {showStarredModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-[#1a1625] border border-white/10 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/20">
                <h3 className="text-lg font-bold text-white">Starred Messages</h3>
                <button
                  onClick={() => setShowStarredModal(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
              {starredMessages.length > 0 ? (
                <div className="space-y-1">
                  {starredMessages.map((m) => {
                    const otherUser =
                      String(m.senderId?._id) === String(authUser?._id)
                        ? m.receiverId
                        : m.senderId;
                    return (
                      <div
                        key={m._id}
                        onClick={() => {
                          setSelectedUser(otherUser);
                          setScrollToMessageId(m._id);
                          setShowStarredModal(false);
                          navigate("/");
                        }}
                        className="flex cursor-pointer items-start gap-3 hover:bg-white/5 rounded-xl p-3 transition-colors group"
                      >
                        <img
                          src={otherUser?.ProfilePic || assets.avatar_icon}
                          alt={otherUser?.fullName}
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-200 truncate">{otherUser?.fullName}</p>
                          <p className="text-sm text-gray-400 mb-1 line-clamp-2">
                            {m.text || (m.image ? "📷 Image" : "(empty)")}
                          </p>
                          <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await axios.delete(
                                    `/api/messages/star/${m._id}`
                                  );
                                  setStarredMessages((s) =>
                                    s.filter((x) => x._id !== m._id)
                                  );
                                } catch (err) {
                                  console.error("unstar failed:", err);
                                }
                              }}
                              className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                            >
                              Unstar
                            </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                   <p>No starred messages found</p>
                </div>
              )}
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}

export default ProfilePage;
