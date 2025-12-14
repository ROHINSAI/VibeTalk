import { useRef, useState } from "react";

export default function useMessageSender({ sendMessage, sendAudioMessage }) {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    try {
      await sendMessage({ text: text.trim(), image: imagePreview });
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleSendVoice = async ({ audioBlob, waveformBlob, text = "" }) => {
    if (!audioBlob) return;
    try {
      if (sendAudioMessage) {
        await sendAudioMessage({ audioBlob, waveformBlob, text });
      } else {
        // fallback: convert blob to data URL and use sendMessage
        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = reader.result;
          await sendMessage({ text, image: null, audio: dataUrl });
        };
        reader.readAsDataURL(audioBlob);
      }
    } catch (err) {
      console.error("Failed to send voice message:", err);
    }
  };

  return {
    text,
    setText,
    imagePreview,
    handleImageChange,
    removeImage,
    handleSendMessage,
    handleSendVoice,
    fileInputRef,
  };
}
