export type BoardId = string;
export type ColumnId = string;
export type CardId = string;
export type ActivityId = string;
export type PresenceId = string;

export interface Board {
  id: BoardId;
  name: string;
  columnOrder: ColumnId[];
  createdAt: number;
  updatedAt: number;
}

export interface Column {
  id: ColumnId;
  boardId: BoardId;
  title: string;
  cardOrder: CardId[];
  collapsed: boolean;
  createdAt: number;
  updatedAt: number;
}

export type LabelColor =
  | 'gray'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink';

export interface CardLabel {
  id: string;
  text: string;
  color: LabelColor;
}

export interface Card {
  id: CardId;
  columnId: ColumnId;
  boardId: BoardId;
  title: string;
  description: string;
  labels: CardLabel[];
  assignedMemberIds: string[];
  dueDate: string | null;
  createdAt: number;
  updatedAt: number;
}

export type ActivityType =
  | 'card_created'
  | 'card_moved'
  | 'card_edited'
  | 'card_deleted'
  | 'column_renamed'
  | 'column_created'
  | 'column_deleted';

export interface ActivityPayload {
  cardId?: CardId;
  cardTitle?: string;
  columnId?: ColumnId;
  columnTitle?: string;
  fromColumnId?: ColumnId;
  toColumnId?: ColumnId;
  userId?: string;
  userName?: string;
}

export interface Activity {
  id: ActivityId;
  boardId: BoardId;
  type: ActivityType;
  payload: ActivityPayload;
  timestamp: number;
}

export interface PresenceUser {
  id: PresenceId;
  name: string;
  avatarColor: string;
  currentCardId: CardId | null;
  currentColumnId: ColumnId | null;
  lastSeen: number;
}

export interface UIState {
  theme: 'light' | 'dark' | 'system';
  commandPaletteOpen: boolean;
  activityPanelOpen: boolean;
  selectedCardId: CardId | null;
  editingCardId: CardId | null;
  modalOpen: boolean;
}

export interface MockMember {
  id: string;
  name: string;
  avatarColor: string;
}
