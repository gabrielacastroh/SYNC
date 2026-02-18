import { produce } from 'immer';
import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type {
  Activity,
  ActivityId,
  BoardId,
  ActivityType,
  ActivityPayload,
} from '@/types';

export interface ActivityState {
  activities: Record<ActivityId, Activity>;
  addActivity: (
    boardId: BoardId,
    type: ActivityType,
    payload: ActivityPayload
  ) => Activity;
  getActivitiesForBoard: (boardId: BoardId) => Activity[];
  hydrate: (activities: Record<ActivityId, Activity>) => void;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: {},

  addActivity: (boardId: BoardId, type: ActivityType, payload: ActivityPayload) => {
    const id = uuid() as ActivityId;
    const activity: Activity = {
      id,
      boardId,
      type,
      payload,
      timestamp: Date.now(),
    };
    set(
      produce((state: ActivityState) => {
        state.activities[id] = activity;
      })
    );
    return activity;
  },

  getActivitiesForBoard: (boardId: BoardId) => {
    return Object.values(get().activities)
      .filter((a) => a.boardId === boardId)
      .sort((a, b) => b.timestamp - a.timestamp);
  },

  hydrate: (activities: Record<ActivityId, Activity>) => {
    set({ activities: activities ?? {} });
  },
}));
