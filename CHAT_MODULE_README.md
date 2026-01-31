# Chat & Communication Module - Setup Guide

## Overview
This is a production-ready chat module for the Coal Washery Management System featuring:
- ✅ 1-to-1 Real-time Messaging
- ✅ Role-based Group Chats
- ✅ File Sharing (PDF, Images)
- ✅ Message Status Indicators
- ✅ Typing Indicators & Online Status
- ✅ Contextual Chat Linking
- ✅ Notifications System
- ✅ Audit & Control (Admin only)
- ✅ Tailwind CSS Styling
- ✅ WebSocket Integration

## Installation & Setup

### 1. Install Required Dependencies

```bash
cd coal_washary_management_system

npm install socket.io-client zustand date-fns lucide-react
# or
pnpm add socket.io-client zustand date-fns lucide-react
```

### 2. Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### 3. File Structure

```
app/
├── dashboard/
│   └── chat/
│       ├── page.tsx                 # Main 1-to-1 chat interface
│       ├── group/
│       │   └── page.tsx            # Group management page
│       └── audit/
│           └── page.tsx            # Audit & Control panel
├── components/
│   └── chat/
│       ├── Message.tsx             # Message component with attachments
│       ├── MessageInput.tsx        # Input with file upload
│       ├── ChatList.tsx            # Conversations & groups sidebar
│       ├── Notifications.tsx       # Toast notifications
│       ├── TypingIndicator.tsx    # Shows who's typing
│       ├── OnlineIndicator.tsx     # User online status
│       └── ContextualLinking.tsx   # Link chats to entities

lib/
├── services/
│   ├── socket.ts                   # Socket.io client service
│   └── chat-api.ts                 # REST API endpoints

schemas/
└── chat.ts                         # TypeScript types & interfaces

store/
├── chat-store.ts                   # Main chat state (Zustand)
├── group-store.ts                  # Group management state
└── message-store.ts                # Message state management
```

## Component Usage

### Main Chat Page
Location: `app/dashboard/chat/page.tsx`

Features:
- Load conversations and groups
- Real-time messaging
- File uploads
- Message deletion
- Typing indicators
- Online status
- Mobile responsive

```typescript
// Automatically initializes on component mount
// Connects to WebSocket, loads chats, sets up event listeners
```

### Group Management Page
Location: `app/dashboard/chat/group/page.tsx`

Features:
- Create groups (Admin only)
- Edit group details
- Add/remove members
- Delete groups
- Filter by type

### Audit & Control Page
Location: `app/dashboard/chat/audit/page.tsx`

Features (Admin only):
- View all chat activity logs
- Filter by action, date range
- Export chat history (PDF/CSV)
- Manage message deletion rules
- Set retention policies

### Chat List Component
```typescript
<ChatList
  conversations={conversations}
  groups={groups}
  currentId={currentId}
  onSelectConversation={(conv) => handleSelect(conv)}
  onSelectGroup={(group) => handleSelect(group)}
  userRole="Admin"
/>
```

### Message Component
```typescript
<MessageComponent
  message={message}
  isSent={true}
  senderName="John Doe"
  isGroup={false}
  canDelete={true}
  onDelete={(id) => handleDelete(id)}
  onDownload={(attachment) => handleDownload(attachment)}
/>
```

### Message Input Component
```typescript
<MessageInput
  onSend={async (content, attachments) => {
    // Send message via WebSocket
  }}
  onTyping={(isTyping) => {
    // Emit typing indicator
  }}
  loading={false}
  maxFileSize={10 * 1024 * 1024} // 10MB
/>
```

### Contextual Linking
```typescript
<ContextualLinking
  conversationId={conversationId}
  onLinksChange={(links) => {
    // Handle links change
  }}
/>
```

## WebSocket Events

### Emit Events (Client → Server)
```typescript
// Send message
socketService.sendMessage({
  conversationId: "conv123",
  content: "Hello",
  messageType: "text",
});

// Typing indicator
socketService.sendTypingIndicator({
  conversationId: "conv123",
  userId: "user123",
  username: "John",
  isTyping: true,
});

// Mark as read
socketService.markMessageAsRead("msg123", "conv123");

// Delete message
socketService.deleteMessage("msg123", "conv123");

// Upload file
socketService.uploadFile(file, "conv123");

// Join/Leave
socketService.joinConversation("conv123");
socketService.leaveConversation("conv123");
```

### Listen Events (Server → Client)
```typescript
// Message received
"message_received" → Message

// Message status updated
"message_status_updated" → MessageStatusPayload

// User typing
"user_typing" → TypingIndicator

// User online/offline
"user_online" | "user_offline" → OnlineStatus

// Message read
"message_read" → ReadReceipt

// Group events
"group_member_added" → { groupId, member }
"group_member_removed" → { groupId, userId }
"group_updated" → { groupId, updates }

// Notifications
"notification_received" → ChatNotification
```

## API Endpoints

### Conversations
- `GET /api/chat/conversations` - Get all conversations
- `GET /api/chat/conversations/:id` - Get single conversation
- `POST /api/chat/conversations/with-user` - Create/get 1-to-1
- `GET /api/chat/conversations/:id/messages` - Get messages

