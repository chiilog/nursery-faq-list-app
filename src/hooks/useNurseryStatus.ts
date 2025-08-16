/**
 * 保育園の状態情報を管理するカスタムフック
 * 見学日、質問進捗、気づきタグの計算ロジックを統合管理
 */

import { useMemo } from 'react';
import type { VisitSession } from '../types/entities';
import { formatDate } from '../utils/dateFormat';

/**
 * 保育園の状態情報
 */
export interface NurseryStatus {
  /** 見学予定日または最新見学日のフォーマット済み文字列 */
  visitDate: string;
  /** 質問進捗の表示文字列 */
  questionProgress: string;
  /** 気づきタグ一覧（最大3つ、重複排除済み） */
  insights: string[];
}

/**
 * 見学セッションから最新の見学予定日を取得
 * 優先順位: 1. 未来の予定日（昇順で最初） 2. 最新の日付（過去含む）
 */
const getLatestVisitDate = (visitSessions: VisitSession[]): string => {
  if (visitSessions.length === 0) {
    return '未定';
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0); // 日付のみで比較

  // visitDateがnullまたは未設定のセッションは「未定」として扱う
  const realSessions = visitSessions.filter(
    (session) => session.visitDate !== null
  );

  if (realSessions.length === 0) {
    return '未定';
  }

  // 未来の予定日を優先（最も近い日付）
  const futureSessions = realSessions
    .filter((session) => {
      if (!session.visitDate) return false;
      const sessionDate = new Date(session.visitDate);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate >= now && session.status === 'planned';
    })
    .sort((a, b) => {
      // フィルタリング済みなのでvisitDateは必ず存在するが、型安全性のためチェック
      if (!a.visitDate || !b.visitDate) return 0;
      return a.visitDate.getTime() - b.visitDate.getTime();
    });

  if (futureSessions.length > 0 && futureSessions[0].visitDate) {
    return formatDate(futureSessions[0].visitDate);
  }

  // 未来の予定がない場合は最新の日付（過去の場合は「(済)」を追加）
  const latestSession = realSessions.sort((a, b) => {
    // フィルタリング済みなのでvisitDateは必ず存在するが、型安全性のためチェック
    if (!a.visitDate || !b.visitDate) return 0;
    return b.visitDate.getTime() - a.visitDate.getTime();
  })[0];

  if (!latestSession?.visitDate) {
    return '未定';
  }

  const latestDate = new Date(latestSession.visitDate);
  latestDate.setHours(0, 0, 0, 0);

  if (latestDate < now) {
    return `${formatDate(latestSession.visitDate)} (済)`;
  }

  return formatDate(latestSession.visitDate);
};

/**
 * 全見学セッションの質問進捗を計算
 * 改善: パーセンテージと完了状態を表示
 */
const getQuestionProgress = (visitSessions: VisitSession[]): string => {
  const allQuestions = visitSessions.flatMap((session) => session.questions);
  const answeredQuestions = allQuestions.filter(
    (question) => question.isAnswered
  );

  const answered = answeredQuestions.length;
  const total = allQuestions.length;

  if (total === 0) {
    return '0/0';
  }

  const percentage = Math.round((answered / total) * 100);

  // 全て完了している場合
  if (answered === total) {
    return `${answered}/${total} ✓完了`;
  }

  // 部分的に完了している場合、パーセンテージを表示
  return `${answered}/${total} (${percentage}%)`;
};

/**
 * 全見学セッションから気づきタグを収集
 * 重複排除して最大3つまで表示用に返す
 */
const getAllInsights = (visitSessions: VisitSession[]): string[] => {
  const allInsights = visitSessions
    .flatMap((session) => session.insights || [])
    .filter((insight) => insight.trim() !== '');

  // 重複排除
  const uniqueInsights = Array.from(new Set(allInsights));

  // 最大3つまで
  return uniqueInsights.slice(0, 3);
};

/**
 * 保育園の状態情報を計算するカスタムフック
 *
 * @param visitSessions - 見学セッション一覧
 * @returns 保育園の状態情報（見学日、質問進捗、気づきタグ）
 *
 * @example
 * ```tsx
 * const { visitDate, questionProgress, insights } = useNurseryStatus(nursery.visitSessions);
 *
 * return (
 *   <div>
 *     <p>見学日: {visitDate}</p>
 *     <p>質問進捗: {questionProgress}</p>
 *     {insights.map(insight => <Tag key={insight}>{insight}</Tag>)}
 *   </div>
 * );
 * ```
 */
export const useNurseryStatus = (
  visitSessions: VisitSession[]
): NurseryStatus => {
  const visitDate = useMemo(
    () => getLatestVisitDate(visitSessions),
    [visitSessions]
  );

  const questionProgress = useMemo(
    () => getQuestionProgress(visitSessions),
    [visitSessions]
  );

  const insights = useMemo(
    () => getAllInsights(visitSessions),
    [visitSessions]
  );

  return {
    visitDate,
    questionProgress,
    insights,
  };
};
