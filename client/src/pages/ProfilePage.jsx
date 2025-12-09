import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext.jsx";

function ProfilePage() {
  const { authUser, updateProfile } = useContext(AuthContext);

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
