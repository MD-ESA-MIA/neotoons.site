import { DatabaseProvider } from './data/provider';
import { SupabaseProvider } from './data/supabaseProvider';
import {
  ImportOptions,
  MessageRecord,
  PortableDatabaseDump,
  SubscriptionRecord,
  UpsertMessageInput,
  UpsertSubscriptionInput,
  UpsertUserInput,
  UserRecord,
} from './data/types';

export type DatabaseProviderName = 'supabase';

const configuredProvider = import.meta.env.VITE_DB_PROVIDER;

if (configuredProvider && configuredProvider !== 'supabase') {
  console.warn(`Unsupported VITE_DB_PROVIDER "${configuredProvider}". Falling back to supabase.`);
}

let provider: DatabaseProvider | null = null;
let providerName: DatabaseProviderName = 'supabase';

const buildProvider = (name: DatabaseProviderName): DatabaseProvider => {
  return new SupabaseProvider();
};

const getProvider = (): DatabaseProvider => {
  if (!provider) {
    provider = buildProvider(providerName);
  }

  return provider;
};

export const setDatabaseProvider = (name: DatabaseProviderName) => {
  providerName = name;
  provider = buildProvider(name);
};

export const getDatabaseProviderName = (): DatabaseProviderName => providerName;

export const createUser = async (input: UpsertUserInput): Promise<UserRecord> => {
  return getProvider().createUser(input);
};

export const getUsers = async (): Promise<UserRecord[]> => {
  return getProvider().getUsers();
};

export const updateUser = async (id: string, updates: Partial<UpsertUserInput>): Promise<UserRecord> => {
  return getProvider().updateUser(id, updates);
};

export const deleteUser = async (id: string): Promise<void> => {
  return getProvider().deleteUser(id);
};

export const saveMessage = async (input: UpsertMessageInput): Promise<MessageRecord> => {
  return getProvider().saveMessage(input);
};

export const getMessages = async (): Promise<MessageRecord[]> => {
  return getProvider().getMessages();
};

export const updateMessage = async (id: string, updates: Partial<UpsertMessageInput>): Promise<MessageRecord> => {
  return getProvider().updateMessage(id, updates);
};

export const deleteMessage = async (id: string): Promise<void> => {
  return getProvider().deleteMessage(id);
};

export const createSubscription = async (input: UpsertSubscriptionInput): Promise<SubscriptionRecord> => {
  return getProvider().createSubscription(input);
};

export const getSubscriptions = async (): Promise<SubscriptionRecord[]> => {
  return getProvider().getSubscriptions();
};

export const updateSubscription = async (
  id: string,
  updates: Partial<UpsertSubscriptionInput>
): Promise<SubscriptionRecord> => {
  return getProvider().updateSubscription(id, updates);
};

export const deleteSubscription = async (id: string): Promise<void> => {
  return getProvider().deleteSubscription(id);
};

export const exportData = async (): Promise<PortableDatabaseDump> => {
  return getProvider().exportAllData();
};

export const importData = async (
  dump: PortableDatabaseDump,
  options?: ImportOptions
): Promise<void> => {
  return getProvider().importAllData(dump, options);
};

export type {
  ImportOptions,
  MessageRecord,
  PortableDatabaseDump,
  SubscriptionRecord,
  UpsertMessageInput,
  UpsertSubscriptionInput,
  UpsertUserInput,
  UserRecord,
};
