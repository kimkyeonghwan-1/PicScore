import { create } from "zustand";
import {
  TimeAttackState,
  TimeAttackResult,
  ImageMetadata,
} from "../types/timeAttackTypes";

interface TimeAttackStore {
  gameState: TimeAttackState;
  result: TimeAttackResult;
  imageMetadata: ImageMetadata | null;
  setGameState: (state: Partial<TimeAttackState>) => void;
  setResult: (result: TimeAttackResult) => void;
  setImageMetadata: (metadata: ImageMetadata) => void;
  resetGameState: () => void;
}

const initialGameState: TimeAttackState = {
  currentStep: 1,
  timeLeft: 20,
  isTimerActive: false,
  challengeTopic: "",
  selectedImageFile: null,
};

const initialResult: TimeAttackResult = {
  score: 0,
  topicAccuracy: 0,
  analysisData: {
    composition: 0,
    lighting: 0,
    subject: 0,
    color: 0,
    creativity: 0,
  },
  image: null,
  topic: "",
  ranking: 0,
  feedback: [],
};

export const useTimeAttackStore = create<TimeAttackStore>((set) => ({
  gameState: initialGameState,
  result: initialResult,
  imageMetadata: null,
  setGameState: (state) =>
    set((prev) => ({
      gameState: { ...prev.gameState, ...state },
    })),
  setResult: (result) => set({ result }),
  setImageMetadata: (metadata) => set({ imageMetadata: metadata }),
  resetGameState: () =>
    set({
      gameState: initialGameState,
      result: initialResult,
      imageMetadata: null,
    }),
}));
