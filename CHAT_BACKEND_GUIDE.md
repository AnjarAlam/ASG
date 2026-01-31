# Chat Module - Backend Implementation Guide (NestJS + Socket.io)

## Setup Backend

### Installation

```bash
cd ASG-service

npm install socket.io @nestjs/websockets @nestjs/platform-socket.io
# or
pnpm add socket.io @nestjs/websockets @nestjs/platform-socket.io
```

### Database Schema (MongoDB)

```typescript
// schemas/message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true, type: Types.ObjectId })
  senderId: Types.ObjectId;

  @Prop(String)
  conversationId?: string;

  @Prop(String)
  groupId?: string;

  @Prop({ enum: ['text', 'image', 'document', 'system'], default: 'text' })
  messageType: string;

  @Prop({ enum: ['sent', 'delivered', 'read'], default: 'sent' })
  status: string;

  @Prop([String])
  readBy: string[];

  @Prop([
    {
      id: String,
      url: String,
      type: String,
      name: String,
      size: Number,
      uploadedAt: Date,
    },
  ])
  attachments: any[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
```

```typescript
// schemas/conversation.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ required: true, type: [Types.ObjectId], minlength: 2, maxlength: 2 })
  participantIds: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessageId?: Types.ObjectId;

  @Prop({ type: Map, of: Number, default: {} })
  unreadCounts: Map<string, number>;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
```

```typescript
// schemas/group.schema.ts
@Schema({ timestamps: true })
export class GroupChat extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  avatar?: string;

  @Prop({ required: true, type: [Types.ObjectId], ref: 'User' })
  members: Types.ObjectId[];

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  admin: Types.ObjectId;

  @Prop({ enum: ['department', 'custom', 'operational'], default: 'custom' })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessageId?: Types.ObjectId;

  @Prop({
    canAddMembers: { type: [String], default: ['Admin'] },
    canRemoveMembers: { type: [String], default: ['Admin'] },
    canDeleteMessages: { type: [String], default: ['Admin'] },
  })
  permissions: any;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const GroupChatSchema = SchemaFactory.createForClass(GroupChat);
```

## Service Implementation

```typescript
// chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from '../schemas/message.schema';
import { Conversation } from '../schemas/conversation.schema';
import { GroupChat } from '../schemas/group.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
    @InjectModel(GroupChat.name) private groupModel: Model<GroupChat>,
  ) {}

  // ==================== Conversations ====================
  async getConversations(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.conversationModel
      .find({ participantIds: new Types.ObjectId(userId) })
      .populate('lastMessageId')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async getOrCreateConversation(userId1: string, userId2: string) {
    const id1 = new Types.ObjectId(userId1);
    const id2 = new Types.ObjectId(userId2);

    let conversation = await this.conversationModel.findOne({
      participantIds: {
        $all: [id1, id2],
        $size: 2,
      },
    });

    if (!conversation) {
      conversation = await this.conversationModel.create({
        participantIds: [id1, id2],
        unreadCounts: new Map(),
      });
    }

    return conversation;
  }

  // ==================== Messages ====================
  async createMessage(messageData: any) {
    const message = await this.messageModel.create({
      ...messageData,
      readBy: [messageData.senderId],
    });

    // Update conversation/group lastMessage
    if (messageData.conversationId) {
      await this.conversationModel.findByIdAndUpdate(
        messageData.conversationId,
        { lastMessageId: message._id, updatedAt: new Date() }
      );
    } else if (messageData.groupId) {
      await this.groupModel.findByIdAndUpdate(
        messageData.groupId,
        { lastMessageId: message._id, updatedAt: new Date() }
      );
    }

    return message;
  }

  async getConversationMessages(conversationId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const total = await this.messageModel.countDocuments({ conversationId });
    const messages = await this.messageModel
      .find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      messages: messages.reverse(),
      total,
      page,
      pageSize: limit,
      hasMore: skip + limit < total,
    };
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.messageModel.findById(messageId);
    
    if (!message) throw new Error('Message not found');
    if (message.senderId.toString() !== userId && !this.isAdmin(userId)) {
      throw new Error('Unauthorized');
    }

    return this.messageModel.findByIdAndDelete(messageId);
  }

  async markAsRead(messageId: string, userId: string) {
    return this.messageModel.findByIdAndUpdate(
      messageId,
      {
        $addToSet: { readBy: new Types.ObjectId(userId) },
        status: 'read',
      },
      { new: true }
    );
  }

  // ==================== Groups ====================
  async createGroup(groupData: any) {
    const group = await this.groupModel.create({
      ...groupData,
      admin: new Types.ObjectId(groupData.admin),
      members: groupData.memberIds.map((id: string) => new Types.ObjectId(id)),
    });
    return group.populate('members admin');
  }

  async addGroupMember(groupId: string, userId: string) {
    return this.groupModel.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: new Types.ObjectId(userId) } },
      { new: true }
    ).populate('members');
  }

  async removeGroupMember(groupId: string, userId: string) {
    return this.groupModel.findByIdAndUpdate(
      groupId,
      { $pull: { members: new Types.ObjectId(userId) } },
      { new: true }
    ).populate('members');
  }

  // ==================== Audit ====================
  async logAction(action: string, performedBy: string, metadata: any) {
    // Log audit action
    // Implementation depends on your audit service
  }
}
```

