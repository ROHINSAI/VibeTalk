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

import { motion } from "framer-motion";

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
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`bg-white/60 dark:bg-gray-900/50 backdrop-blur-md border-l border-gray-200 dark:border-white/10 text-gray-900 dark:text-white w-full h-full flex flex-col overflow-hidden max-md:hidden`}
    >
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/10 scrollbar-track-transparent overscroll-y-contain">
        <GroupHeader
          group={group}
          members={members}
          onlineUsers={onlineUsersList}
        />

        {canManageGroup && (
          <div className="px-5 mt-4 flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex-1 bg-violet-600/80 hover:bg-violet-600 text-white text-xs font-medium py-2 px-3 rounded-xl transition-all shadow-lg shadow-violet-900/20"
            >
              Edit Group
            </button>
            <button
              onClick={() => setShowAddMembersModal(true)}
              className="flex-1 bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-medium py-2 px-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
            >
              Add Members
            </button>
          </div>
        )}

        <div className="px-5 mt-6 mb-4">
            <div className="bg-gray-200 dark:bg-white/5 h-px w-full" />
        </div>

        <div className="px-5 text-xs">
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-2 uppercase tracking-wide">Shared Media</p>
          <MediaGrid media={media} />
        </div>

        <div className="px-5 mt-6 mb-4">
            <div className="bg-gray-200 dark:bg-white/5 h-px w-full" />
        </div>

        <div className="px-5 text-xs pb-4">
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-3 uppercase tracking-wide">Members ({members.length})</p>
          <MemberList
            members={members}
            group={group}
            onlineUsers={onlineUsersList}
            authUser={authUser}
            axios={axios}
            onUpdate={handleUpdate}
          />
        </div>
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
    </motion.div>
  );
}
