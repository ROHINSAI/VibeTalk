import assets from "../../../assets/assets";

export default function SendButton({ disabled }) {
  return (
    <button type="submit" disabled={disabled}>
      <img src={assets.send_button} alt="Send" className="w-7 cursor-pointer" />
    </button>
  );
}
