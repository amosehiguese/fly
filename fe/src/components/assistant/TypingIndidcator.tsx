import React from "react";
import { useTyping } from "../../context/context";
// import AgenNicky from "../assets/microbial-profile.png";

const TypingIndicator: React.FC = () => {
  const { isTyping } = useTyping();

  if (!isTyping) return null;

  return (
    <div className="p-2 rounded my-[10px] bg-gray-500 self-start max-w-[50%] mr-auto text-gray-200">
      <strong className="flex items-center">
        <p className={`ml-[5px]`}>Assistant is typing...</p>
      </strong>
    </div>
  );
};

export default TypingIndicator;
