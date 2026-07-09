import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import apiClient from "../lib/apiClient";
import customerApiClient from "../lib/customerApiClient";
import { ENV } from "../utils/env";

export interface Message {
  id: string;
  sender: "me" | "other";
  senderName?: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Thread {
  userId: number;
  userName: string;
  userRole: "ADMIN" | "DEALER" | "CUSTOMER";
  lastMessage: string;
  lastTime: string;
  unread: boolean;
  messages: Message[];
  lastMsgAt?: string;
  originalIndex?: number;
  unreadCount?: number;
  group?: boolean;
  chatKey?: string;
}

export interface UseChatParams {
  currentUserId: number;
  currentUserRole: "ADMIN" | "DEALER" | "CUSTOMER";
  token: string;
  users: any[];
}

function getFormattedTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? "0" + minutes : minutes.toString();
  return `${hours.toString().padStart(2, "0")}:${minutesStr} ${ampm}`;
}

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return getFormattedTime(date);
  } catch {
    return isoString;
  }
}

function nowTime(): string {
  return getFormattedTime(new Date());
}

export function useChat({ currentUserId, currentUserRole, token, users }: UseChatParams) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeUserId, setActiveUserId] = useState<number | null>(null);
  const [activeUserRole, setActiveUserRole] = useState<"ADMIN" | "DEALER" | "CUSTOMER" | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const stompClientRef = useRef<Client | null>(null);
  const activeSubscriptionsRef = useRef<Map<string, any>>(new Map());

  const activeUserIdRef = useRef(activeUserId);
  const activeUserRoleRef = useRef(activeUserRole);

  useEffect(() => {
    activeUserIdRef.current = activeUserId;
    activeUserRoleRef.current = activeUserRole;
  }, [activeUserId, activeUserRole]);

  // Sync users list with local threads list
  useEffect(() => {
    if (!users.length) return;
    setThreads((prev) => {
      return users.map((u, index) => {
        const existing = prev.find((t) => t.userId === u.id && t.userRole === u.role);
        return {
          userId: u.id,
          userName: u.name,
          userRole: u.role,
          lastMessage: existing?.lastMessage || u.lastMessage || "",
          lastTime: existing?.lastTime || (u.lastMessageAt ? formatTime(u.lastMessageAt) : ""),
          lastMsgAt: existing?.lastMsgAt || u.lastMessageAt,
          unread: existing ? existing.unread : (u.unreadCount ?? 0) > 0,
          messages: existing?.messages || [],
          originalIndex: index,
          unreadCount: u.unreadCount ?? 0,
          group: u.group,
          chatKey: u.chatKey,
        };
      });
    });
  }, [users]);

  // REST: Fetch Total Unread Count
  const fetchTotalUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const client = currentUserRole === "CUSTOMER" ? customerApiClient : apiClient;
      const { data } = await client.get(`${ENV.API_BASE_URL}/api/chat/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTotalUnreadCount(Number(data || 0));
    } catch (err) {
      /* ignore */
    }
  }, [token, currentUserRole]);

  useEffect(() => {
    fetchTotalUnreadCount();
  }, [fetchTotalUnreadCount]);

  // REST: Fetch history
  const fetchHistory = useCallback(
    async (user2Id: number, user2Role: string, isBackground = false, isGroup = false) => {
      if (!token) return;
      if (!isBackground) {
        setIsHistoryLoading(true);
      }
      try {
        const url = isGroup
          ? `${ENV.API_BASE_URL}/api/chat/group/history`
          : `${ENV.API_BASE_URL}/api/chat/history`;

        const config: any = {
          headers: { Authorization: `Bearer ${token}` },
        };

        if (!isGroup) {
          config.params = { user2Id, user2Role };
        }

        const client = currentUserRole === "CUSTOMER" ? customerApiClient : apiClient;
        const { data } = await client.get(url, config);

        if (Array.isArray(data)) {
          const formattedMessages: Message[] = data.map((msg: any) => ({
            id: String(msg.id),
            sender:
              msg.senderId === currentUserId && msg.senderRole === currentUserRole
                ? "me"
                : "other",
            senderName: msg.senderName,
            text: msg.content,
            timestamp: formatTime(msg.sentAt),
            isRead: msg.isRead,
          }));

          const lastMsgTime = data[data.length - 1]?.sentAt;

          setThreads((prev) =>
            prev.map((t) =>
              t.userId === user2Id && t.userRole === user2Role
                ? {
                    ...t,
                    messages: formattedMessages,
                    lastMessage:
                      formattedMessages[formattedMessages.length - 1]?.text ?? t.lastMessage,
                    lastTime:
                      formattedMessages[formattedMessages.length - 1]?.timestamp ?? t.lastTime,
                    lastMsgAt: lastMsgTime ?? t.lastMsgAt,
                  }
                : t
            )
          );
        }
      } catch (err) {
        /* ignore */
      } finally {
        if (!isBackground) {
          setIsHistoryLoading(false);
        }
      }
    },
    [currentUserId, currentUserRole, token]
  );

  // REST: Mark as seen
  const markAsSeen = useCallback(
    async (user2Id: number, user2Role: string) => {
      if (!token) return;
      try {
        const client = currentUserRole === "CUSTOMER" ? customerApiClient : apiClient;
        await client.post(
          `${ENV.API_BASE_URL}/api/chat/seen`,
          null,
          {
            params: { user2Id, user2Role },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        fetchTotalUnreadCount();
        setThreads((prev) =>
          prev.map((t) =>
            t.userId === user2Id && t.userRole === user2Role ? { ...t, unread: false, unreadCount: 0 } : t
          )
        );
      } catch (err) {
        /* ignore */
      }
    },
    [token, fetchTotalUnreadCount]
  );

  // Set active thread and run initial load processes
  const selectThread = useCallback(
    (userId: number, userRole: "ADMIN" | "DEALER" | "CUSTOMER") => {
      setActiveUserId(userId);
      setActiveUserRole(userRole);
      const thread = threads.find((t) => t.userId === userId && t.userRole === userRole);
      const isGroup = thread?.group ?? false;

      if (isGroup) {
        fetchHistory(userId, userRole, false, true);
      } else {
        markAsSeen(userId, userRole);
        fetchHistory(userId, userRole, false, false);
      }
    },
    [fetchHistory, markAsSeen, threads]
  );

  // STOMP connection logic using SockJS
  useEffect(() => {
    if (!token || !currentUserId || !currentUserRole) return;

    // React Native XMLHttpRequest intercept for SockJS
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (
      this: XMLHttpRequest & { _url?: string },
      method: string,
      url: string,
      ...args: any[]
    ) {
      this._url = url;
      return originalOpen.apply(this, [method, url, ...args] as any);
    } as any;

    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (
      this: XMLHttpRequest & { _url?: string },
      body: any
    ) {
      if (
        this._url &&
        this._url.indexOf("/chat") !== -1 &&
        this._url.indexOf("/api/") === -1
      ) {
        this.setRequestHeader("Authorization", `Bearer ${token}`);
      }
      return originalSend.apply(this, [body]);
    };

    const baseUrl = ENV.API_BASE_URL || "https://c1.caryanam.com";
    const socketUrl = `${baseUrl}/chat`;

    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        // console.log(str);
      },
    });

    client.onConnect = () => {
      setIsConnected(true);

      // Subscribe to messages
      const userQueue = `/queue/${currentUserRole}_${currentUserId}`;
      client.subscribe(userQueue, (message) => {
        try {
          const msg = JSON.parse(message.body);
          const formatted: Message = {
            id: msg.id ? String(msg.id) : `msg-${Date.now()}`,
            sender:
              msg.senderId === currentUserId && msg.senderRole === currentUserRole
                ? "me"
                : "other",
            text: msg.content,
            timestamp: formatTime(msg.sentAt || new Date().toISOString()),
            isRead: msg.isRead || false,
          };

          const senderId = msg.senderId;
          const senderRole = msg.senderRole;
          const lastMsgTime = msg.sentAt || new Date().toISOString();

          setThreads((prev) =>
            prev.map((t) => {
              if (t.userId === senderId && t.userRole === senderRole) {
                const isCurrentActive =
                  activeUserIdRef.current === senderId &&
                  activeUserRoleRef.current === senderRole;

                if (isCurrentActive) {
                  markAsSeen(senderId, senderRole);
                }

                return {
                  ...t,
                  messages: [...t.messages, formatted],
                  lastMessage: formatted.text,
                  lastTime: formatted.timestamp,
                  unread: !isCurrentActive,
                  lastMsgAt: lastMsgTime,
                  unreadCount: isCurrentActive ? 0 : (t.unreadCount ?? 0) + 1,
                };
              }
              return t;
            })
          );

          fetchTotalUnreadCount();
        } catch (err) {
          console.error("Error processing incoming message:", err);
        }
      });

      // Subscribe to typing status
      const typingQueue = `/queue/${currentUserRole}_${currentUserId}_typing`;
      client.subscribe(typingQueue, (message) => {
        try {
          const status = JSON.parse(message.body);
          const senderId = status.senderId;
          const senderRole = status.senderRole;

          if (
            activeUserIdRef.current === senderId &&
            activeUserRoleRef.current === senderRole
          ) {
            setIsTyping(!!status.typing);
          }
        } catch (err) {
          // ignore
        }
      });
    };

    client.onDisconnect = () => {
      setIsConnected(false);
      activeSubscriptionsRef.current.clear();
    };

    client.onWebSocketClose = () => {
      setIsConnected(false);
      activeSubscriptionsRef.current.clear();
    };

    client.onStompError = (frame) => {
      setIsConnected(false);
      activeSubscriptionsRef.current.clear();
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      activeSubscriptionsRef.current.clear();
      XMLHttpRequest.prototype.open = originalOpen;
      XMLHttpRequest.prototype.send = originalSend;
    };
  }, [currentUserId, currentUserRole, token, markAsSeen, fetchTotalUnreadCount]);

  // STOMP: Manage dynamic group subscriptions
  useEffect(() => {
    const client = stompClientRef.current;
    if (!client || !isConnected) return;

    const groups = users.filter((u) => u.group && u.chatKey);

    activeSubscriptionsRef.current.forEach((sub, chatKey) => {
      if (!groups.some((g) => g.chatKey === chatKey)) {
        sub.unsubscribe();
        activeSubscriptionsRef.current.delete(chatKey);
      }
    });

    groups.forEach((group) => {
      if (!activeSubscriptionsRef.current.has(group.chatKey)) {
        const groupTopic = `/topic/${group.chatKey}`;

        const sub = client.subscribe(groupTopic, (message) => {
          try {
            const msg = JSON.parse(message.body);
            const formatted: Message = {
              id: msg.id ? String(msg.id) : `msg-${Date.now()}`,
              sender:
                msg.senderId === currentUserId && msg.senderRole === currentUserRole
                  ? "me"
                  : "other",
              senderName: msg.senderName,
              text: msg.content,
              timestamp: formatTime(msg.sentAt || new Date().toISOString()),
              isRead: msg.isRead || false,
            };

            const lastMsgTime = msg.sentAt || new Date().toISOString();

            setThreads((prev) =>
              prev.map((t) => {
                if (t.group && t.chatKey === group.chatKey) {
                  const isCurrentActive =
                    activeUserIdRef.current === t.userId &&
                    activeUserRoleRef.current === t.userRole;

                  return {
                    ...t,
                    messages: [...t.messages, formatted],
                    lastMessage: formatted.text,
                    lastTime: formatted.timestamp,
                    unread: !isCurrentActive,
                    lastMsgAt: lastMsgTime,
                    unreadCount: isCurrentActive ? 0 : (t.unreadCount ?? 0) + 1,
                  };
                }
                return t;
              })
            );

            fetchTotalUnreadCount();
          } catch (err) {
            // ignore
          }
        });

        activeSubscriptionsRef.current.set(group.chatKey, sub);
      }
    });
  }, [users, isConnected, currentUserId, currentUserRole, fetchTotalUnreadCount]);

  // STOMP: Send Message
  const sendMessage = useCallback((content: string) => {
    if (!stompClientRef.current || !isConnected || activeUserId === null || activeUserRole === null) {
      return;
    }

    const thread = threads.find((t) => t.userId === activeUserId && t.userRole === activeUserRole);
    const isGroup = thread?.group ?? false;

    const payload = {
      receiverId: activeUserId,
      receiverRole: activeUserRole,
      content,
      groupMessage: isGroup,
      groupId: isGroup ? thread?.chatKey : undefined,
    };

    stompClientRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(payload),
    });

    // Optimistically update the UI
    const formatted: Message = {
      id: `msg-sent-${Date.now()}`,
      sender: "me",
      senderName: "Me",
      text: content,
      timestamp: nowTime(),
      isRead: false,
    };

    const lastMsgTime = new Date().toISOString();

    setThreads((prev) =>
      prev.map((t) =>
        t.userId === activeUserId && t.userRole === activeUserRole
          ? {
              ...t,
              messages: [...t.messages, formatted],
              lastMessage: content,
              lastTime: formatted.timestamp,
              lastMsgAt: lastMsgTime,
            }
          : t
      )
    );
  }, [activeUserId, activeUserRole, isConnected, threads]);

  const sendTypingStatus = useCallback((typing: boolean) => {
    if (!stompClientRef.current || !isConnected || activeUserId === null || activeUserRole === null) {
      return;
    }

    const thread = threads.find((t) => t.userId === activeUserId && t.userRole === activeUserRole);
    if (thread?.group) return;

    const payload = {
      senderId: currentUserId,
      senderRole: currentUserRole,
      receiverId: activeUserId,
      receiverRole: activeUserRole,
      typing,
    };

    stompClientRef.current.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify(payload),
    });
  }, [currentUserId, currentUserRole, activeUserId, activeUserRole, isConnected, threads]);

  const sortedThreads = useMemo(() => {
    return [...threads].sort((a, b) => {
      const timeA = a.lastMsgAt ? new Date(a.lastMsgAt).getTime() : 0;
      const timeB = b.lastMsgAt ? new Date(b.lastMsgAt).getTime() : 0;
      if (timeA !== timeB) {
        return timeB - timeA;
      }
      return a.userName.localeCompare(b.userName);
    });
  }, [threads]);

  return {
    threads: sortedThreads,
    activeUserId,
    activeUserRole,
    selectThread,
    isTyping,
    sendMessage,
    sendTypingStatus,
    isConnected,
    totalUnreadCount,
    isHistoryLoading,
    fetchHistory,
  };
}
