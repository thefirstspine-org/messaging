import { Injectable } from '@nestjs/common';
import { LogsService } from '@thefirstspine/logs-nest';

@Injectable()
export class MessagingService {
  // Map userId -> Set of client connections (supports multi-device)
  protected userClients: Map<number, Set<IClientMessaging>> = new Map();
  // Map client -> userId (quick reverse lookup for removal)
  protected clientToUser: Map<IClientMessaging, number> = new Map();
  // Map userId -> Set of subjects the user is subscribed to
  protected userSubjects: Map<number, Set<string>> = new Map();
  // Map subject -> Set of userIds subscribed
  protected subjectSubscribers: Map<string, Set<number>> = new Map();

  constructor(
    private readonly logService: LogsService,
  ) {}

  /**
   * Add a user/client to the messaging service. Supports multiple clients per user.
   */
  addUser(messagingUser: IMessagingUser) {
    const { client, user, subjects } = messagingUser;
    this.logService.info('Add new user', { user, subjects });

    // Remove any previous association for this client
    this.removeClient(client);

    // add client to user's client set
    let clients = this.userClients.get(user);
    if (!clients) {
      clients = new Set();
      this.userClients.set(user, clients);
    }
    clients.add(client);
    this.clientToUser.set(client, user);

    // ensure user's subject set exists and add provided subjects
    let subjSet = this.userSubjects.get(user);
    if (!subjSet) {
      subjSet = new Set();
      this.userSubjects.set(user, subjSet);
    }
    for (const s of subjects || []) {
      if (!subjSet.has(s)) {
        subjSet.add(s);
        let subs = this.subjectSubscribers.get(s);
        if (!subs) {
          subs = new Set();
          this.subjectSubscribers.set(s, subs);
        }
        subs.add(user);
      }
    }
  }

  /**
   * Remove a client connection. Cleans up user maps if no clients remain.
   */
  removeClient(client: IClientMessaging) {
    const user = this.clientToUser.get(client);
    this.logService.info('Remove client', { user });
    if (!user) return;

    // remove client from user's client set
    const clients = this.userClients.get(user);
    if (clients) {
      clients.delete(client);
      if (clients.size === 0) {
        this.userClients.delete(user);
      }
    }

    // remove client -> user mapping
    this.clientToUser.delete(client);

    // If user has no clients left, remove their subject registrations
    if (!this.userClients.has(user)) {
      const subjSet = this.userSubjects.get(user);
      if (subjSet) {
        for (const s of subjSet) {
          const subs = this.subjectSubscribers.get(s);
          if (subs) {
            subs.delete(user);
            if (subs.size === 0) this.subjectSubscribers.delete(s);
          }
        }
        this.userSubjects.delete(user);
      }
    }
  }

  /**
   * Remove a user and all their clients and subscriptions.
   */
  removeUser(user: number) {
    this.logService.info('Remove user', { user });
    const clients = this.userClients.get(user);
    if (clients) {
      for (const c of clients) {
        this.clientToUser.delete(c);
      }
      this.userClients.delete(user);
    }

    const subjSet = this.userSubjects.get(user);
    if (subjSet) {
      for (const s of subjSet) {
        const subs = this.subjectSubscribers.get(s);
        if (subs) {
          subs.delete(user);
          if (subs.size === 0) this.subjectSubscribers.delete(s);
        }
      }
      this.userSubjects.delete(user);
    }
  }

  /**
   * Subscribes the connected client's user to a subject.
   */
  subscribeToSubject(client: IClientMessaging, subject: string) {
    const user = this.clientToUser.get(client);
    if (!user) {
      this.logService.info('subscribeToSubject: unknown client', { subject });
      return;
    }

    this.logService.info('Subscribe to subject', { user, subject });

    let subjSet = this.userSubjects.get(user);
    if (!subjSet) {
      subjSet = new Set();
      this.userSubjects.set(user, subjSet);
    }
    if (!subjSet.has(subject)) subjSet.add(subject);

    let subs = this.subjectSubscribers.get(subject);
    if (!subs) {
      subs = new Set();
      this.subjectSubscribers.set(subject, subs);
    }
    subs.add(user);
  }

  /**
   * Unsubscribe client's user from a subject.
   */
  unsubscribeToSubject(client: IClientMessaging, subject: string) {
    const user = this.clientToUser.get(client);
    if (!user) {
      this.logService.info('unsubscribeToSubject: unknown client', { subject });
      return;
    }

    this.logService.info('Unsubscribe to subject', { user, subject });

    const subjSet = this.userSubjects.get(user);
    if (subjSet) subjSet.delete(subject);

    const subs = this.subjectSubscribers.get(subject);
    if (subs) {
      subs.delete(user);
      if (subs.size === 0) this.subjectSubscribers.delete(subject);
    }
  }

  /**
   * Send a message to some users. Optimized to find recipients by subject and user id sets.
   */
  sendMessageToClient(to: number[]|'*', subject: string, message: any) {
    this.logService.info('Send message to client', { to, subject });
    let hadSentMessage = false;

    // recipients are users who are subscribed to the subject and included in `to`
    const subs = this.subjectSubscribers.get(subject) || new Set<number>();
    const recipientIds: Set<number> = new Set();

    if (to === '*') {
      // all subscribed users
      for (const u of subs) recipientIds.add(u);
    } else {
      // intersection between provided user list and subscribed users
      for (const u of to) {
        if (subs.has(u)) recipientIds.add(u);
      }
    }

    // send to each user's connected clients
    for (const userId of recipientIds) {
      const clients = this.userClients.get(userId);
      if (!clients) continue;
      const messageToSend = JSON.stringify({ to, subject, message });
      for (const c of clients) {
        try {
          c.send(messageToSend);
          hadSentMessage = true;
        } catch (err) {
          // if send fails, remove the client to avoid future errors
          this.logService.info('Failed to send to client, removing', { userId, err });
          try { this.removeClient(c); } catch (e) { /* swallow */ }
        }
      }
    }

    return to === '*' || hadSentMessage;
  }

  /**
   * Get all users currently registered (has at least one client)
   */
  getAllUsers(): number[] {
    return Array.from(this.userClients.keys());
  }
}

export interface IClientMessaging {
  send(message: string): void;
}

export interface IMessagingUser {
  client: IClientMessaging;
  user: number;
  subjects: string[];
}
