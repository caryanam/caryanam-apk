import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  Send as SendIcon,
  MessageCircle as MessageCircleIcon,
  ChevronLeft as ChevronLeftIcon,
  CheckCheck as CheckCheckIcon,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useChat } from "../../hooks/useChat";

const Send = SendIcon as any;
const MessageCircle = MessageCircleIcon as any;
const ChevronLeft = ChevronLeftIcon as any;
const CheckCheck = CheckCheckIcon as any;

interface ChatScreenProps {
  currentUserId: number;
  currentUserRole: "ADMIN" | "DEALER" | "CUSTOMER";
  token: string;
  users: any[];
  onBack?: () => void;
  label?: string;
}

export default function ChatScreen({
  currentUserId,
  currentUserRole,
  token,
  users,
  onBack,
  label = "Inbox Chats",
}: ChatScreenProps) {
  const {
    threads,
    activeUserId,
    activeUserRole,
    selectThread,
    sendMessage,
    isHistoryLoading,
    fetchHistory,
  } = useChat({ currentUserId, currentUserRole, token, users });

  const [messageText, setMessageText] = useState("");
  const [showThreadView, setShowThreadView] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const headerHeight = 56 + insets.top;

  const getRoleStyle = (role: string) => {
    switch (role) {
      case "ADMIN":
        return { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" };
      case "DEALER":
        return { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" };
      case "CUSTOMER":
        return { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0" };
      default:
        return { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" };
    }
  };

  const activeThread = threads.find(
    (t) => t.userId === activeUserId && t.userRole === activeUserRole
  );

  const handleSelectThread = (userId: number, userRole: "ADMIN" | "DEALER" | "CUSTOMER") => {
    selectThread(userId, userRole);
    setShowThreadView(true);
  };

  const handleSend = () => {
    if (!messageText.trim()) return;
    sendMessage(messageText.trim());
    setMessageText("");
  };

  const onRefresh = async () => {
    if (activeUserId && activeUserRole) {
      setRefreshing(true);
      await fetchHistory(activeUserId, activeUserRole, true);
      setRefreshing(false);
    }
  };

  // Scroll to bottom when message arrives
  useEffect(() => {
    if (activeThread?.messages.length) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [activeThread?.messages]);

  const renderThreadItem = ({ item }: { item: typeof threads[0] }) => {
    const isSelected = item.userId === activeUserId && item.userRole === activeUserRole;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleSelectThread(item.userId, item.userRole)}
        style={[styles.threadItem, isSelected ? styles.threadItemActive : null]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.userName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.threadInfo}>
          <View style={styles.threadHeaderRow}>
            <Text style={styles.threadName}>{item.userName}</Text>
            {item.userRole && (
              <View style={[styles.roleTag, { backgroundColor: getRoleStyle(item.userRole).bg, borderColor: getRoleStyle(item.userRole).border }]}>
                <Text style={[styles.roleTagText, { color: getRoleStyle(item.userRole).text }]}>
                  {item.userRole.charAt(0) + item.userRole.slice(1).toLowerCase()}
                </Text>
              </View>
            )}
            <Text style={styles.threadTime}>{item.lastTime}</Text>
          </View>
          <View style={styles.threadSubRow}>
            <Text style={[styles.threadLastMsg, item.unread ? styles.threadUnreadMsg : null]} numberOfLines={1}>
              {item.lastMessage || "No messages yet"}
            </Text>
            {item.unread && <View style={styles.unreadDot} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessageItem = ({ item }: { item: any }) => {
    const isMe = item.sender === "me";
    return (
      <View style={[styles.messageBubbleContainer, isMe ? styles.msgMeContainer : styles.msgOtherContainer]}>
        <View style={[styles.messageBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleOther]}>
          <Text style={[styles.messageText, isMe ? styles.msgTextMe : styles.msgTextOther]}>
            {item.text}
          </Text>
          <View style={styles.msgFooter}>
            <Text style={[styles.messageTime, isMe ? styles.msgTimeMe : styles.msgTimeOther]}>
              {item.timestamp}
            </Text>
            {isMe && (
              <CheckCheck
                size={14}
                color={item.isRead ? "#f43f5e" : "rgba(255, 255, 255, 0.7)"}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
      style={styles.container}
    >
      {!showThreadView ? (
        // Thread List View
        <View style={{ flex: 1 }}>
          <View style={styles.topHeader}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                <ChevronLeft size={24} color="#0f172a" />
              </TouchableOpacity>
            )}
            <Text style={styles.topHeaderTitle}>{label}</Text>
          </View>

          {threads.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MessageCircle size={48} color="#cbd5e1" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>No active conversations</Text>
            </View>
          ) : (
            <FlatList
              data={threads}
              keyExtractor={(item) => `${item.userRole}_${item.userId}`}
              renderItem={renderThreadItem}
            />
          )}
        </View>
      ) : (
        // Message Thread View
        <View style={{ flex: 1 }}>
          <View style={styles.threadHeader}>
            <TouchableOpacity onPress={() => setShowThreadView(false)} style={styles.backBtn}>
              <ChevronLeft size={24} color="#fff" />
            </TouchableOpacity>
            <View>
              <Text style={styles.threadHeaderTitle}>{activeThread?.userName || "Chat"}</Text>
              {activeThread?.userRole && (
                <Text style={styles.threadHeaderRole}>
                  {activeThread.userRole.charAt(0) + activeThread.userRole.slice(1).toLowerCase()}
                </Text>
              )}
            </View>
          </View>

          {isHistoryLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#f43f5e" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={activeThread?.messages || []}
              keyExtractor={(item) => item.id}
              renderItem={renderMessageItem}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#f43f5e"
                  colors={["#f43f5e"]}
                />
              }
            />
          )}

          {/* Input Panel */}
          <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <TextInput
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type message..."
              placeholderTextColor="#94a3b8"
              style={styles.chatInput}
              multiline
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
              <Send size={16} color="#fff" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#e11d48",
  },
  topHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    marginLeft: 8,
  },
  backBtn: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 13,
    color: "#94a3b8",
  },
  threadItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    alignItems: "center",
  },
  threadItemActive: {
    backgroundColor: "#f8fafc",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f43f5e",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
  },
  threadInfo: {
    flex: 1,
  },
  threadHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  threadName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
  },
  roleTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 6,
  },
  roleTagText: {
    fontSize: 9,
    fontWeight: "600",
  },
  threadTime: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "500",
  },
  threadSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  threadLastMsg: {
    fontSize: 12,
    color: "#64748b",
    flex: 1,
    marginRight: 8,
  },
  threadUnreadMsg: {
    fontWeight: "700",
    color: "#0f172a",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f43f5e",
  },
  threadHeader: {
    height: 52,
    backgroundColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  threadHeaderTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 12,
  },
  threadHeaderRole: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 12,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  messagesList: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubbleContainer: {
    flexDirection: "row",
    marginBottom: 12,
    width: "100%",
  },
  msgMeContainer: {
    justifyContent: "flex-end",
  },
  msgOtherContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  msgBubbleMe: {
    backgroundColor: "#f43f5e",
  },
  msgBubbleOther: {
    backgroundColor: "#f1f5f9",
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  msgTextMe: {
    color: "#fff",
  },
  msgTextOther: {
    color: "#334155",
  },
  msgFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  messageTime: {
    fontSize: 9,
    textAlign: "right",
  },
  msgTimeMe: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
  },
  msgTimeOther: {
    fontSize: 10,
    color: "#94a3b8",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  chatInput: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    fontSize: 13,
    maxHeight: 100,
    color: "#0f172a",
    marginRight: 10,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f43f5e",
    alignItems: "center",
    justifyContent: "center",
  },
});
