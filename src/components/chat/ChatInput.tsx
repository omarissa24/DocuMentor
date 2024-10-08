import React, { useContext, useRef } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { ChatContext } from "./ChatContext";
import { text } from "stream/consumers";

export interface ChatInputProps {
  isDisabled?: boolean;
}

const ChatInput = ({ isDisabled }: ChatInputProps) => {
  const { addMessage, handleInputChange, isLoading, message } =
    useContext(ChatContext);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className='absolute bottom-0 left-0 w-full'>
      <div className='mx-2 flex flex-row gap-3 md:mx-4 lg:mx-auto lg:max-w-2xl xl:max-w-3xl'>
        <div className='relative flex h-full flex-1 items-stretch md:flex-col'>
          <div className='relative flex flex-col w-full flex-grow p-4'>
            <div className='relative'>
              <Textarea
                rows={1}
                ref={textareaRef}
                maxRows={4}
                autoFocus
                onChange={handleInputChange}
                value={message}
                placeholder='Enter your message...'
                disabled={isDisabled}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    addMessage();
                    textareaRef.current?.focus();
                  }
                }}
                className='resize-none pr-12 text-base py-4 scrollbar-thumb-blue scrollbar-thumb-rounded-full scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch min-h-0'
              />

              <Button
                className='absolute bottom-[8px] right-[8px]'
                aria-label='send message'
                disabled={isLoading || isDisabled}
                onClick={() => {
                  addMessage();
                  textareaRef.current?.focus();
                }}
              >
                <Send className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