## Socket.io Gateway Implementation

```typescript
// chat/chat.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const decoded = this.jwtService.verify(token);
      const userId = decoded.id;

      // Track user sockets
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(client.id);

      // Broadcast user online
      this.server.emit('user_online', {
        userId,
        isOnline: true,
        lastSeen: new Date(),
      });

      console.log(`User ${userId} connected`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Remove socket from tracking
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);

        if (sockets.size === 0) {
          this.userSockets.delete(userId);
          this.server.emit('user_offline', {
            userId,
            isOnline: false,
            lastSeen: new Date(),
          });
        }
      }
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(client: Socket, payload: any) {
    try {
      const token = client.handshake.auth.token;
      const decoded = this.jwtService.verify(token);
      const userId = decoded.id;

      // Create message
      const message = await this.chatService.createMessage({
        ...payload,
        senderId: userId,
        status: 'sent',
      });

      // Emit to recipients
      if (payload.conversationId) {
        this.server
          .to(`conversation_${payload.conversationId}`)
          .emit('message_received', message);
      } else if (payload.groupId) {
        this.server
          .to(`group_${payload.groupId}`)
          .emit('message_received', message);
      }

      // Update status to delivered
      setTimeout(() => {
        this.server.emit('message_status_updated', {
          messageId: message._id,
          status: 'delivered',
        });
      }, 100);

      // Log action
      await this.chatService.logAction('message_sent', userId, { messageId: message._id });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: any) {
    if (payload.conversationId) {
      this.server
        .to(`conversation_${payload.conversationId}`)
        .emit('user_typing', {
          userId: payload.userId,
          username: payload.username,
          isTyping: payload.isTyping,
          conversationId: payload.conversationId,
        });
    } else if (payload.groupId) {
      this.server
        .to(`group_${payload.groupId}`)
        .emit('user_typing', {
          userId: payload.userId,
          username: payload.username,
          isTyping: payload.isTyping,
          groupId: payload.groupId,
        });
    }
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(client: Socket, payload: any) {
    try {
      const token = client.handshake.auth.token;
      const decoded = this.jwtService.verify(token);
      const userId = decoded.id;

      await this.chatService.markAsRead(payload.messageId, userId);

      this.server.emit('message_read', {
        messageId: payload.messageId,
        userId,
        readAt: new Date(),
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('delete_message')
  async handleDeleteMessage(client: Socket, payload: any) {
    try {
      const token = client.handshake.auth.token;
      const decoded = this.jwtService.verify(token);
      const userId = decoded.id;

      await this.chatService.deleteMessage(payload.messageId, userId);

      this.server.emit('message_deleted', {
        messageId: payload.messageId,
      });

      await this.chatService.logAction('message_deleted', userId, {
        messageId: payload.messageId,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(client: Socket, payload: any) {
    client.join(`conversation_${payload.conversationId}`);
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(client: Socket, payload: any) {
    client.leave(`conversation_${payload.conversationId}`);
  }

  @SubscribeMessage('join_group')
  handleJoinGroup(client: Socket, payload: any) {
    client.join(`group_${payload.groupId}`);
  }

  @SubscribeMessage('leave_group')
  handleLeaveGroup(client: Socket, payload: any) {
    client.leave(`group_${payload.groupId}`);
  }

  @SubscribeMessage('file_upload')
  async handleFileUpload(client: Socket, payload: any) {
    try {
      const token = client.handshake.auth.token;
      const decoded = this.jwtService.verify(token);

      // Save file to storage (S3, local, etc)
      const fileUrl = await this.uploadFile(payload.file, payload.filename);

      const attachment = {
        id: new Types.ObjectId().toString(),
        url: fileUrl,
        type: payload.type,
        name: payload.filename,
        size: payload.file.length,
        uploadedAt: new Date(),
      };

      client.emit('file_upload_response', attachment);
    } catch (error) {
      client.emit('file_upload_response', { error: error.message });
    }
  }

  private async uploadFile(buffer: Buffer, filename: string): Promise<string> {
    // Implement file upload logic
    // Example: AWS S3, GCS, local storage, etc
    return `https://storage.example.com/${filename}`;
  }
}
```

## Controller Implementation

```typescript
// chat/chat.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ChatService } from './chat.service';

