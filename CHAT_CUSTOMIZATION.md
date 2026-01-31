# Chat Module - Customization & Best Practices

## Customization Guide

### 1. Styling with Tailwind CSS

All components use Tailwind CSS classes. Customize by modifying the `className` strings:

#### Color Scheme
```typescript
// Change primary color from blue to your brand color
// In Message.tsx: bg-blue-500 → bg-[your-color]
// In MessageInput.tsx: focus:ring-blue-500 → focus:ring-[your-color]

// Example: Change to green
<button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
  Send
</button>
```

#### Dark Mode Support
```typescript
// Add dark mode classes
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  {content}
</div>
```

### 2. Customize Message Attachment Types

In `lib/services/chat-api.ts`:

```typescript
// Modify accepted file types
acceptedFileTypes = [".pdf", ".jpg", ".jpeg", ".png", ".gif", ".doc", ".docx", ".xls"]

// Modify max file size (example: 50MB)
maxFileSize = 50 * 1024 * 1024
```

### 3. Customize Typing Indicator Timeout

In `app/dashboard/chat/page.tsx`:

```typescript
// Default: 3000ms
typingTimeoutRef.current = setTimeout(() => {
  // Change 3000 to your desired timeout
}, 3000); // ← Modify this value
```

### 4. Customize Notification Duration

In `app/components/chat/Notifications.tsx`:

```typescript
// Add auto-dismiss timer
useEffect(() => {
  const timer = setTimeout(() => {
    onRemove?.(notification.id);
  }, 5000); // ← Modify this value (in ms)
  
  return () => clearTimeout(timer);
}, [notification.id]);
```

### 5. Add Emoji Support

```typescript
// Install emoji-picker-react
npm install emoji-picker-react

// In MessageInput.tsx
import EmojiPicker from 'emoji-picker-react';

// Add emoji button and picker
<button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😊</button>
{showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiSelect} />}
```

### 6. Add Message Search

```typescript
// In ChatList.tsx
const handleSearch = async (query: string) => {
  const results = await messageAPI.search(
    chatStore.currentConversation?.id,
    query
  );
  setSearchResults(results);
};
```

### 7. Add Message Reactions

```typescript
// Define reaction schema
export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

// Add to Message.tsx
<div className="flex gap-1 mt-2">
  {reactions.map(r => (
    <div key={r.id} className="text-sm">{r.emoji}</div>
  ))}
</div>
```

### 8. Add Voice Messages

```typescript
// Install react-mic-recorder
npm install react-mic-recorder

// In MessageInput.tsx
import { useAudioRecorder } from 'react-mic-recorder';

const { startRecording, stopRecording } = useAudioRecorder();

// Add voice message button
<button onClick={startRecording}>🎤 Voice</button>
```

### 9. Add Message Forwarding

```typescript
// In Message.tsx - Add forward button
<button onClick={() => onForward?.(message)}>
  Forward
</button>

// Handle forward
const handleForward = (message: Message) => {
  // Show list of conversations to forward to
  // Send message to selected conversation
};
```

### 10. Add Message Pinning

```typescript
// Pin important messages to top
const pinnedMessages = messages.filter(m => m.pinned);

<div className="bg-yellow-50 p-3 rounded-lg mb-4">
  <p className="text-xs font-semibold text-yellow-800">📌 Pinned Message</p>
  {pinnedMessages.map(msg => (
    <div key={msg.id}>{msg.content}</div>
  ))}
</div>
```

## Backend API Implementation Examples

### Node.js + Express Example

```typescript
// src/controllers/chat.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  getConversations() {
    // Return list of conversations
  }

  @Post('messages')
  sendMessage(@Body() data: SendMessageDto) {
    // Emit message via WebSocket
    // Save to database
    // Return message with ID and timestamp
  }

  @Get('messages/:id')
  getMessage(@Param('id') id: string) {
    // Return message details
  }

  @Delete('messages/:id')
  deleteMessage(@Param('id') id: string) {
    // Check permissions
    // Delete message
    // Log to audit
  }
}
```

### WebSocket Events Implementation

```typescript
// src/gateway/chat.gateway.ts
import { WebSocketGateway, SubscribeMessage, OnGatewayConnection } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL },
})
export class ChatGateway {
  @SubscribeMessage('send_message')
  handleSendMessage(client: Socket, payload: SendMessagePayload) {
    // Save to database
    // Emit to recipient
    // Update message status
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: TypingPayload) {
    // Emit typing indicator to conversation members
  }

  @SubscribeMessage('mark_as_read')
  handleMarkAsRead(client: Socket, payload: MarkAsReadPayload) {
    // Update message status
    // Emit read receipt
  }
}
```

## Integration with Other Modules

### Linking Chat to Inventory Module

```typescript
// In Inventory Page
import ContextualLinking from '@/app/components/chat/ContextualLinking';

<ContextualLinking
  conversationId={currentConversation?.id}
  initialLinks={[{
    entityType: 'inventory',
    entityId: inventory.id,
    entityName: inventory.name,
  }]}
/>
```

