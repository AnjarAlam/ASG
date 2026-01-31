# Chat Module - Quick Start Guide

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd coal_washary_management_system
npm install socket.io-client zustand date-fns lucide-react
```

### Step 2: Configure Environment
Create/update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### Step 3: Start Using the Chat

The main chat page is already created at:
- **Direct 1-to-1 Chat**: `/dashboard/chat`
- **Group Management**: `/dashboard/chat/group`
- **Audit & Control**: `/dashboard/chat/audit`

### Step 4: Test the Module

```typescript
// In your page or component
import Chat from '@/app/dashboard/chat/page';

// The component auto-initializes on mount
export default function Page() {
  return <Chat />;
}
```

## File Structure Overview

```
✅ Core Store Files (Zustand)
   - store/chat-store.ts ...................... Main chat state
   - store/group-store.ts ..................... Group management state
   - store/message-store.ts ................... Message state

✅ Services
   - lib/services/socket.ts .................. WebSocket client
   - lib/services/chat-api.ts ................ REST API client

✅ UI Components
   - app/components/chat/Message.tsx ........ Message display
   - app/components/chat/MessageInput.tsx .. Message input with files
   - app/components/chat/ChatList.tsx ...... Conversations/groups list
   - app/components/chat/Notifications.tsx. Toast notifications
   - app/components/chat/TypingIndicator.tsx Typing animation
   - app/components/chat/OnlineIndicator.tsx Online status
   - app/components/chat/ContextualLinking.tsx Link to records

✅ Pages
   - app/dashboard/chat/page.tsx ........... Main 1-to-1 chat
   - app/dashboard/chat/group/page.tsx .... Group management
   - app/dashboard/chat/audit/page.tsx .... Audit & control

✅ Types
   - schemas/chat.ts ........................ All TypeScript types

✅ Documentation
   - CHAT_MODULE_README.md ................. Complete documentation
   - CHAT_CUSTOMIZATION.md ................. Customization guide
   - CHAT_BACKEND_GUIDE.md ................. Backend implementation
```

## Key Features At a Glance

### 1-to-1 Chat
```typescript
// Automatically loads conversations
// Select a user to start chatting
// Real-time message sync
// File uploads supported
// Message status (sent, delivered, read)
```

### Group Chat
```typescript
// Admin can create groups
// Add/remove members
// Real-time group messaging
// Per-user read receipts
// Type-based groups (department, operational)
```

### Real-Time Features
```typescript
// ✅ Typing indicators
// ✅ Online/offline status
// ✅ Read receipts
// ✅ Message status updates
// ✅ Instant notifications
```

### File Sharing
```typescript
// Supported: PDF, JPG, PNG, GIF
// Max size: 10MB (configurable)
// Image preview in chat
// Download with one click
```

### Admin Features
```typescript
// ✅ Message deletion rules
// ✅ Chat audit logs
// ✅ Export history (PDF/CSV)
// ✅ User role management
// ✅ Message retention policies
```

## Common Tasks

### Get All Conversations
```typescript
import { useChatStore } from '@/store/chat-store';

const conversations = useChatStore((state) => state.conversations);
```

### Send a Message
```typescript
// Automatically handled by MessageInput component
// Just pass onSend handler to MessageInput
<MessageInput
  onSend={async (content, attachments) => {
    socketService.sendMessage({
      conversationId: 'conv123',
      content,
      messageType: 'text',
      attachments,
    });
  }}
/>
```

### Subscribe to Messages
```typescript
// Messages automatically sync via WebSocket
// Store updates automatically
useEffect(() => {
  const messages = useMessageStore((state) => state.messages);
  console.log('New messages:', messages);
}, []);
```

### Handle Notifications
```typescript
// Notifications automatically appear
// Handle click:
const handleNotificationClick = (notification) => {
  if (notification.conversationId) {
    // Navigate to conversation
  }
};
```

## Troubleshooting

### Issue: Not seeing messages
**Check:**
1. WebSocket connected: `socketService.isConnected()`
2. Conversation loaded: `chatStore.currentConversation`
3. API endpoint correct in `.env.local`

### Issue: File upload not working
**Check:**
1. File size < 10MB
2. File type supported (PDF, JPG, PNG)
3. Backend file upload endpoint working

### Issue: Typing indicator not showing
**Check:**
1. WebSocket connected
2. `onTyping` callback passed to MessageInput
3. Other user receives typing event

## Performance Tips

1. **Pagination**: Messages loaded in pages of 50
2. **Virtual scrolling**: Add react-window for long chats
3. **Caching**: Zustand stores cache locally
4. **Debouncing**: Typing indicator debounced automatically

## Security Notes

- ✅ JWT authentication required
- ✅ Role-based access control enforced
- ✅ File types validated
- ✅ Message content sanitized
- ✅ All actions logged

## Next Steps

1. **Test Locally**: Run the frontend and backend
2. **Configure Backend**: Follow `CHAT_BACKEND_GUIDE.md`
3. **Customize Styling**: Edit Tailwind classes as needed
4. **Add Features**: See `CHAT_CUSTOMIZATION.md`
5. **Deploy**: Follow your deployment process

## API Quick Reference

| Action | Method | Endpoint |
|--------|--------|----------|
| Get conversations | GET | `/api/chat/conversations` |
| Get messages | GET | `/api/chat/conversations/:id/messages` |
| Send message | POST | WebSocket: `send_message` |
| Delete message | DELETE | `/api/chat/messages/:id` |
| Get groups | GET | `/api/chat/groups` |
| Create group | POST | `/api/chat/groups` |
| Add member | POST | `/api/chat/groups/:id/members` |
| Remove member | DELETE | `/api/chat/groups/:id/members/:userId` |
| Get audit logs | GET | `/api/chat/audit/logs` |
| Export history | GET | `/api/chat/audit/export` |

## WebSocket Quick Reference

| Event | Data | Handler |
|-------|------|---------|
| `send_message` | Message payload | `handleSendMessage` |
| `typing` | TypingPayload | `handleTyping` |
| `mark_as_read` | messageId | `handleMarkAsRead` |
| `delete_message` | messageId | `handleDeleteMessage` |
| `join_conversation` | conversationId | `handleJoinConversation` |
| `file_upload` | File buffer | `handleFileUpload` |

## Support Files

- 📖 **Full Documentation**: `CHAT_MODULE_README.md`
- 🎨 **Customization Guide**: `CHAT_CUSTOMIZATION.md`
- 🔧 **Backend Setup**: `CHAT_BACKEND_GUIDE.md`
- ⚡ **This Guide**: `CHAT_QUICK_START.md`

## Production Checklist

- [ ] Environment variables configured
- [ ] Backend API working
- [ ] WebSocket connected
- [ ] CORS configured
- [ ] File upload working
- [ ] Authentication working
- [ ] Role-based access working
- [ ] Notifications working
- [ ] Audit logging working
- [ ] Error handling tested
- [ ] Performance tested
- [ ] Security audit done
- [ ] Deployed to production

## Need Help?

Refer to:
1. `CHAT_MODULE_README.md` - Full documentation
2. `CHAT_BACKEND_GUIDE.md` - Backend issues
3. `CHAT_CUSTOMIZATION.md` - Custom features
4. Console errors - Check browser DevTools

Good luck! 🚀
