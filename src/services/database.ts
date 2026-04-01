import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot
} from "firebase/firestore";
import { db, firebaseEnabled } from "../firebase";

/**
 * Generic Database Service
 * Abstracts Firestore vs Mock Data
 */
export const dbService = {
  /**
   * Get all documents from a collection
   */
  async getAll<T>(collectionName: string, mockData: T[]): Promise<T[]> {
    if (firebaseEnabled && db) {
      try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
      } catch (error) {
        console.error(`Error getting collection ${collectionName}:`, error);
        return mockData;
      }
    }
    return mockData;
  },

  /**
   * Listen to real-time updates
   */
  subscribe<T>(collectionName: string, callback: (data: T[]) => void, mockData: T[]) {
    if (firebaseEnabled && db) {
      return onSnapshot(collection(db, collectionName), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
        callback(data);
      }, (error) => {
        console.error(`Subscription error for ${collectionName}:`, error);
        callback(mockData);
      });
    }
    callback(mockData);
    return () => {}; // No-op unsubscribe for mock mode
  },

  /**
   * Get a single document
   */
  async getOne<T>(collectionName: string, id: string, mockItem: T | null): Promise<T | null> {
    if (firebaseEnabled && db) {
      try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as T;
        }
      } catch (error) {
        console.error(`Error getting doc ${id} from ${collectionName}:`, error);
      }
    }
    return mockItem;
  },

  /**
   * Save or update a document
   */
  async save(collectionName: string, id: string, data: any) {
    if (firebaseEnabled && db) {
      try {
        await setDoc(doc(db, collectionName, id), data, { merge: true });
        return true;
      } catch (error) {
        console.error(`Error saving doc ${id} to ${collectionName}:`, error);
        return false;
      }
    }
    console.log(`[Mock DB] Saved to ${collectionName}/${id}:`, data);
    return true;
  },

  /**
   * Delete a document
   */
  async delete(collectionName: string, id: string) {
    if (firebaseEnabled && db) {
      try {
        await deleteDoc(doc(db, collectionName, id));
        return true;
      } catch (error) {
        console.error(`Error deleting doc ${id} from ${collectionName}:`, error);
        return false;
      }
    }
    console.log(`[Mock DB] Deleted ${collectionName}/${id}`);
    return true;
  }
};
