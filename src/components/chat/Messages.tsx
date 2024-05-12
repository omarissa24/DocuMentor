import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { keepPreviousData } from "@tanstack/react-query";
import { Loader2, MessageSquare } from "lucide-react";
import React, { useContext, useEffect, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import Message from "./Message";
import { ChatContext } from "./ChatContext";
import { useIntersection } from "@mantine/hooks";

export interface MessagesProps {
  fileId: string;
}

const Messages = ({ fileId }: MessagesProps) => {
  const { isLoading: isAIRendering } = useContext(ChatContext);

  const { data, isLoading, fetchNextPage } =
    trpc.getFileMessages.useInfiniteQuery(
      {
        fileId: fileId,
        limit: INFINITE_QUERY_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => {
          return lastPage.nextCursor;
        },
        placeholderData: keepPreviousData,
      }
    );

  const messages = data?.pages.flatMap((page) => page.messages) ?? [];
  const loadingMessage = {
    id: "loading-message",
    text: (
      <span className='flex h-full items-center justify-center'>
        <Loader2 className='h-4 w-4 animate-spin' />
      </span>
    ),
    updatedAt: new Date().toISOString(),
    isUserMessage: false,
  };

  const combinedMessages = [
    ...(isAIRendering ? [loadingMessage] : []),
    ...messages,
  ];

  const lastMessageRef = useRef<HTMLDivElement>(null);

  const { ref, entry } = useIntersection({
    root: lastMessageRef.current,
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  return (
    <div className='flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch'>
      {/* Messages */}
      {combinedMessages && combinedMessages.length > 0 ? (
        combinedMessages.map((message, idx) => {
          const isNextMessageFromSameUser =
            idx < combinedMessages.length - 1 &&
            combinedMessages[idx + 1].isUserMessage === message.isUserMessage;

          if (idx === combinedMessages.length - 1) {
            return (
              <Message
                isNextMessageFromSameUser={isNextMessageFromSameUser}
                message={message}
                ref={ref}
                key={message.id}
              />
            );
          } else {
            return (
              <Message
                isNextMessageFromSameUser={isNextMessageFromSameUser}
                message={message}
                key={message.id}
              />
            );
          }
        })
      ) : isLoading ? (
        <div className='w-full flex flex-col gap-2'>
          <Skeleton className='h-16' />
          <Skeleton className='h-16' />
          <Skeleton className='h-16' />
          <Skeleton className='h-16' />
        </div>
      ) : (
        <div className='flex-1 flex flex-col items-center justify-center gap-2'>
          <MessageSquare className='h-8 w-8 text-blue-500' />
          <h3 className='font-semibold text-xl'>You&apos;re all set!</h3>
          <p className='text-zinc-500 text-sm'>
            Ask a question to start the conversation.
          </p>
        </div>
      )}
    </div>
  );
};

export default Messages;