### Linking Chat to Inward/Outward Modules

```typescript
// In Inward Entry Page
import ContextualLinking from '@/app/components/chat/ContextualLinking';

<ContextualLinking
  groupId={operatorsGroupId}
  initialLinks={[{
    entityType: 'inward',
    entityId: inwardEntry.id,
    entityName: `Inward ${inwardEntry.vehicleNumber}`,
  }]}
/>
```

## Performance Tuning

### 1. Message Pagination

```typescript
// Implement infinite scroll
const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  const element = e.currentTarget;
  if (element.scrollTop === 0) {
    // Load older messages
    loadMoreMessages('older');
  }
};
```

### 2. Message Virtualization

```typescript
// For large message lists, use virtualization
import { FixedSizeList as List } from 'react-window';

<List
  height={600}
  itemCount={messages.length}
  itemSize={50}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <MessageComponent message={messages[index]} />
    </div>
  )}
</List>
```

### 3. Debounce Typing Indicator

```typescript
// Reduce WebSocket traffic
const debouncedTyping = useCallback(
  debounce((isTyping: boolean) => {
    socketService.sendTypingIndicator({ conversationId, isTyping });
  }, 500),
  [conversationId]
);
```

### 4. Cache Management

```typescript
// Store conversations in localStorage for offline support
const saveCacheToStorage = () => {
  localStorage.setItem('chatCache', JSON.stringify({
    conversations: chatStore.conversations,
    groups: groupStore.groups,
  }));
};

const loadCacheFromStorage = () => {
  const cached = localStorage.getItem('chatCache');
  if (cached) {
    const { conversations, groups } = JSON.parse(cached);
    chatStore.setConversations(conversations);
    groupStore.setGroups(groups);
  }
};
```

## Testing

### Unit Tests Example

```typescript
// chat.test.ts
import { useChatStore } from '@/store/chat-store';

describe('Chat Store', () => {
  it('should add a message', () => {
    const { addMessage, messages } = useChatStore.getState();
    const testMessage = { id: '1', content: 'Hello' };
    
    addMessage(testMessage);
    
    expect(messages).toContain(testMessage);
  });

  it('should update message status', () => {
    const { updateMessageStatus } = useChatStore.getState();
    
    updateMessageStatus('1', 'read');
    
    expect(messages[0].status).toBe('read');
  });
});
```

### Integration Tests Example

```typescript
// chat.integration.test.ts
describe('Chat API', () => {
  it('should send and receive message', async () => {
    const message = await messageAPI.send({
      conversationId: 'conv1',
      content: 'Test message',
      messageType: 'text',
    });

    expect(message.id).toBeDefined();
    expect(message.status).toBe('sent');
  });
});
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] CORS properly configured on backend
- [ ] WebSocket connection tested
- [ ] File upload size limits set
- [ ] Message retention policies configured
- [ ] Audit logging enabled
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] SSL/TLS enabled for WebSocket (wss://)
- [ ] Database backups configured
- [ ] Monitoring and alerting set up
- [ ] Chat logs retention policy defined
- [ ] GDPR compliance (data deletion)

## Security Best Practices

1. **Validate all inputs** on both client and server
2. **Sanitize message content** to prevent XSS
3. **Encrypt sensitive data** in transit and at rest
4. **Use strong authentication** (JWT with expiration)
5. **Implement rate limiting** on WebSocket events
6. **Log all actions** for audit trail
7. **Restrict file uploads** to safe types and sizes
8. **Use CORS properly** to prevent unauthorized access
9. **Implement role-based access control** for all features
10. **Regular security audits** of chat module

## Common Issues & Solutions

### Issue: Socket Connection Timeout
**Solution**: Check network connectivity, increase timeout value
```typescript
reconnectionDelay: 10000, // Increase from 3000
reconnectionAttempts: 10, // Increase from 5
```

### Issue: Messages Not Syncing
**Solution**: Ensure all clients receive same message order
```typescript
// Sort messages by timestamp on load
messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
```

### Issue: High Memory Usage
**Solution**: Implement message pagination and cleanup
```typescript
// Keep only last 100 messages in store
if (messages.length > 100) {
  messageStore.setMessages(messages.slice(-100));
}
```

### Issue: Emoji Not Rendering
**Solution**: Ensure UTF-8 encoding
```typescript
// In package.json
"scripts": {
  "build": "next build",
}

// In next.config.js
module.exports = {
  experimental: { optimizePackageImports: ['emoji-picker-react'] }
}
```

## Future Enhancements

- [ ] Voice/Video calling
- [ ] Screen sharing
- [ ] Message encryption
- [ ] Advanced search with filters
- [ ] Custom emojis
- [ ] Bot integration
- [ ] Message threading/replies
- [ ] Rich text editor (Markdown support)
- [ ] Message translation
- [ ] Chat analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)

