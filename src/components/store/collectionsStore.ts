// collectionsStore.ts
import { create } from 'zustand';

interface CollectionsState {
  collections: string[];
  setCollections: (collections: string[]) => void;
  addCollection: (collection: string) => void; // Add this
}

const useCollectionsStore = create<CollectionsState>((set) => ({
  collections: [],
  setCollections: (collections) => set({ collections }),
    addCollection: (collection) => {
      set((state) => ({ collections: [...state.collections, collection] }));
  },
}));

export default useCollectionsStore;