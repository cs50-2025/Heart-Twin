import { set, get, del } from 'idb-keyval';

// Wrapper for IndexedDB interactions for video storage
export const VideoDB = {
  saveVideo: async (id: string, blob: Blob): Promise<void> => {
    try {
      await set(id, blob);
    } catch (e) {
      console.error("Failed to save video to IndexedDB", e);
      throw e;
    }
  },

  getVideo: async (id: string): Promise<Blob | undefined> => {
    try {
      return await get(id);
    } catch (e) {
      console.error("Failed to get video from IndexedDB", e);
      return undefined;
    }
  },

  deleteVideo: async (id: string): Promise<void> => {
    try {
      await del(id);
    } catch (e) {
      console.error("Failed to delete video", e);
    }
  }
};
