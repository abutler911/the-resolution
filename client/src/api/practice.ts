// Typed calls for the practice-tracking API.
//
// Every day-scoped endpoint is told the player's local date, so "today" means
// today at the piano rather than today at the server.

import { api } from "./client";
import { localDayKey } from "../lib/practice";
import type {
  FocusArea,
  Goal,
  GoalMetric,
  GoalPeriod,
  Hands,
  Insights,
  Piece,
  PieceHistoryPoint,
  PieceKind,
  PieceStatus,
  PracticeSession,
} from "../types";

export interface SegmentPayload {
  focusArea: FocusArea;
  pieceId: string | null;
  label: string | null;
  minutes: number;
  tempo: number | null;
  measureFrom: number | null;
  measureTo: number | null;
  hands: Hands | null;
  metronome: boolean;
  quality: number | null;
  notes: string | null;
}

export interface SessionPayload {
  date: string;
  mood: number | null;
  focus: number | null;
  notes: string | null;
  segments: SegmentPayload[];
}

export const listSessions = (params: {
  from?: string;
  to?: string;
  pieceId?: string;
  limit?: number;
} = {}) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null) query.set(key, String(value));
  }
  const suffix = query.toString();
  return api<{ sessions: PracticeSession[] }>(
    `/practice/sessions${suffix ? `?${suffix}` : ""}`,
  ).then((data) => data.sessions);
};

export const getSession = (id: string) =>
  api<{ session: PracticeSession }>(`/practice/sessions/${id}`).then((d) => d.session);

export const getToday = () =>
  api<{ date: string; sessions: PracticeSession[]; totalMinutes: number }>(
    `/practice/sessions/today?today=${localDayKey()}`,
  );

export const createSession = (payload: SessionPayload) =>
  api<{ session: PracticeSession }>("/practice/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((d) => d.session);

export const updateSession = (id: string, payload: SessionPayload) =>
  api<{ session: PracticeSession }>(`/practice/sessions/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }).then((d) => d.session);

export const deleteSession = (id: string) =>
  api<void>(`/practice/sessions/${id}`, { method: "DELETE" });

export interface PiecePayload {
  title: string;
  composer: string | null;
  kind: PieceKind;
  status: PieceStatus;
  keySignature: string | null;
  targetTempo: number | null;
  notes: string | null;
}

export const listPieces = (includeArchived = false) =>
  api<{ pieces: Piece[] }>(
    `/practice/pieces${includeArchived ? "?includeArchived=true" : ""}`,
  ).then((d) => d.pieces);

export const getPiece = (id: string) =>
  api<{ piece: Piece; history: PieceHistoryPoint[] }>(`/practice/pieces/${id}`);

export const createPiece = (payload: PiecePayload) =>
  api<{ piece: Piece }>("/practice/pieces", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((d) => d.piece);

export const updatePiece = (id: string, payload: Partial<PiecePayload> & { archived?: boolean }) =>
  api<{ piece: Piece }>(`/practice/pieces/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }).then((d) => d.piece);

export const deletePiece = (id: string) =>
  api<void>(`/practice/pieces/${id}`, { method: "DELETE" });

export interface GoalPayload {
  title: string;
  metric: GoalMetric;
  period: GoalPeriod;
  target: number;
  focusArea: FocusArea | null;
  pieceId: string | null;
  endDate: string | null;
}

export const listGoals = (includeArchived = false) =>
  api<{ goals: Goal[] }>(
    `/practice/goals?today=${localDayKey()}${includeArchived ? "&includeArchived=true" : ""}`,
  ).then((d) => d.goals);

export const createGoal = (payload: GoalPayload) =>
  api<{ goals: Goal[] }>("/practice/goals", {
    method: "POST",
    body: JSON.stringify({ ...payload, startDate: localDayKey(), today: localDayKey() }),
  }).then((d) => d.goals);

export const updateGoal = (
  id: string,
  payload: { title?: string; target?: number; endDate?: string | null; archived?: boolean },
) =>
  api<{ goals: Goal[] }>(`/practice/goals/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ ...payload, today: localDayKey() }),
  }).then((d) => d.goals);

export const deleteGoal = (id: string) =>
  api<void>(`/practice/goals/${id}`, { method: "DELETE" });

export const getInsights = (days = 90) =>
  api<Insights>(`/practice/insights?days=${days}&today=${localDayKey()}`);
