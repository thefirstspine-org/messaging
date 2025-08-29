import {
  WebSocketGateway,
  SubscribeMessage,
  WsException,
  OnGatewayDisconnect,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { MessagingService } from '../messaging/messaging.service';
import { AuthService } from '@thefirstspine/auth-nest';
import { LogsService } from '@thefirstspine/logs-nest';

@WebSocketGateway()
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    private readonly authService: AuthService,
    private readonly messagingService: MessagingService,
    private readonly logsService: LogsService,
  ) {
    this.logsService.info(`Ready to listen for connections`, {});
  }

  async handleConnection(client: any) {
    this.logsService.info(`New client connected`, {});
  }

  async handleDisconnect(client: any) {
    this.messagingService.removeClient(client);
    this.logsService.info(`Client disconnected`, {});
  }

  @SubscribeMessage('login')
  async login(client: any, data: any) {
    this.logsService.info(`Login sent`, {});
    const user: number|null = await this.authService.me(data.jwt);
    if (!user) {
      throw new WsException('Invalid credentials.');
    }

    this.messagingService.addUser({
      client,
      user: parseInt(user.toString(10), 10), // force to integer
      subjects: [
      ],
    });

    client.send(JSON.stringify({
      logged: user,
    }));
  }

  @SubscribeMessage('subscribeToSubject')
  async subscribeToSubject(client: any, data: any) {
    this.logsService.info(`subscribeToSubject sent`, data);
    await this.messagingService.subscribeToSubject(
      client,
      data.subject,
    );
    client.send(JSON.stringify({
      subscribed: data.subject,
    }));
  }

  @SubscribeMessage('unsubscribeToSubject')
  async unsubscribeToSubject(client: any, data: any) {
    this.logsService.info(`unsubscribeToSubject sent`, data);
    this.messagingService.unsubscribeToSubject(
      client,
      data.subject,
    );
    client.send(JSON.stringify({
      unsubscribed: data.subject,
    }));
  }

  @SubscribeMessage('ping')
  async ping(client: any, data: any) {
    this.logsService.info(`ping sent`, data);
    client.send(JSON.stringify({
      ping: 'pong',
    }));
  }

}
