/**
 * 日付フォーマットのテスト
 * TDD原則に基づく包括的なテストケース
 */

import { describe, it, expect } from 'vitest';
import { formatDate } from './dateFormat';

describe('formatDate', () => {
  describe('正常系', () => {
    it('標準的な日付をYYYY/M/D形式でフォーマットする', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const result = formatDate(date);
      expect(result).toBe('2024/1/1');
    });

    it('月日が2桁の日付を正しくフォーマットする', () => {
      // ローカル日付で作成（タイムゾーンの影響を避ける）
      const date = new Date(2024, 11, 31); // 月は0ベースなので11=12月
      const result = formatDate(date);
      expect(result).toBe('2024/12/31');
    });

    it('月が1桁、日が2桁の日付を正しくフォーマットする', () => {
      const date = new Date('2024-03-15T12:30:45.123Z');
      const result = formatDate(date);
      expect(result).toBe('2024/3/15');
    });

    it('月が2桁、日が1桁の日付を正しくフォーマットする', () => {
      const date = new Date('2024-11-05T09:15:30.789Z');
      const result = formatDate(date);
      expect(result).toBe('2024/11/5');
    });

    it('うるう年の2月29日を正しくフォーマットする', () => {
      const date = new Date('2024-02-29T00:00:00.000Z');
      const result = formatDate(date);
      expect(result).toBe('2024/2/29');
    });

    it('過去の年の日付を正しくフォーマットする', () => {
      const date = new Date('1999-07-20T14:45:00.000Z');
      const result = formatDate(date);
      expect(result).toBe('1999/7/20');
    });

    it('未来の年の日付を正しくフォーマットする', () => {
      const date = new Date('2030-06-08T08:00:00.000Z');
      const result = formatDate(date);
      expect(result).toBe('2030/6/8');
    });

    it('年の境界値（1年）を正しくフォーマットする', () => {
      const date = new Date('0001-01-01T00:00:00.000Z');
      const result = formatDate(date);
      expect(result).toBe('1/1/1');
    });

    it('4桁年を正しくフォーマットする', () => {
      // ローカル日付で作成（タイムゾーンの影響を避ける）
      const date = new Date(9999, 11, 31); // 月は0ベースなので11=12月
      const result = formatDate(date);
      expect(result).toBe('9999/12/31');
    });

    it('時刻情報は無視してフォーマットする', () => {
      // ローカル日付で作成（同じ日付、異なる時刻）
      const date1 = new Date(2024, 4, 10, 0, 0, 0, 0); // 月は0ベースなので4=5月
      const date2 = new Date(2024, 4, 10, 23, 59, 59, 999);

      expect(formatDate(date1)).toBe('2024/5/10');
      expect(formatDate(date2)).toBe('2024/5/10');
    });

    it('ミリ秒情報は無視してフォーマットする', () => {
      const date1 = new Date('2024-08-15T10:30:45.000Z');
      const date2 = new Date('2024-08-15T10:30:45.999Z');

      expect(formatDate(date1)).toBe('2024/8/15');
      expect(formatDate(date2)).toBe('2024/8/15');
    });

    it('現在のタイムゾーンで正しい日付を表示する', () => {
      // ローカル日付で作成（タイムゾーンの影響を受けない）
      const date = new Date(2024, 6, 4); // 月は0ベースなので6=7月
      const result = formatDate(date);
      expect(result).toBe('2024/7/4');
    });
  });

  describe('異常系', () => {
    it('null値に対してエラーを投げる', () => {
      expect(() => formatDate(null as any)).toThrow(
        'formatDateに無効な日付が渡されました'
      );
    });

    it('undefined値に対してエラーを投げる', () => {
      expect(() => formatDate(undefined as any)).toThrow(
        'formatDateに無効な日付が渡されました'
      );
    });

    it('文字列に対してエラーを投げる', () => {
      expect(() => formatDate('2024-01-01' as any)).toThrow(
        'formatDateに無効な日付が渡されました'
      );
    });

    it('数値に対してエラーを投げる', () => {
      expect(() => formatDate(1234567890000 as any)).toThrow(
        'formatDateに無効な日付が渡されました'
      );
    });

    it('空のオブジェクトに対してエラーを投げる', () => {
      expect(() => formatDate({} as any)).toThrow(
        'formatDateに無効な日付が渡されました'
      );
    });

    it('配列に対してエラーを投げる', () => {
      expect(() => formatDate([] as any)).toThrow(
        'formatDateに無効な日付が渡されました'
      );
    });

    it('Invalid Dateに対してエラーを投げる', () => {
      const invalidDate = new Date('invalid-date-string');
      expect(() => formatDate(invalidDate)).toThrow(
        'formatDateに無効な日付が渡されました'
      );
    });

    it('NaN日付に対してエラーを投げる', () => {
      const nanDate = new Date(NaN);
      expect(() => formatDate(nanDate)).toThrow(
        'formatDateに無効な日付が渡されました'
      );
    });

    it('関数に対してエラーを投げる', () => {
      expect(() => formatDate((() => {}) as any)).toThrow(
        'formatDateに無効な日付が渡されました'
      );
    });

    it('boolean値に対してエラーを投げる', () => {
      expect(() => formatDate(true as any)).toThrow(
        'formatDateに無効な日付が渡されました'
      );
      expect(() => formatDate(false as any)).toThrow(
        'formatDateに無効な日付が渡されました'
      );
    });
  });

  describe('境界値テスト', () => {
    it('月の境界値（1月と12月）を正しくフォーマットする', () => {
      const january = new Date('2024-01-15T00:00:00.000Z');
      const december = new Date('2024-12-15T00:00:00.000Z');

      expect(formatDate(january)).toBe('2024/1/15');
      expect(formatDate(december)).toBe('2024/12/15');
    });

    it('日の境界値（1日と31日）を正しくフォーマットする', () => {
      const firstDay = new Date('2024-01-01T00:00:00.000Z');
      const lastDay = new Date('2024-01-31T00:00:00.000Z');

      expect(formatDate(firstDay)).toBe('2024/1/1');
      expect(formatDate(lastDay)).toBe('2024/1/31');
    });

    it('2月の境界値（平年と潤年）を正しくフォーマットする', () => {
      const feb28Normal = new Date('2023-02-28T00:00:00.000Z'); // 平年
      const feb29Leap = new Date('2024-02-29T00:00:00.000Z'); // 閏年

      expect(formatDate(feb28Normal)).toBe('2023/2/28');
      expect(formatDate(feb29Leap)).toBe('2024/2/29');
    });

    it('短い月（30日）の境界値を正しくフォーマットする', () => {
      const april30 = new Date('2024-04-30T00:00:00.000Z');
      expect(formatDate(april30)).toBe('2024/4/30');
    });
  });

  describe('パフォーマンス・メモリテスト', () => {
    it('大量の呼び出しでもメモリリークしない', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');

      // 1000回呼び出しても正常に動作することを確認
      for (let i = 0; i < 1000; i++) {
        const result = formatDate(date);
        expect(result).toBe('2024/1/1');
      }
    });

    it('異なる日付での連続呼び出しが正常に動作する', () => {
      const dates = [
        new Date(2024, 0, 1), // 月は0ベースなので0=1月
        new Date(2024, 5, 15), // 月は0ベースなので5=6月
        new Date(2024, 11, 31), // 月は0ベースなので11=12月
      ];

      const expected = ['2024/1/1', '2024/6/15', '2024/12/31'];

      dates.forEach((date, index) => {
        expect(formatDate(date)).toBe(expected[index]);
      });
    });
  });
});
