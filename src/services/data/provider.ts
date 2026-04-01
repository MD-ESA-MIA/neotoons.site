import {
  ImportOptions,
  MessageRecord,
  PortableDatabaseDump,
  SubscriptionRecord,
  UpsertMessageInput,
  UpsertSubscriptionInput,
  UpsertUserInput,
  UserRecord,
} from './types';

export interface DatabaseProvider {
  createUser(input: UpsertUserInput): Promise<UserRecord>;
  getUsers(): Promise<UserRecord[]>;
  updateUser(id: string, updates: Partial<UpsertUserInput>): Promise<UserRecord>;
  deleteUser(id: string): Promise<void>;

  saveMessage(input: UpsertMessageInput): Promise<MessageRecord>;
  getMessages(): Promise<MessageRecord[]>;
  updateMessage(id: string, updates: Partial<UpsertMessageInput>): Promise<MessageRecord>;
  deleteMessage(id: string): Promise<void>;

  createSubscription(input: UpsertSubscriptionInput): Promise<SubscriptionRecord>;
  getSubscriptions(): Promise<SubscriptionRecord[]>;
  updateSubscription(id: string, updates: Partial<UpsertSubscriptionInput>): Promise<SubscriptionRecord>;
  deleteSubscription(id: string): Promise<void>;

  exportAllData(): Promise<PortableDatabaseDump>;
  importAllData(data: PortableDatabaseDump, options?: ImportOptions): Promise<void>;
}
