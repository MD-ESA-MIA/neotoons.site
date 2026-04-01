import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseProvider } from './provider';
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
import {
  validateMessageInput,
  validateSubscriptionInput,
  validateUserInput,
} from './validation';

const USERS_TABLE = 'users';
const MESSAGES_TABLE = 'messages';
const SUBSCRIPTIONS_TABLE = 'subscriptions';

const nowIso = () => new Date().toISOString();
const withTimestamps = <T extends { id?: string }>(input: T) => ({
  id: input.id ?? crypto.randomUUID(),
  created_at: nowIso(),
  updated_at: nowIso(),
  ...input,
});

export class SupabaseProvider implements DatabaseProvider {
  private client: SupabaseClient;

  constructor() {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error('Supabase is not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    }

    this.client = createClient(url, anonKey);
  }

  async createUser(input: UpsertUserInput): Promise<UserRecord> {
    validateUserInput(input);
    const payload = withTimestamps({
      ...input,
      email: input.email.toLowerCase(),
      status: input.status ?? 'active',
      role: input.role ?? 'user',
    });

    const { data, error } = await this.client
      .from(USERS_TABLE)
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as UserRecord;
  }

  async getUsers(): Promise<UserRecord[]> {
    const { data, error } = await this.client
      .from(USERS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as UserRecord[];
  }

  async updateUser(id: string, updates: Partial<UpsertUserInput>): Promise<UserRecord> {
    const payload = { ...updates, updated_at: nowIso() };
    if (payload.email) {
      validateUserInput({ email: payload.email, name: payload.name ?? 'keep-existing' });
      payload.email = payload.email.toLowerCase();
    }

    const { data, error } = await this.client
      .from(USERS_TABLE)
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as UserRecord;
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await this.client.from(USERS_TABLE).delete().eq('id', id);
    if (error) throw error;
  }

  async saveMessage(input: UpsertMessageInput): Promise<MessageRecord> {
    validateMessageInput(input);
    const payload = withTimestamps({
      ...input,
      email: input.email.toLowerCase(),
      status: input.status ?? 'new',
    });

    const { data, error } = await this.client
      .from(MESSAGES_TABLE)
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as MessageRecord;
  }

  async getMessages(): Promise<MessageRecord[]> {
    const { data, error } = await this.client
      .from(MESSAGES_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as MessageRecord[];
  }

  async updateMessage(id: string, updates: Partial<UpsertMessageInput>): Promise<MessageRecord> {
    const payload = { ...updates, updated_at: nowIso() };

    if (payload.email) {
      payload.email = payload.email.toLowerCase();
    }

    const { data, error } = await this.client
      .from(MESSAGES_TABLE)
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as MessageRecord;
  }

  async deleteMessage(id: string): Promise<void> {
    const { error } = await this.client.from(MESSAGES_TABLE).delete().eq('id', id);
    if (error) throw error;
  }

  async createSubscription(input: UpsertSubscriptionInput): Promise<SubscriptionRecord> {
    validateSubscriptionInput(input);
    const payload = withTimestamps({
      ...input,
      started_at: input.started_at ?? nowIso(),
    });

    const { data, error } = await this.client
      .from(SUBSCRIPTIONS_TABLE)
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as SubscriptionRecord;
  }

  async getSubscriptions(): Promise<SubscriptionRecord[]> {
    const { data, error } = await this.client
      .from(SUBSCRIPTIONS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as SubscriptionRecord[];
  }

  async updateSubscription(id: string, updates: Partial<UpsertSubscriptionInput>): Promise<SubscriptionRecord> {
    const payload = { ...updates, updated_at: nowIso() };

    const { data, error } = await this.client
      .from(SUBSCRIPTIONS_TABLE)
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as SubscriptionRecord;
  }

  async deleteSubscription(id: string): Promise<void> {
    const { error } = await this.client.from(SUBSCRIPTIONS_TABLE).delete().eq('id', id);
    if (error) throw error;
  }

  async exportAllData(): Promise<PortableDatabaseDump> {
    const [users, messages, subscriptions] = await Promise.all([
      this.getUsers(),
      this.getMessages(),
      this.getSubscriptions(),
    ]);

    return {
      users,
      messages,
      subscriptions,
      exported_at: nowIso(),
      version: '1.0',
    };
  }

  async importAllData(data: PortableDatabaseDump, options: ImportOptions = {}): Promise<void> {
    if (options.clearExisting) {
      await Promise.all([
        this.client.from(USERS_TABLE).delete().neq('id', ''),
        this.client.from(MESSAGES_TABLE).delete().neq('id', ''),
        this.client.from(SUBSCRIPTIONS_TABLE).delete().neq('id', ''),
      ]);
    }

    if (data.users.length) {
      const { error } = await this.client.from(USERS_TABLE).upsert(data.users, { onConflict: 'id' });
      if (error) throw error;
    }

    if (data.messages.length) {
      const { error } = await this.client.from(MESSAGES_TABLE).upsert(data.messages, { onConflict: 'id' });
      if (error) throw error;
    }

    if (data.subscriptions.length) {
      const { error } = await this.client.from(SUBSCRIPTIONS_TABLE).upsert(data.subscriptions, { onConflict: 'id' });
      if (error) throw error;
    }
  }
}
