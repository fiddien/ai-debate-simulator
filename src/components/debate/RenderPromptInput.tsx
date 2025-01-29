'use client';

import { Button } from "@/ui/button";
import { Save } from "lucide-react";
import React, { useState } from "react";

interface RenderPromptInputProps {
  promptKey: string;
  value: string | Record<number, string>;
  handlePromptChange: (key: string, value: string | Record<number, string>) => void;
}

const RenderPromptInput: React.FC<RenderPromptInputProps> = ({ promptKey, value, handlePromptChange }) => {
  const [localValue, setLocalValue] = useState(value);
  const [isDirty, setIsDirty] = useState(false);

  const handleLocalChange = (newValue: string | Record<number, string>) => {
    setLocalValue(newValue);
    setIsDirty(true);
  };

  const handleSave = () => {
    handlePromptChange(promptKey, localValue);
    setIsDirty(false);
  };

  if (typeof value === "string") {
    return (
      <div className="space-y-2">
        <textarea
          className="w-full p-2 border rounded"
          rows={4}
          value={typeof localValue === 'string' ? localValue : ''}
          onChange={(e) => handleLocalChange(e.target.value)}
        />
        <Button
          size="sm"
          variant={isDirty ? "default" : "outline"}
          onClick={handleSave}
          disabled={!isDirty}
        >
          <Save className="w-4 h-4 mr-2" />
          {isDirty ? "Save Changes" : "Saved"}
        </Button>
      </div>
    );
  } else if (typeof value === "object") {
    return (
      <div>
        {Object.keys(value).map((subKey) => {
          const currentValue = (localValue as Record<number, string>)[parseInt(subKey)] || '';
          const isSubKeyDirty = currentValue !== value[parseInt(subKey)];

          return (
            <div key={subKey} className="mb-4">
              <label className="block text-sm mb-2">{`${promptKey} - Round ${parseInt(subKey)}`}</label>
              <div className="space-y-2">
                <textarea
                  className="w-full p-2 border rounded"
                  rows={4}
                  value={currentValue}
                  onChange={(e) => handleLocalChange({
                    ...(localValue as Record<number, string>),
                    [parseInt(subKey)]: e.target.value
                  })}
                />
                <Button
                  size="sm"
                  variant={isSubKeyDirty ? "default" : "outline"}
                  onClick={handleSave}
                  disabled={!isSubKeyDirty}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubKeyDirty ? "Save Changes" : "Saved"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export default RenderPromptInput;
