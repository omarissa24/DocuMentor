import React, { useRef, useState } from "react";
import { createContext } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { set } from "date-fns";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

type ChatContextType = {
  addMessage: () => void;
  message: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
};

export const ChatContext = createContext<ChatContextType>({
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
});

interface Props {
  fileId: string;
  children: React.ReactNode;
}

export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  const utils = trpc.useUtils();

  const backupMessage = useRef("");

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      // Add message to db
      const res = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({ fileId, message }),
      });

      if (!res.ok) {
        throw new Error("Failed to add message");
      }

      return res.body;
    },
    onMutate: async ({ message }) => {
      backupMessage.current = message;
      setMessage("");

      await utils.getFileMessages.cancel();

      const previousMessages = utils.getFileMessages.getInfiniteData();

      utils.getFileMessages.setInfiniteData(
        {
          fileId,
          limit: INFINITE_QUERY_LIMIT,
        },
        (oldData) => {
          if (!oldData) {
            return {
              pages: [],
              pageParams: [],
            };
          }
          let newPages = [...oldData.pages];
          const lastPage = newPages[0]!;

          lastPage.messages = [
            {
              id: crypto.randomUUID(),
              text: message,
              updatedAt: new Date().toISOString(),
              isUserMessage: true,
            },
            ...lastPage.messages,
          ];

          newPages[0] = lastPage;

          return {
            pages: newPages,
            pageParams: oldData.pageParams,
          };
        }
      );

      setIsLoading(true);

      return {
        previousMessages:
          previousMessages?.pages.flatMap((page) => page.messages) ?? [],
      };
    },
    onSuccess: async (stream) => {
      setIsLoading(false);

      if (!stream) {
        toast({
          title: "Failed to send the message",
          description: "Please refresh the page and try again",
          variant: "destructive",
        });
      }

      const reader = stream?.getReader();
      const decoder = new TextDecoder();

      let done = false;

      // accumulate the chunks of data
      let accumulated = "";
      while (!done) {
        const { value, done: doneValue } = await (
          reader as ReadableStreamDefaultReader<Uint8Array>
        )?.read();
        done = doneValue;
        if (value) {
          accumulated += decoder.decode(value, { stream: !done });
        }

        // append chunks to the message
        utils.getFileMessages.setInfiniteData(
          {
            fileId,
            limit: INFINITE_QUERY_LIMIT,
          },
          (oldData) => {
            if (!oldData) {
              return {
                pages: [],
                pageParams: [],
              };
            }

            let isAIReponseCreated = oldData.pages.some((page) => {
              return page.messages.some(
                (message) => message.id === "ai-response"
              );
            });

            let updatedPages = oldData.pages.map((page) => {
              if (page === oldData.pages[0]) {
                let updatedMessages;
                if (!isAIReponseCreated) {
                  updatedMessages = [
                    {
                      id: "ai-response",
                      text: accumulated,
                      updatedAt: new Date().toISOString(),
                      isUserMessage: false,
                    },
                    ...page.messages,
                  ];
                } else {
                  updatedMessages = page.messages.map((message) => {
                    if (message.id === "ai-response") {
                      return {
                        ...message,
                        text: accumulated,
                      };
                    }
                    return message;
                  });
                }

                return {
                  ...page,
                  messages: updatedMessages,
                };
              }

              return page;
            });

            return {
              pages: updatedPages,
              pageParams: oldData.pageParams,
            };
          }
        );
      }
    },
    onError: (_, __, context) => {
      setMessage(backupMessage.current);
      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.previousMessages ?? [] }
      );
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive",
      });
    },
    onSettled: async () => {
      setIsLoading(false);

      await utils.getFileMessages.invalidate({ fileId });
    },
  });

  const addMessage = () => sendMessage({ message });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <ChatContext.Provider
      value={{ addMessage, message, handleInputChange, isLoading }}
    >
      {children}
    </ChatContext.Provider>
  );
};
