import { Message } from "@/types";
import { Button } from "@/ui/button";
import { useState } from "react";
import { FaCheck, FaCopy, FaRobot, FaUser, FaChevronDown, FaChevronRight } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkBreaks from 'remark-breaks';
import { extractArguments } from "@/lib/utils";

const processContent = (content: string) => {
  const thinkingSections = content.split(/(<thinking>[\s\S]*?<\/thinking>)/g);

  return thinkingSections.map((section, index) => {
    if (section.startsWith('<thinking>')) {
      const thinkingContent = section.replace(/<\/?thinking>/g, '');

      // Convert to markdown syntax
      const processedContent = thinkingContent
        .replace(/<v_quote>(.*?)<\/v_quote>/g, (_, quote) => `**${quote}**`)
        .replace(/<u_quote>(.*?)<\/u_quote>/g, (_, quote) => `***${quote}***`);

      return {
        type: 'thinking',
        content: processedContent,
      };
    } else {
      const processedContent = section
        .replace(/<v_quote>(.*?)<\/v_quote>/g, (_, quote) => `**${quote}**`)
        .replace(/<u_quote>(.*?)<\/u_quote>/g, (_, quote) => `~~${quote}~~`);
      const args = extractArguments(processedContent);

      return {
        type: 'text',
        content: args,
      };
    }
  });
};

const ThinkingSection = ({ content }: { content: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="prose prose-md max-w-none">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-800 font-medium"
      >
        {isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
        Thinking Process
      </button>
      <div className={`${isExpanded ? 'block' : 'hidden'} bg-gray-50 border-l-2 px-1 border-gray-300 rounded-md`}>
        <ReactMarkdown
          remarkPlugins={[remarkBreaks]}
          components={{
            del: ({children}) => (
              <span className="bg-red-100 text-green-900 px-1 rounded">{children}</span>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </article>
  );
};

export const MessageComponent = ({ content, side, model, name }: Message) => {
  const [copied, setCopied] = useState(false);
  const processedSections = processContent(content);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 mb-4`}>
      {/* Chat bubble */}
      <div className={`flex-1 w-full`}>
        <div className={`rounded-lg px-4 py-2 ${
          side === "right"
            ? "bg-amber-50 border border-amber-100"
            : "bg-teal-50 border border-teal-100"
        }`}>
          {/* Avatar and Name container */}
          <div className="flex items-center gap-3 mb-2">
            <div className={`px-4 h-10 rounded-full flex items-center justify-center font-bold
              ${side === "right" ? "bg-amber-100 text-amber-600" : "bg-teal-100 text-teal-600"}`}
            >
              {name}
            </div>
          </div>
          {/* Response */}
            {processedSections.map((section, index) => (
              section.type === 'thinking'
                ? <ThinkingSection key={index} content={section.content} />
                : <article key={index} className="prose prose-md max-w-none">
                    <ReactMarkdown
                    remarkPlugins={[remarkBreaks]}
                    components={{
                      del: ({children}) => (
                        <span className="bg-green-100 text-green-900 px-1 rounded">{children}</span>
                      ),
                    }}
                  >
                    {section.content}
                  </ReactMarkdown>
                </article>
            ))}
        </div>
        {/* Copy button */}
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
