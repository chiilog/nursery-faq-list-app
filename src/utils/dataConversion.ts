/**
 * データ変換ユーティリティ
 * QuestionList型と新アーキテクチャ（Nursery/VisitSession）間の相互変換を提供
 */

import type {
  QuestionList,
  Nursery,
  VisitSession,
  CreateQuestionListInput,
  CreateNurseryInput,
  CreateVisitSessionInput,
} from '../types/data';
import { generatePrefixedId } from './id';

/**
 * QuestionListをNurseryとVisitSessionに変換
 */
export function convertQuestionListToNursery(questionList: QuestionList): {
  nursery: Nursery;
  visitSession: VisitSession;
} {
  // 保育園情報の作成
  const nursery: Nursery = {
    id: generatePrefixedId('nursery'),
    name: questionList.nurseryName || '未設定の保育園',
    visitSessions: [], // 後でvisitSessionを追加
    createdAt: questionList.createdAt,
    updatedAt: questionList.updatedAt,
  };

  // 見学セッションの作成
  const visitSession: VisitSession = {
    id: generatePrefixedId('session'),
    visitDate: questionList.visitDate || new Date(),
    status: 'planned',
    questions: questionList.questions.map((q) => ({
      ...q,
      // 既存のQuestionデータをそのまま使用
    })),
    sharedWith: questionList.sharedWith,
    createdAt: questionList.createdAt,
    updatedAt: questionList.updatedAt,
  };

  // テンプレートの場合は特別な処理
  if (questionList.isTemplate) {
    nursery.name = `テンプレート: ${questionList.title}`;
    visitSession.notes = `テンプレートから作成: ${questionList.title}`;
  }

  // NurseryにVisitSessionを追加
  nursery.visitSessions = [visitSession];

  return { nursery, visitSession };
}

/**
 * NurseryとVisitSessionをQuestionListに変換（後方互換性のため）
 */
export function convertNurseryToQuestionList(
  nursery: Nursery,
  visitSession: VisitSession
): QuestionList {
  return {
    id: visitSession.id, // VisitSessionのIDを使用
    title: nursery.name,
    nurseryName: nursery.name,
    visitDate: visitSession.visitDate || undefined,
    questions: visitSession.questions,
    sharedWith: visitSession.sharedWith,
    createdAt: visitSession.createdAt,
    updatedAt: visitSession.updatedAt,
    isTemplate: false, // 通常はfalse
  };
}

/**
 * CreateQuestionListInputをCreateNurseryInputとCreateVisitSessionInputに変換
 */
export function convertCreateQuestionListInput(
  input: CreateQuestionListInput
): {
  nurseryInput: CreateNurseryInput;
  visitSessionInput: CreateVisitSessionInput;
} {
  const nurseryInput: CreateNurseryInput = {
    name: input.nurseryName || input.title,
  };

  const visitSessionInput: CreateVisitSessionInput = {
    visitDate: input.visitDate || new Date(),
    questions: input.questions || [],
    sharedWith: input.sharedWith,
  };

  return { nurseryInput, visitSessionInput };
}

/**
 * 既存のQuestionListデータを新アーキテクチャに一括移行
 */
export function migrateAllQuestionLists(questionLists: QuestionList[]): {
  nurseries: Map<string, Nursery>;
  visitSessions: Map<string, VisitSession>;
  mapping: Map<string, { nurseryId: string; sessionId: string }>;
} {
  const nurseries = new Map<string, Nursery>();
  const visitSessions = new Map<string, VisitSession>();
  const mapping = new Map<string, { nurseryId: string; sessionId: string }>();

  // 保育園名でグループ化
  const nurseryGroups = new Map<string, QuestionList[]>();

  for (const questionList of questionLists) {
    const nurseryName = questionList.nurseryName || '未設定の保育園';
    if (!nurseryGroups.has(nurseryName)) {
      nurseryGroups.set(nurseryName, []);
    }
    nurseryGroups.get(nurseryName)!.push(questionList);
  }

  // 各グループをNurseryとVisitSessionに変換
  for (const [nurseryName, lists] of nurseryGroups) {
    // 保育園を作成（同じ名前の保育園は1つにまとめる）
    const nurseryId = generatePrefixedId('nursery');
    const sessionIds: string[] = [];

    const nursery: Nursery = {
      id: nurseryId,
      name: nurseryName,
      visitSessions: [], // 後でVisitSessionオブジェクトを設定
      createdAt: lists[0].createdAt, // 最初のリストの作成日時を使用
      updatedAt: new Date(),
    };

    // 各リストをVisitSessionに変換
    for (const list of lists) {
      const sessionId = generatePrefixedId('session');
      sessionIds.push(sessionId);

      const visitSession: VisitSession = {
        id: sessionId,
        visitDate: list.visitDate || new Date(),
        status: 'planned',
        questions: list.questions,
        sharedWith: list.sharedWith,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
      };

      visitSessions.set(sessionId, visitSession);
      mapping.set(list.id, { nurseryId, sessionId });

      // Nurseryの visitSessions配列にVisitSessionオブジェクトを追加
      nursery.visitSessions.push(visitSession);
    }

    nurseries.set(nurseryId, nursery);
  }

  return { nurseries, visitSessions, mapping };
}

/**
 * 単一のQuestionListを既存のNurseryに追加
 */
export function addQuestionListToNursery(
  questionList: QuestionList,
  nursery: Nursery
): {
  updatedNursery: Nursery;
  newVisitSession: VisitSession;
} {
  const visitSession: VisitSession = {
    id: generatePrefixedId('session'),
    visitDate: questionList.visitDate || new Date(),
    status: 'planned',
    questions: questionList.questions,
    sharedWith: questionList.sharedWith,
    createdAt: questionList.createdAt,
    updatedAt: questionList.updatedAt,
  };

  const updatedNursery: Nursery = {
    ...nursery,
    visitSessions: [...nursery.visitSessions, visitSession],
    updatedAt: new Date(),
  };

  return { updatedNursery, newVisitSession: visitSession };
}
