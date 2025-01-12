import { Message } from "@/types";
import { Button } from "@/ui/button";
import { useState } from "react";
import { FaCheck, FaCopy, FaRobot } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

export const MessageComponent = ({ actor, content, side, model }: Message) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 mb-4`}>
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center
        ${
          side === "right"
            ? "bg-amber-100 text-amber-600"
            : "bg-teal-100 text-teal-600"
        }`}
      >
        <FaRobot size={20} />
      </div>
      {/* Chat buble */}
      <div className={`flex-1 w-full`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            side === "right"
              ? "bg-amber-50 border border-amber-100"
              : "bg-teal-50 border border-teal-100"
          }`}
        >
          {/* Name */}
          <p
            className={`text-md mb-1 font-bold ${
              side === "right" ? "text-amber-600" : "text-teal-600"
            }`}
          >
            {actor}
          </p>
          {/* Response */}
          <article className="prose prose-md max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        </div>
        <div className="flex justify-end my-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className={`text-xs gap-1 text-gray-500`}
          >
            {copied ? <FaCheck size={12} /> : <FaCopy size={12} />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageComponent;