### Messages
- `GET /api/chat/conversations/:id/messages` - Get conversation messages
- `GET /api/chat/groups/:id/messages` - Get group messages
- `DELETE /api/chat/messages/:id` - Delete message
- `PATCH /api/chat/messages/:id/read` - Mark as read

### Groups
- `GET /api/chat/groups` - Get all groups
- `POST /api/chat/groups` - Create group (Admin)
- `PATCH /api/chat/groups/:id` - Update group (Admin)
- `DELETE /api/chat/groups/:id` - Delete group (Admin)
- `POST /api/chat/groups/:id/members` - Add member
- `DELETE /api/chat/groups/:id/members/:userId` - Remove member

### Files
- `POST /api/chat/files/upload` - Upload file
- `GET /api/chat/files/:id` - Download file

### Contextual Links
- `GET /api/chat/conversations/:id/links` - Get conv links
- `GET /api/chat/groups/:id/links` - Get group links
- `POST /api/chat/links` - Create link
- `DELETE /api/chat/links/:id` - Delete link

### Audit
- `GET /api/chat/audit/logs` - Get audit logs (Admin)
- `GET /api/chat/audit/export` - Export history (Admin)
- `GET /api/chat/audit/deletion-rules` - Get rules (Admin)
- `PATCH /api/chat/audit/deletion-rules` - Update rules (Admin)

## State Management (Zustand Stores)

### Chat Store (`useChatStore`)
```typescript
const { 
  conversations,
  currentConversation,
  messages,
  typingIndicators,
  onlineUsers,
  notifications,
  socketConnected,
  setCurrentConversation,
  addMessage,
  setTypingIndicator,
  addNotification,
  // ... and more
} = useChatStore();
```

### Group Store (`useGroupStore`)
```typescript
const {
  groups,
  selectedGroup,
  members,
  setSelectedGroup,
  addGroup,
  updateGroup,
  addMember,
  removeMember,
  // ... and more
} = useGroupStore();
```

### Message Store (`useMessageStore`)
```typescript
const {
  messages,
  attachments,
  unreadCounts,
  setMessages,
  addMessage,
  updateMessageStatus,
  incrementUnreadCount,
  // ... and more
} = useMessageStore();
```

## Role-Based Features

### Admin
- Create, edit, delete groups
- Add/remove group members
- View all audit logs
- Export chat history
- Manage deletion rules
- Delete any message

### Supervisor
- Create custom groups
- Add members to groups
- View group chat logs

### Operator
- 1-to-1 messaging
- Group messaging (if member)
- Delete own messages

### Accounts
- 1-to-1 messaging
- Group messaging (if member)
- Delete own messages

## Message Types Supported

- **Text**: Plain text messages
- **Image**: JPEG, PNG, GIF (inline preview)
- **Document**: PDF, Word, Excel
- **System**: Auto-generated messages (e.g., "User joined")

## Features Details

### Message Status
- **Sent**: ✓ Message delivered to server
- **Delivered**: ✓✓ Message delivered to recipient's client
- **Read**: ✓✓ (blue) Message read by recipient

### Typing Indicator
- Shows when user is typing
- Auto-hides after 3 seconds of inactivity
- Displays "User is typing..." with animated dots

### Online Indicator
- Shows "Online" with green dot for active users
- Shows "Last seen HH:MM" for offline users
- Real-time updates via WebSocket

### Notifications
- Toast notifications in bottom-right corner
- Auto-hide after 5 seconds (customizable)
- Click to navigate to conversation
- Mark as read / dismiss

### File Upload
- Drag & drop support (can add in MessageInput)
- Max 10MB per file (configurable)
- Supported: PDF, JPG, JPEG, PNG, GIF
- Progress indicator during upload
- Preview for images in chat

### Contextual Linking
- Link chats to vehicles, inward/outward entries, issues
- Quick navigation to related records
- Remove links easily
- Support for multiple links per chat

## Security Considerations

1. **Authentication**: All requests require JWT token
2. **Authorization**: Role-based access control
3. **Validation**: File type & size validation
4. **Sanitization**: HTML/XSS protection on message content
5. **Encryption**: Messages encrypted in transit (HTTPS)
6. **Audit Logging**: All actions logged for compliance

## Performance Optimizations

1. **Pagination**: Messages loaded in pages of 50
2. **Virtualization**: Can add for large message lists
3. **Caching**: Zustand stores cache locally
4. **Debouncing**: Typing indicator debounced
5. **Image Optimization**: Lazy loading for images
6. **Bundle Size**: Tree-shaking for unused imports

## Troubleshooting

### Socket Connection Issues
```typescript
// Check connection status
if (!socketService.isConnected()) {
  console.log("Not connected");
  // Manually reconnect
  await socketService.connect(url, token);
}
```

### Messages Not Loading
```typescript
// Verify API endpoint
const messages = await messageAPI.getConversationMessages(convId);
console.log(messages);

// Check store state
const { messages } = useMessageStore.getState();
```

### File Upload Fails
```typescript
// Check file size & type
if (file.size > 10 * 1024 * 1024) {
  console.error("File too large");
}

// Verify CORS headers
// Ensure backend allows file uploads
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT

## Support

For issues or feature requests, contact the development team.
