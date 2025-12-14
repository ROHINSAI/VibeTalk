import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { ChatContext } from "../../../context/ChatContext";
import assets from "../../assets/assets";

export default function MessageInfoModal({ open, onClose, message }) {
  const { axios } = useContext(AuthContext);
  const { selectedGroup } = useContext(ChatContext);
  const [seenByUsers, setSeenByUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && message && selectedGroup) {
      fetchSeenInfo();
    }
  }, [open, message, selectedGroup]);

  const fetchSeenInfo = async () => {
    if (!message || !selectedGroup) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `/api/groups/${selectedGroup._id}/messages/${message._id}/info`
      );
      setSeenByUsers(res.data.seenBy || []);
    } catch (error) {
      console.error("Error fetching message info:", error);
      setSeenByUsers([]);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !message || !selectedGroup) return null;

  const totalMembers = selectedGroup.members?.length || 0;
  const seenCount = seenByUsers.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#282142] border border-gray-600 rounded-xl p-6 w-[90%] max-w-md max-h-[70vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Message Info</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : (
          <>
            <div className="mb-4 pb-4 border-b border-gray-600">
              <p className="text-sm text-gray-400 mb-2">Message:</p>
              <p className="text-white text-sm bg-[#1a1625] p-3 rounded-lg break-words">
                {message.text || "[Image]"}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-3">
                Seen by {seenCount} of {totalMembers} members
              </p>

              {seenByUsers.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {seenByUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-3 p-2 bg-[#1a1625] rounded-lg"
                    >
                      <img
                        src={user.ProfilePic || assets.avatar_icon}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-green-400 flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Seen
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-4 text-sm">
                  No one has seen this message yet
                </p>
              )}
            </div>
          </>
        )}

        <button
          onClick={onClose}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
