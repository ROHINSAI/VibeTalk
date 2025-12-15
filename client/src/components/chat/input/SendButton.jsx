import assets from "../../../assets/assets";
import { motion } from "framer-motion";

export default function SendButton({ disabled }) {
  return (
    <motion.button 
      type="submit" 
      disabled={disabled}
      whileHover={{ scale: 1.1, rotate: -5 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className="ml-1"
    >
      <img src={assets.send_button} alt="Send" className="w-8 cursor-pointer drop-shadow-lg" />
    </motion.button>
  );
}
