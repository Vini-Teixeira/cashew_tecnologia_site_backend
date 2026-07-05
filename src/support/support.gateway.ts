import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class SupportGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() 
  server: Server;

  afterInit(server: Server) {
    console.log('🎧 [SupportGateway] Gateway de Suporte Inicializado');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`🟢 [SupportGateway] Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔴 [SupportGateway] Cliente desconectado: ${client.id}`);
  }

  emitTicketStatusChanged(ticketId: string, status: string) {
    console.log(`🔄 [SupportGateway] Status da OS ${ticketId} mudou para: ${status}`);
    this.server.emit('ticketStatusChanged', { ticketId, status });
  }

  emitNewTicket(ticket: any) {
    console.log(`📢 [SupportGateway] Disparando alerta de nova OS: ${ticket.ticketNumber}`);
    this.server.emit('newSupportTicket', ticket);
  }

  emitNewMessage(ticketId: string, message: any) {
    console.log(`💬 [SupportGateway] Nova mensagem na OS: ${ticketId}`);
    this.server.emit('ticketMessage', { ticketId, message });
  }
}