import {create} from 'zustand';

interface VideoStore {
  videoUri: string | null;
  setVideoUri: (uri: string | null) => void;
}

export const useVideoStore = create<VideoStore>((set) => ({
  videoUri: null,
  setVideoUri: (uri) => set({ videoUri: uri }),
}));
