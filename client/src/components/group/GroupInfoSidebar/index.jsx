import { useContext, useEffect, useState } from "react";
import { ChatContext } from "../../../../context/ChatContext";
import { AuthContext } from "../../../../context/AuthContext";
import toast from "react-hot-toast";
import GroupHeader from "./GroupHeader";
import MediaGrid from "./MediaGrid";
import MemberList from "./MemberList";
import ActionsFooter from "./ActionsFooter";

export default function GroupInfoSidebar({ group }) {
  const { authUser, axios } = useContext(AuthContext);
  const { onlineUsers, setGroups, setSelectedGroup } = useContext(ChatContext);
  const [media, setMedia] = useState([]);

  if (!group) return null;

  const members = Array.isArray(group?.members) ? group.members : [];
  const onlineUsersList = Array.isArray(onlineUsers) ? onlineUsers : [];

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
      setGroups((prev) => prev.filter((g) => g._id !== group._id));
      setSelectedGroup(null);
      toast.success("Left the group");
    } catch (err) {
      console.error("Leave group error:", err);
      toast.error(err.response?.data?.message || "Failed to leave group");
    }
  };

  return (
    <div
      className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll max-md:hidden`}
    >
      <GroupHeader
        group={group}
        members={members}
        onlineUsers={onlineUsersList}
      />

      <hr className="border-[#ffffff50] my-4" />

      <div className="px-5 text-xs">
        <p>Media</p>
        <MediaGrid media={media} />
      </div>

      <hr className="border-[#ffffff50] my-4" />

      <div className="px-5 text-xs mb-20">
        <p className="mb-2">Members ({members.length})</p>
        <MemberList
          members={members}
          group={group}
          onlineUsers={onlineUsersList}
        />
      </div>

      <ActionsFooter onLeave={handleLeaveGroup} />
    </div>
  );
}
