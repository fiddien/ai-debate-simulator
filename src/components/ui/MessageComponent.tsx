import { extractArguments } from "@/lib/utils";
import { Message } from "@/types";
import { Button } from "@/ui/button";
import { useState } from "react";
import { FaCheck, FaChevronDown, FaChevronRight, FaCopy } from "react-icons/fa";
import Markdown from 'react-markdown'
import remarkBreaks from 'remark-breaks';

const processContent = (content: string) => {
  const thinkingSections = content.split(/(<thinking>[\s\S]*?<\/thinking>)/g);

  return thinkingSections.map((section, index) => {
    if (section.startsWith('<thinking>')) {
      const thinkingContent = section.replace(/<\/?thinking>/g, '');

      // Add == around quote tags instead of replacing them
      const processedContent = thinkingContent
        .replace(/<v_quote>/g, '`<v_quote>')
        .replace(/<\/v_quote>/g, '</v_quote>`')
        .replace(/<u_quote>/g, '`<u_quote>')
        .replace(/<\/u_quote>/g, '</u_quote>`');

      return {
        type: 'thinking',
        content: processedContent,
      };
    } else {
      const processedContent = section
        .replace(/<v_quote>/g, '`<v_quote>')
        .replace(/<\/v_quote>/g, '</v_quote>`')
        .replace(/<u_quote>/g, '`<u_quote>')
        .replace(/<\/u_quote>/g, '</u_quote>`');
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
    <div>
    <button
      onClick={() => setIsExpanded(!isExpanded)}
      className="text-gray-500 text-sm w-full gap-2 hover:bg-white align-middle flex items-center p-3 rounded-md"
    >
      {isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
      Thinking Process
    </button>
    <article className="prose prose-md max-w-none">
      <div className={`${isExpanded ? 'block' : 'hidden'} px-2 py-1 bg-white rounded-md`}>
        <Markdown
          remarkPlugins={[remarkBreaks]}
          components={{
            code: ({ children }) => (
              <span className="bg-white px-1 rounded">{children}</span>
            ),
          }}
        >
          {content}
        </Markdown>
      </div>
    </article>
    </div>
  );
};

type MessageComponentProps = {
  content: string;
  side: "left" | "right";
  name: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const MessageComponent = ({ content, side, name, ...props }: MessageComponentProps) => {
  const [copied, setCopied] = useState(false);
  const processedSections = processContent(content);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 mb-4`} {...props}>
      {/* Chat bubble */}
      <div className={`flex-1 w-full`}>
        <div className={`rounded-lg px-4 py-2 ${side === "right"
            ? "bg-amber-50 border border-amber-100"
            : "bg-teal-50 border border-teal-100"
          }`}>
          {/* Avatar and Name container */}
          <div className="flex items-center gap-3 mb-2">
            <div className={`mt-2 p-4 h-6 rounded-full flex items-center justify-center font-bold
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
                <Markdown
                  remarkPlugins={[remarkBreaks]}
                  components={{
                    code: ({ children }) => (
                      <span className="bg-white px-1 rounded">{children}</span>
                    ),
                  }}
                >
                  {section.content}
                </Markdown>
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
