import { cn } from "@/lib/utils";
import { ExtendedMessage } from "@/types/message";
import React, { forwardRef } from "react";
import { Icons } from "../Icons";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";

export interface MessageProps {
  message: ExtendedMessage;
  isNextMessageFromSameUser: boolean;
}

const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ message, isNextMessageFromSameUser }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-end", {
          "justify-end": message.isUserMessage,
          "justify-start": !message.isUserMessage,
        })}
      >
        <div
          className={cn(
            "relative flex h-6 w-6 aspect-square items-center justify-center",
            {
              "order-2 bg-blue-600 rounded-sm": message.isUserMessage,
              "order-1 bg-zinc-800 rounded-sm": !message.isUserMessage,
              invisible: isNextMessageFromSameUser, // Hide avatar if next message is from the same user
            }
          )}
        >
          {message.isUserMessage ? (
            <Icons.user className='h-3/4 w-3/4 fill-zinc-200 text-zinc-200' />
          ) : (
            <Icons.logo className='h-3/4 w-3/4 fill-zinc-300' />
          )}
        </div>

        <div
          className={cn("flex flex-col space-y-2 text-base max-w-md mx-2", {
            "order-1 items-end": message.isUserMessage,
            "order-2 items-start": !message.isUserMessage,
          })}
        >
          <div
            className={cn("px-4 py-2 rounded-lg inline-block", {
              "bg-blue-600 text-white": message.isUserMessage,
              "bg-gray-200 text-gray-900": !message.isUserMessage,
              "rounded-br-none":
                !isNextMessageFromSameUser && message.isUserMessage,
              "rounded-bl-none":
                !isNextMessageFromSameUser && !message.isUserMessage,
            })}
          >
            {typeof message.text === "string" ? (
              <ReactMarkdown
                className={cn("prose", {
                  "text-zinc-50": message.isUserMessage,
                })}
              >
                {message.text}
              </ReactMarkdown>
            ) : (
              message.text
            )}
            {message.id !== "loading-message" ? (
              <div
                className={cn("text-xs select-none mt-2 w-full text-right", {
                  "text-blue-300": message.isUserMessage,
                  "text-zinc-500": !message.isUserMessage,
                })}
              >
                {format(new Date(message.updatedAt), "HH:mm")}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
);

Message.displayName = "Message";

export default Message;
