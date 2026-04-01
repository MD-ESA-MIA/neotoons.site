import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase';
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

const USERS_COLLECTION = 'users';
const MESSAGES_COLLECTION = 'messages';
const SUBSCRIPTIONS_COLLECTION = 'subscriptions';

const nowIso = () => new Date().toISOString();

const ensureFirestore = () => {
  if (!db) {
    throw new Error('Firebase is not configured. Please set valid Firebase credentials first.');
  }
  return db;
};

const withTimestamps = <T extends { id?: string }>(input: T) => ({
  id: input.id ?? crypto.randomUUID(),
  created_at: nowIso(),
  updated_at: nowIso(),
  ...input,
});

export class FirebaseProvider implements DatabaseProvider {
  async createUser(input: UpsertUserInput): Promise<UserRecord> {
    validateUserInput(input);
    const instance = ensureFirestore();

    const payload = withTimestamps({
      ...input,
      email: input.email.toLowerCase(),
      role: input.role ?? 'user',
      status: input.status ?? 'active',
    });

    await setDoc(doc(instance, USERS_COLLECTION, payload.id), payload);
    return payload as UserRecord;
  }

  async getUsers(): Promise<UserRecord[]> {
    const instance = ensureFirestore();
    const snapshot = await getDocs(collection(instance, USERS_COLLECTION));

    return snapshot.docs
      .map((item) => item.data() as UserRecord)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  async updateUser(id: string, updates: Partial<UpsertUserInput>): Promise<UserRecord> {
    const instance = ensureFirestore();
    const ref = doc(instance, USERS_COLLECTION, id);

    if (updates.email) {
      updates.email = updates.email.toLowerCase();
    }

    await updateDoc(ref, {
      ...updates,
      updated_at: nowIso(),
    });

    const list = await this.getUsers();
    const updated = list.find((item) => item.id === id);
    if (!updated) throw new Error('User not found after update');
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    const instance = ensureFirestore();
    await deleteDoc(doc(instance, USERS_COLLECTION, id));
  }

  async saveMessage(input: UpsertMessageInput): Promise<MessageRecord> {
    validateMessageInput(input);
    const instance = ensureFirestore();

    const payload = withTimestamps({
      ...input,
      email: input.email.toLowerCase(),
      status: input.status ?? 'new',
    });

    await setDoc(doc(instance, MESSAGES_COLLECTION, payload.id), payload);
    return payload as MessageRecord;
  }

  async getMessages(): Promise<MessageRecord[]> {
    const instance = ensureFirestore();
    const snapshot = await getDocs(collection(instance, MESSAGES_COLLECTION));

    return snapshot.docs
      .map((item) => item.data() as MessageRecord)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  async updateMessage(id: string, updates: Partial<UpsertMessageInput>): Promise<MessageRecord> {
    const instance = ensureFirestore();
    const ref = doc(instance, MESSAGES_COLLECTION, id);

    if (updates.email) {
      updates.email = updates.email.toLowerCase();
    }

    await updateDoc(ref, {
      ...updates,
      updated_at: nowIso(),
    });

    const list = await this.getMessages();
    const updated = list.find((item) => item.id === id);
    if (!updated) throw new Error('Message not found after update');
    return updated;
  }

  async deleteMessage(id: string): Promise<void> {
    const instance = ensureFirestore();
    await deleteDoc(doc(instance, MESSAGES_COLLECTION, id));
  }

  async createSubscription(input: UpsertSubscriptionInput): Promise<SubscriptionRecord> {
    validateSubscriptionInput(input);
    const instance = ensureFirestore();

    const payload = withTimestamps({
      ...input,
      started_at: input.started_at ?? nowIso(),
    });

    await setDoc(doc(instance, SUBSCRIPTIONS_COLLECTION, payload.id), payload);
    return payload as SubscriptionRecord;
  }

  async getSubscriptions(): Promise<SubscriptionRecord[]> {
    const instance = ensureFirestore();
    const snapshot = await getDocs(collection(instance, SUBSCRIPTIONS_COLLECTION));

    return snapshot.docs
      .map((item) => item.data() as SubscriptionRecord)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  async updateSubscription(id: string, updates: Partial<UpsertSubscriptionInput>): Promise<SubscriptionRecord> {
    const instance = ensureFirestore();
    const ref = doc(instance, SUBSCRIPTIONS_COLLECTION, id);

    await updateDoc(ref, {
      ...updates,
      updated_at: nowIso(),
    });

    const list = await this.getSubscriptions();
    const updated = list.find((item) => item.id === id);
    if (!updated) throw new Error('Subscription not found after update');
    return updated;
  }

  async deleteSubscription(id: string): Promise<void> {
    const instance = ensureFirestore();
    await deleteDoc(doc(instance, SUBSCRIPTIONS_COLLECTION, id));
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
    const instance = ensureFirestore();

    if (options.clearExisting) {
      const [userDocs, messageDocs, subscriptionDocs] = await Promise.all([
        getDocs(collection(instance, USERS_COLLECTION)),
        getDocs(collection(instance, MESSAGES_COLLECTION)),
        getDocs(collection(instance, SUBSCRIPTIONS_COLLECTION)),
      ]);

      const deleteBatch = writeBatch(instance);
      userDocs.docs.forEach((item) => deleteBatch.delete(item.ref));
      messageDocs.docs.forEach((item) => deleteBatch.delete(item.ref));
      subscriptionDocs.docs.forEach((item) => deleteBatch.delete(item.ref));
      await deleteBatch.commit();
    }

    const batch = writeBatch(instance);
    data.users.forEach((item) => batch.set(doc(instance, USERS_COLLECTION, item.id), item));
    data.messages.forEach((item) => batch.set(doc(instance, MESSAGES_COLLECTION, item.id), item));
    data.subscriptions.forEach((item) => batch.set(doc(instance, SUBSCRIPTIONS_COLLECTION, item.id), item));
    await batch.commit();
  }
}
