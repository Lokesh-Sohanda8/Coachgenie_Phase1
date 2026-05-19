// "use client";
// import { useChat as useAiChat } from "@ai-sdk/react";
// import { useCallback, useRef } from "react";
// import { useAiStore } from "@/lib/stores/ai.store";

// interface UseCoachGenieChat {
//   context?: string;
// }

// export function useCoachGenieChat({ context }: UseCoachGenieChat = {}) {
//   const { setSession, consent } = useAiStore();
//   const abortRef = useRef<AbortController | null>(null);

//   const chat = useAiChat({
//     api:    "/api/chat",
//     body:   { context },
//     id:     "coachgenie-copilot",
//     initialMessages: [],
//     onError: (err) => {
//       console.error("AI chat error:", err);
//     },
//     onResponse: (res) => {
//       const sessionId = res.headers.get("x-session-id") ?? `session-${Date.now()}`;
//       setSession(sessionId);
//     },
//   });

//   const sendWithContext = useCallback(
//     async (message: string) => {
//       if (!consent) return;
//       await chat.append({ role: "user", content: message });
//     },
//     [chat, consent]
//   );

//   return {
//     ...chat,
//     sendWithContext,
//   };
// }

"use client";
import { useChat as useAiChat } from "@ai-sdk/react";
import { FormEvent, useCallback, useMemo, useRef, useState } from "react";
import { useAiStore } from "@/lib/stores/ai.store";

interface UseCoachGenieChat {
  context?: string;
}

type CoachGenieMessage = {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
};

function getMessageText(message: any): string {
  if (typeof message.content === "string") return message.content;
  if (typeof message.text === "string") return message.text;
  if (Array.isArray(message.parts)) {
    return message.parts
      .map((part: any) => {
        if (typeof part?.text === "string") return part.text;
        if (typeof part?.content === "string") return part.content;
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

export function useCoachGenieChat({ context }: UseCoachGenieChat = {}) {
  const { setSession, consent } = useAiStore();
  const abortRef = useRef<AbortController | null>(null);
  const [input, setInput] = useState("");

  const chat = (useAiChat as any)({
    api: "/api/chat",
    body: { context },
    id: "coachgenie-copilot",
    initialMessages: [],
    onError: (err: Error) => {
      console.error("AI chat error:", err);
    },
    onResponse: (res: Response) => {
      const sessionId = res.headers.get("x-session-id") ?? `session-${Date.now()}`;
      setSession(sessionId);
    },
  });

  const isLoading = chat.status === "submitted" || chat.status === "streaming";

  const messages = useMemo<CoachGenieMessage[]>(
    () =>
      (chat.messages ?? []).map((message: any) => ({
        id: message.id,
        role: message.role,
        content: getMessageText(message),
      })),
    [chat.messages]
  );

  const sendText = useCallback(
    async (message: string) => {
      if (!message.trim()) return;
      await chat.sendMessage({ text: message } as any);
    },
    [chat]
  );

  const sendWithContext = useCallback(
    async (message: string) => {
      if (!consent) return;
      await sendText(message);
    },
    [consent, sendText]
  );

  const append = useCallback(
    async (message: { role?: string; content?: string; text?: string }) => {
      await sendText(message.content ?? message.text ?? "");
    },
    [sendText]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(event.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      const next = input.trim();
      if (!next || isLoading) return;
      setInput("");
      await sendText(next);
    },
    [input, isLoading, sendText]
  );

  return {
    ...chat,
    messages,
    input,
    isLoading,
    append,
    handleInputChange,
    handleSubmit,
    sendMessage: (message: { text?: string } | string) =>
      sendText(typeof message === "string" ? message : message.text ?? ""),
    sendWithContext,
    setMessages: (next: CoachGenieMessage[]) => chat.setMessages(next as any),
  };
}
