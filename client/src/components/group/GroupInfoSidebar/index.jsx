import { useContext, useEffect, useState } from "react";
import { ChatContext } from "../../../../context/ChatContext";
import { AuthContext } from "../../../../context/AuthContext";
import toast from "react-hot-toast";
import GroupHeader from "./GroupHeader";
import MediaGrid from "./MediaGrid";
import MemberList from "./MemberList";
import ActionsFooter from "./ActionsFooter";
import EditGroupModal from "../modals/EditGroupModal";
import AddMembersModal from "../modals/AddMembersModal";

export default function GroupInfoSidebar({ group }) {
  const { authUser, axios } = useContext(AuthContext);
  const { onlineUsers, setSelectedGroup, getGroups } = useContext(ChatContext);
  const [media, setMedia] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);

  if (!group) return null;

  const members = Array.isArray(group?.members) ? group.members : [];
  const onlineUsersList = Array.isArray(onlineUsers) ? onlineUsers : [];

  const isCreator =
    String(group.creator?._id || group.creator) === String(authUser?._id);
  const isAdmin =
    Array.isArray(group.admins) &&
    group.admins.some((a) => String(a._id || a) === String(authUser?._id));

  const canManageGroup = isCreator || isAdmin;

  useEffect(() => {
    const fetchMedia = async () => {
      if (!group?._id) return;
      try {
        const res = await axios.get(`/api/groups/${group._id}/messages`);
        const messages = res.data.messages || [];
        const mediaMessages = messages.filter((m) => m.image).slice(-12);
        setMedia(mediaMessages);
      } catch (err) {
        console.error("Failed to fetch media:", err);
      }
    };
    fetchMedia();
  }, [group?._id, axios]);

  const handleLeaveGroup = async () => {
    try {
      await axios.delete(`/api/groups/${group._id}/leave`);
      // refresh groups from server instead of mutating internal state directly
      await getGroups();
      setSelectedGroup(null);
      toast.success("Left the group");
    } catch (err) {
      console.error("Leave group error:", err);
      toast.error(err.response?.data?.message || "Failed to leave group");
    }
  };

  const handleUpdate = () => {
    getGroups();
  };

  return (
    <div
      className={`bg-[#8185B2]/10 text-white w-full h-full flex flex-col overflow-hidden max-md:hidden`}
    >
      {/* Fixed Header Section */}
      <div className="flex-none">
        <GroupHeader
          group={group}
          members={members}
          onlineUsers={onlineUsersList}
        />

        {canManageGroup && (
          <div className="px-5 mt-4 flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-xs py-2 px-3 rounded-lg transition-colors"
            >
              Edit Group
            </button>
            <button
              onClick={() => setShowAddMembersModal(true)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-2 px-3 rounded-lg transition-colors"
            >
              Add Members
            </button>
          </div>
        )}

        <hr className="border-[#ffffff50] my-4" />

        <div className="px-5 text-xs">
          <p>Media</p>
          <MediaGrid media={media} />
        </div>

        <hr className="border-[#ffffff50] my-4" />
      </div>

      {/* Scrollable Members List Section */}
      <div className="flex-1 overflow-y-auto min-h-0 px-5 text-xs">
        <p className="mb-2">Members ({members.length})</p>
        <MemberList
          members={members}
          group={group}
          onlineUsers={onlineUsersList}
          authUser={authUser}
          axios={axios}
          onUpdate={handleUpdate}
        />
        {/* Add padding at bottom to prevent content from being hidden behind a potential footer if it wasn't flex */}
        <div className="h-4"></div>
      </div>

      {/* Fixed Footer Section */}
      <div className="flex-none mt-auto">
        <ActionsFooter onLeave={handleLeaveGroup} />
      </div>

      <EditGroupModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        group={group}
        axios={axios}
        onUpdate={handleUpdate}
      />

      <AddMembersModal
        open={showAddMembersModal}
        onClose={() => setShowAddMembersModal(false)}
        group={group}
        axios={axios}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
