import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext.jsx";

function ProfilePage() {
  const { authUser, updateProfile } = useContext(AuthContext);
  const { axios, blockUser, unblockUser } = useContext(AuthContext);

  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);

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
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-10 flex-1"
        >
          <h3 className="text-lg">Profile details</h3>

          <div className="bg-[#282142] border border-gray-600 rounded-lg p-3 mb-2">
            <p className="text-xs text-gray-400 mb-1">Your User ID</p>
            <p className="text-2xl font-bold tracking-widest text-violet-400">
              {authUser?.userId || "N/A"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Share this ID with friends to connect
            </p>
          </div>

          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              onChange={handleImageChange}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={previewUrl || assets.avatar_icon}
              alt="Avatar"
              className={`w-12 h-12 ${previewUrl ? "rounded-full" : ""}`}
            />
            Upload Profile image
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Bio"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer w-max"
          >
            Save
          </button>
        </form>

        <div className="mx-10">
          <button
            onClick={() => setShowBlockedModal(true)}
            className="bg-gray-700 text-white px-4 py-2 rounded-md"
          >
            Blocked Users
          </button>
        </div>

        {showBlockedModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#282142] border border-gray-600 rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Blocked Users</h3>
                <button
                  onClick={() => setShowBlockedModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              {blockedUsers.length > 0 ? (
                <div className="space-y-3">
                  {blockedUsers.map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center gap-3 bg-[#1a1625] border border-gray-600 rounded-lg p-3"
                    >
                      <img
                        src={u.ProfilePic || assets.avatar_icon}
                        alt={u.fullName}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{u.fullName}</p>
                        <p className="text-xs text-gray-400">ID: {u.userId}</p>
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            unblockUser(u._id);
                            setBlockedUsers(
                              blockedUsers.filter((b) => b._id !== u._id)
                            );
                          }}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Unblock
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-8">
                  No blocked users
                </p>
              )}
            </div>
          </div>
        )}

        <img
          src={previewUrl || assets.logo_icon}
          alt="Profile"
          className="max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10"
        />
      </div>
    </div>
  );
}

export default ProfilePage;
