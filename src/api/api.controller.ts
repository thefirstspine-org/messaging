import { Controller, UseGuards, Post, Req, Body } from '@nestjs/common';
import { MessagingService } from '../messaging/messaging.service';
import { CertificateGuard } from '@thefirstspine/certificate-nest';
import { LogsService } from '@thefirstspine/logs-nest';
import { SendMessageDto } from './send-message.dto';

@Controller('api')
export class ApiController {

  constructor(
    private readonly messagingService: MessagingService,
    private readonly logService: LogsService,
  ) {}

  /**
   * Main post method. This method is protected with the CertificateGuard
   * @param body
   */
  @Post()
  // @UseGuards(CertificateGuard)
  sendMessage(@Req() request: any, @Body() body: SendMessageDto) {
    this.logService.info('Recieved request', body);

    // Send pending messages
    const result = this.messagingService.sendMessageToClient(
      body.to,
      body.subject,
      body.message);

    return {
      status: result,
      original: request.body,
    };
  }
}
