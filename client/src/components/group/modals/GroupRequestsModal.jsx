import { useContext, useState } from "react";
import { AuthContext } from "../../../../context/AuthContext";
import assets from "../../../assets/assets";
import toast from "react-hot-toast";

export default function GroupRequestsModal({
  open,
  onClose,
  requests,
  onUpdate,
}) {
  const { axios, authUser } = useContext(AuthContext);
  const [loading, setLoading] = useState({});
  const [showWarning, setShowWarning] = useState(null);

  if (!open) return null;

  const handleAccept = async (request) => {
    if (request.hasNonFriendMembers && !showWarning) {
      setShowWarning({
        requestId: request._id,
        nonFriendNames: request.nonFriendNames || [],
        groupName: request.group?.name,
      });
      return;
    }

    setLoading((prev) => ({ ...prev, [request._id]: true }));
    try {
      await axios.put(`/api/groups/requests/${request._id}/accept`);
      toast.success(`Joined group: ${request.group?.name}`);
      setShowWarning(null);
      onUpdate();
    } catch (error) {
      console.error("Accept group request error:", error);
      toast.error(error.response?.data?.message || "Failed to join group");
    } finally {
      setLoading((prev) => ({ ...prev, [request._id]: false }));
    }
  };

  const handleDecline = async (requestId) => {
    setLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      await axios.put(`/api/groups/requests/${requestId}/decline`);
      toast.success("Group request declined");
      setShowWarning(null);
      onUpdate();
    } catch (error) {
      console.error("Decline group request error:", error);
      toast.error(error.response?.data?.message || "Failed to decline");
    } finally {
      setLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  if (showWarning) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[#282142] border border-yellow-600 rounded-xl p-6 w-[90%] max-w-md">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-yellow-500 text-2xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Warning</h3>
              <p className="text-sm text-gray-300 mb-3">
                The group "{showWarning.groupName}" contains members who are not
                in your friend list:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-400 mb-3">
                {showWarning.nonFriendNames.map((name, idx) => (
                  <li key={idx}>{name}</li>
                ))}
              </ul>
              <p className="text-sm text-gray-300">
                Would you still like to join this group?
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowWarning(null)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const request = requests.find(
                  (r) => r._id === showWarning.requestId
                );
                if (request) handleAccept(request);
              }}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg transition-colors"
            >
              Join Anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#282142] border border-gray-600 rounded-xl p-6 w-[90%] max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            Group Invitations
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-[#1a1625] border border-gray-600 rounded-lg p-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={request.sender?.ProfilePic || assets.avatar_icon}
                    alt={request.sender?.fullName}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-white font-semibold">
                      {request.group?.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      Invited by {request.sender?.fullName}
                    </p>
                    {request.group?.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {request.group.description}
                      </p>
                    )}
                    {request.hasNonFriendMembers && (
                      <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                        <span>⚠️</span> Contains non-friends
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(request)}
                    disabled={loading[request._id]}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    {loading[request._id] ? "Accepting..." : "Accept"}
                  </button>
                  <button
                    onClick={() => handleDecline(request._id)}
                    disabled={loading[request._id]}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">No group invitations</p>
        )}
      </div>
    </div>
  );
}