@Controller('api/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  // ==================== Conversations ====================
  @Get('conversations')
  getConversations(@Request() req, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.chatService.getConversations(req.user.id, page, limit);
  }

  @Get('conversations/:id')
  getConversation(@Param('id') id: string) {
    return this.chatService.getConversation(id);
  }

  @Post('conversations/with-user')
  createConversation(@Body() body: { userId: string }, @Request() req) {
    return this.chatService.getOrCreateConversation(req.user.id, body.userId);
  }

  @Get('conversations/:id/messages')
  getConversationMessages(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.chatService.getConversationMessages(id, page, limit);
  }

  // ==================== Messages ====================
  @Delete('messages/:id')
  deleteMessage(@Param('id') id: string, @Request() req) {
    return this.chatService.deleteMessage(id, req.user.id);
  }

  @Patch('messages/:id/read')
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.chatService.markAsRead(id, req.user.id);
  }

  // ==================== Groups ====================
  @Get('groups')
  getGroups(@Request() req, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.chatService.getGroups(req.user.id, page, limit);
  }

  @Post('groups')
  @Roles('Admin')
  @UseGuards(RolesGuard)
  createGroup(@Body() body: any, @Request() req) {
    return this.chatService.createGroup({
      ...body,
      admin: req.user.id,
    });
  }

  @Patch('groups/:id')
  @Roles('Admin')
  @UseGuards(RolesGuard)
  updateGroup(@Param('id') id: string, @Body() body: any) {
    return this.chatService.updateGroup(id, body);
  }

  @Delete('groups/:id')
  @Roles('Admin')
  @UseGuards(RolesGuard)
  deleteGroup(@Param('id') id: string) {
    return this.chatService.deleteGroup(id);
  }

  @Post('groups/:id/members')
  @Roles('Admin', 'Supervisor')
  @UseGuards(RolesGuard)
  addGroupMember(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.chatService.addGroupMember(id, body.userId);
  }

  @Delete('groups/:id/members/:userId')
  @Roles('Admin')
  @UseGuards(RolesGuard)
  removeGroupMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.chatService.removeGroupMember(id, userId);
  }

  // ==================== Audit ====================
  @Get('audit/logs')
  @Roles('Admin')
  @UseGuards(RolesGuard)
  getAuditLogs(@Query() filters: any) {
    return this.chatService.getAuditLogs(filters);
  }

  @Get('audit/export')
  @Roles('Admin')
  @UseGuards(RolesGuard)
  exportHistory(@Query('format') format = 'pdf') {
    return this.chatService.exportHistory(format);
  }
}
```

## Module Registration

```typescript
// chat/chat.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { MessageSchema } from '../schemas/message.schema';
import { ConversationSchema } from '../schemas/conversation.schema';
import { GroupChatSchema } from '../schemas/group.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Message', schema: MessageSchema },
      { name: 'Conversation', schema: ConversationSchema },
      { name: 'GroupChat', schema: GroupChatSchema },
    ]),
  ],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {}
```

## Main App Configuration

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(3000);
  console.log('Server running on http://localhost:3000');
}

bootstrap();
```

## Environment Variables

```env
# .env
MONGODB_URI=mongodb://localhost:27017/coal-washery
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
FILE_UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

## Running Backend

```bash
npm run start:dev
```

Visit `http://localhost:3000` and WebSocket will be available at `ws://localhost:3000`

