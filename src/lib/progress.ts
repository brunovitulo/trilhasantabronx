import type { Topic } from "@/data/topics";
import { PASSING_SCORE } from "@/data/topics";

export type ProgressRow = {
  subtask_id: string;
  completed: boolean;
  score: number | null;
};

export type TopicStatus = "locked" | "available" | "in_progress" | "completed" | "empty";

export function getSubtaskState(
  subtaskId: string,
  rows: ProgressRow[],
): { completed: boolean; score: number | null } {
  const row = rows.find((r) => r.subtask_id === subtaskId);
  if (!row) return { completed: false, score: null };
  return { completed: row.completed, score: row.score };
}

export function isTopicComplete(topic: Topic, rows: ProgressRow[]): boolean {
  if (topic.subtasks.length === 0) return false;
  return topic.subtasks.every((s) => {
    const { completed, score } = getSubtaskState(s.id, rows);
    if (!completed) return false;
    if (s.kind === "evaluation") {
      const min = s.passingScore ?? PASSING_SCORE;
      return (score ?? 0) >= min;
    }
    return true;
  });
}

export function computeTopicStatuses(
  topics: Topic[],
  rows: ProgressRow[],
): Record<string, TopicStatus> {
  const result: Record<string, TopicStatus> = {};
  let previousCompleted = true; // first topic always available
  for (const topic of topics) {
    if (topic.subtasks.length === 0) {
      result[topic.id] = previousCompleted ? "empty" : "locked";
      previousCompleted = false; // empty topics block further progression
      continue;
    }
    if (!previousCompleted) {
      result[topic.id] = "locked";
      continue;
    }
    const done = isTopicComplete(topic, rows);
    if (done) {
      result[topic.id] = "completed";
      previousCompleted = true;
    } else {
      const anyCompleted = topic.subtasks.some(
        (s) => getSubtaskState(s.id, rows).completed,
      );
      result[topic.id] = anyCompleted ? "in_progress" : "available";
      previousCompleted = false;
    }
  }
  return result;
}

export function topicProgressPercent(topic: Topic, rows: ProgressRow[]): number {
  if (topic.subtasks.length === 0) return 0;
  const done = topic.subtasks.filter((s) => {
    const { completed, score } = getSubtaskState(s.id, rows);
    if (!completed) return false;
    if (s.kind === "evaluation") {
      const min = s.passingScore ?? PASSING_SCORE;
      return (score ?? 0) >= min;
    }
    return true;
  }).length;
  return Math.round((done / topic.subtasks.length) * 100);
}
