/**
 * useNurseryStatus カスタムフックのテスト
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNurseryStatus } from './useNurseryStatus';
import type { VisitSession } from '../types/data';

describe('useNurseryStatus', () => {
  beforeEach(() => {
    // 2025年1月15日 12:00:00に固定（決定論的テスト）
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('見学日計算', () => {
    test('見学セッションが空の場合は「未定」を返す', () => {
      const { result } = renderHook(() => useNurseryStatus([]));

      expect(result.current.visitDate).toBe('未定');
    });

    test('未来の予定日を優先して表示', () => {
      const visitSessions: VisitSession[] = [
        {
          id: 'session1',
          visitDate: new Date('2025-01-20'),
          status: 'planned',
          questions: [],
          insights: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'session2',
          visitDate: new Date('2025-01-18'),
          status: 'planned',
          questions: [],
          insights: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const { result } = renderHook(() => useNurseryStatus(visitSessions));

      expect(result.current.visitDate).toBe('2025/1/18');
    });

    test('過去の日付には「(済)」マークが付く', () => {
      const visitSessions: VisitSession[] = [
        {
          id: 'session1',
          visitDate: new Date('2025-01-10'),
          status: 'completed',
          questions: [],
          insights: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const { result } = renderHook(() => useNurseryStatus(visitSessions));

      expect(result.current.visitDate).toBe('2025/1/10 (済)');
    });

    test('visitDateがnullの場合は「未定」を返す', () => {
      const visitSessions: VisitSession[] = [
        {
          id: 'session1',
          visitDate: null,
          status: 'planned',
          questions: [],
          insights: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const { result } = renderHook(() => useNurseryStatus(visitSessions));

      expect(result.current.visitDate).toBe('未定');
    });
  });

  describe('質問進捗計算', () => {
    test('質問がない場合は「0/0」を返す', () => {
      const visitSessions: VisitSession[] = [
        {
          id: 'session1',
          visitDate: new Date('2025-01-20'),
          status: 'planned',
          questions: [],
          insights: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const { result } = renderHook(() => useNurseryStatus(visitSessions));

      expect(result.current.questionProgress).toBe('0/0');
    });

    test('部分的に回答された場合はパーセンテージを表示', () => {
      const visitSessions: VisitSession[] = [
        {
          id: 'session1',
          visitDate: new Date('2025-01-20'),
          status: 'planned',
          questions: [
            {
              id: 'q1',
              text: '質問1',
              isAnswered: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'q2',
              text: '質問2',
              isAnswered: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          insights: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const { result } = renderHook(() => useNurseryStatus(visitSessions));

      expect(result.current.questionProgress).toBe('1/2 (50%)');
    });

    test('全て回答された場合は「✓完了」マークを表示', () => {
      const visitSessions: VisitSession[] = [
        {
          id: 'session1',
          visitDate: new Date('2025-01-20'),
          status: 'planned',
          questions: [
            {
              id: 'q1',
              text: '質問1',
              isAnswered: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'q2',
              text: '質問2',
              isAnswered: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          insights: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const { result } = renderHook(() => useNurseryStatus(visitSessions));

      expect(result.current.questionProgress).toBe('2/2 ✓完了');
    });

    test('複数セッションの質問が統合される', () => {
      const visitSessions: VisitSession[] = [
        {
          id: 'session1',
          visitDate: new Date('2025-01-20'),
          status: 'planned',
          questions: [
            {
              id: 'q1',
              text: '質問1',
              isAnswered: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          insights: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'session2',
          visitDate: new Date('2025-01-25'),
          status: 'planned',
          questions: [
            {
              id: 'q2',
              text: '質問2',
              isAnswered: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          insights: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const { result } = renderHook(() => useNurseryStatus(visitSessions));

      expect(result.current.questionProgress).toBe('1/2 (50%)');
    });
  });

  describe('気づきタグ収集', () => {
    test('気づきタグがない場合は空配列を返す', () => {
      const visitSessions: VisitSession[] = [
        {
          id: 'session1',
          visitDate: new Date('2025-01-20'),
          status: 'planned',
          questions: [],
          insights: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const { result } = renderHook(() => useNurseryStatus(visitSessions));

      expect(result.current.insights).toEqual([]);
    });

    test('気づきタグが重複排除される', () => {
      const visitSessions: VisitSession[] = [
        {
          id: 'session1',
          visitDate: new Date('2025-01-20'),
          status: 'planned',
          questions: [],
          insights: ['広い園庭', '先生が親切'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'session2',
          visitDate: new Date('2025-01-25'),
          status: 'planned',
          questions: [],
          insights: ['先生が親切', '設備が充実'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const { result } = renderHook(() => useNurseryStatus(visitSessions));

      expect(result.current.insights).toEqual([
        '広い園庭',
        '先生が親切',
        '設備が充実',
      ]);
    });

    test('最大3つまでのタグが返される', () => {
      const visitSessions: VisitSession[] = [
        {
          id: 'session1',
          visitDate: new Date('2025-01-20'),
          status: 'planned',
          questions: [],
          insights: [
            '広い園庭',
            '先生が親切',
            '設備が充実',
            '給食美味しそう',
            '運動場広い',
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const { result } = renderHook(() => useNurseryStatus(visitSessions));

      expect(result.current.insights).toHaveLength(3);
      expect(result.current.insights).toEqual([
        '広い園庭',
        '先生が親切',
        '設備が充実',
      ]);
    });

    test('空文字や空白のみのタグは除外される', () => {
      const visitSessions: VisitSession[] = [
        {
          id: 'session1',
          visitDate: new Date('2025-01-20'),
          status: 'planned',
          questions: [],
          insights: ['', '   ', '広い園庭', '\t\n'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const { result } = renderHook(() => useNurseryStatus(visitSessions));

      expect(result.current.insights).toEqual(['広い園庭']);
    });
  });

  describe('メモ化動作', () => {
    test('同じvisitSessionsで再計算されない', () => {
      const visitSessions: VisitSession[] = [
        {
          id: 'session1',
          visitDate: new Date('2025-01-20'),
          status: 'planned',
          questions: [],
          insights: ['広い園庭'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const { result, rerender } = renderHook(
        ({ sessions }) => useNurseryStatus(sessions),
        { initialProps: { sessions: visitSessions } }
      );

      const firstResult = result.current;

      // 同じオブジェクトで再レンダリング
      rerender({ sessions: visitSessions });

      // 参照が同じことを確認（メモ化されている）
      expect(result.current.visitDate).toBe(firstResult.visitDate);
      expect(result.current.questionProgress).toBe(
        firstResult.questionProgress
      );
      expect(result.current.insights).toBe(firstResult.insights);
    });
  });
});
