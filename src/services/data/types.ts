export interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface UserRecord extends BaseRecord {
  email: string;
  name: string;
  avatar_url?: string;
  role?: 'user' | 'admin' | 'owner';
  status?: 'active' | 'inactive';
}

export interface MessageRecord extends BaseRecord {
  user_id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: 'new' | 'read' | 'archived';
}

export interface SubscriptionRecord extends BaseRecord {
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  started_at: string;
  ends_at?: string;
}

export interface PortableDatabaseDump {
  users: UserRecord[];
  messages: MessageRecord[];
  subscriptions: SubscriptionRecord[];
  exported_at: string;
  version: '1.0';
}

export interface ImportOptions {
  clearExisting?: boolean;
}

export interface UpsertUserInput {
  id?: string;
  email: string;
  name: string;
  avatar_url?: string;
  role?: UserRecord['role'];
  status?: UserRecord['status'];
}

export interface UpsertMessageInput {
  id?: string;
  user_id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: MessageRecord['status'];
}

export interface UpsertSubscriptionInput {
  id?: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionRecord['status'];
  started_at?: string;
  ends_at?: string;
}
