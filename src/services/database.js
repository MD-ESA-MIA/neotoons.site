import { createClient } from '@supabase/supabase-js';
let supabaseClient = null;
const getSupabaseClient = () => {
    if (supabaseClient) {
        return supabaseClient;
    }
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
        return null;
    }
    supabaseClient = createClient(url, anonKey);
    return supabaseClient;
};
/**
 * Generic Database Service
 * Abstracts Firestore vs Mock Data
 */
export const dbService = {
    /**
     * Get all documents from a collection
     */
    async getAll(collectionName, mockData) {
        const client = getSupabaseClient();
        if (!client) {
            return mockData;
        }
        try {
            const { data, error } = await client.from(collectionName).select('*');
            if (error)
                throw error;
            return (data ?? []);
        }
        catch (error) {
            console.error(`Error getting collection ${collectionName}:`, error);
            return mockData;
        }
    },
    /**
     * Listen to real-time updates
     */
    subscribe(collectionName, callback, mockData) {
        dbService.getAll(collectionName, mockData)
            .then((data) => callback(data))
            .catch((error) => {
            console.error(`Subscription bootstrap error for ${collectionName}:`, error);
            callback(mockData);
        });
        // Polling/realtime can be introduced later if needed.
        return () => { };
    },
    /**
     * Get a single document
     */
    async getOne(collectionName, id, mockItem) {
        const client = getSupabaseClient();
        if (!client) {
            return mockItem;
        }
        try {
            const { data, error } = await client.from(collectionName).select('*').eq('id', id).maybeSingle();
            if (error)
                throw error;
            return data ?? mockItem;
        }
        catch (error) {
            console.error(`Error getting doc ${id} from ${collectionName}:`, error);
        }
        return mockItem;
    },
    /**
     * Save or update a document
     */
    async save(collectionName, id, data) {
        const client = getSupabaseClient();
        if (!client) {
            console.log(`[Mock DB] Saved to ${collectionName}/${id}:`, data);
            return true;
        }
        try {
            const payload = {
                id,
                ...data,
                updated_at: new Date().toISOString(),
            };
            const { error } = await client.from(collectionName).upsert(payload);
            if (error)
                throw error;
            return true;
        }
        catch (error) {
            console.error(`Error saving doc ${id} to ${collectionName}:`, error);
            return false;
        }
    },
    /**
     * Delete a document
     */
    async delete(collectionName, id) {
        const client = getSupabaseClient();
        if (!client) {
            console.log(`[Mock DB] Deleted ${collectionName}/${id}`);
            return true;
        }
        try {
            const { error } = await client.from(collectionName).delete().eq('id', id);
            if (error)
                throw error;
            return true;
        }
        catch (error) {
            console.error(`Error deleting doc ${id} from ${collectionName}:`, error);
            return false;
        }
    }
};
