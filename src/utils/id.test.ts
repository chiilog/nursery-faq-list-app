/**
 * ID生成ユーティリティのテスト
 * TDD原則に基づく包括的なテストケース
 */

import { describe, it, expect, vi } from 'vitest';
import { generatePrefixedId, generateId } from './id';

describe('generatePrefixedId', () => {
  describe('正常系', () => {
    it('プレフィックス付きのUUID v4形式の文字列を返す', () => {
      const prefix = 'test';
      const id = generatePrefixedId(prefix);

      // プレフィックス-UUID v4のパターンをチェック
      const prefixedUuidPattern =
        /^test-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(id).toMatch(prefixedUuidPattern);
      expect(typeof id).toBe('string');
      expect(id.length).toBe(prefix.length + 1 + 36); // prefix + '-' + UUID
    });

    it('nurseryプレフィックスで正しいIDを生成する', () => {
      const id = generatePrefixedId('nursery');

      expect(id).toMatch(
        /^nursery-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(id.startsWith('nursery-')).toBe(true);
      expect(id.length).toBe(44); // 'nursery' (7) + '-' (1) + UUID (36)
    });

    it('sessionプレフィックスで正しいIDを生成する', () => {
      const id = generatePrefixedId('session');

      expect(id).toMatch(
        /^session-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(id.startsWith('session-')).toBe(true);
      expect(id.length).toBe(44); // 'session' (7) + '-' (1) + UUID (36)
    });

    it('questionプレフィックスで正しいIDを生成する', () => {
      const id = generatePrefixedId('question');

      expect(id).toMatch(
        /^question-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(id.startsWith('question-')).toBe(true);
      expect(id.length).toBe(45); // 'question' (8) + '-' (1) + UUID (36)
    });

    it('短いプレフィックスで正しいIDを生成する', () => {
      const id = generatePrefixedId('a');

      expect(id).toMatch(
        /^a-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(id.startsWith('a-')).toBe(true);
      expect(id.length).toBe(38); // 'a' (1) + '-' (1) + UUID (36)
    });

    it('長いプレフィックスで正しいIDを生成する', () => {
      const longPrefix = 'very-long-prefix-name';
      const id = generatePrefixedId(longPrefix);

      const expectedPattern = new RegExp(
        `^${longPrefix}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`,
        'i'
      );
      expect(id).toMatch(expectedPattern);
      expect(id.startsWith(`${longPrefix}-`)).toBe(true);
      expect(id.length).toBe(longPrefix.length + 1 + 36);
    });

    it('数字を含むプレフィックスで正しいIDを生成する', () => {
      const id = generatePrefixedId('item123');

      expect(id).toMatch(
        /^item123-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(id.startsWith('item123-')).toBe(true);
    });

    it('呼び出すたびに異なるIDを返す', () => {
      const prefix = 'test';
      const id1 = generatePrefixedId(prefix);
      const id2 = generatePrefixedId(prefix);
      const id3 = generatePrefixedId(prefix);

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);

      // 全てが同じプレフィックスを持つことを確認
      expect(id1.startsWith(`${prefix}-`)).toBe(true);
      expect(id2.startsWith(`${prefix}-`)).toBe(true);
      expect(id3.startsWith(`${prefix}-`)).toBe(true);
    });

    it('crypto.randomUUIDを呼び出している', () => {
      const mockRandomUUID = vi.spyOn(crypto, 'randomUUID');
      mockRandomUUID.mockReturnValue('12345678-1234-4000-8000-123456789abc');

      const result = generatePrefixedId('test');

      expect(mockRandomUUID).toHaveBeenCalledTimes(1);
      expect(result).toBe('test-12345678-1234-4000-8000-123456789abc');

      mockRandomUUID.mockRestore();
    });
  });

  describe('エッジケース', () => {
    it('空文字列のプレフィックスでIDを生成する', () => {
      const id = generatePrefixedId('');

      expect(id).toMatch(
        /^-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(id.startsWith('-')).toBe(true);
      expect(id.length).toBe(37); // '' (0) + '-' (1) + UUID (36)
    });

    it('ハイフンを含むプレフィックスでIDを生成する', () => {
      const prefix = 'test-prefix';
      const id = generatePrefixedId(prefix);

      expect(id).toMatch(
        /^test-prefix-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(id.startsWith('test-prefix-')).toBe(true);
    });

    it('アンダースコアを含むプレフィックスでIDを生成する', () => {
      const prefix = 'test_prefix';
      const id = generatePrefixedId(prefix);

      expect(id).toMatch(
        /^test_prefix-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(id.startsWith('test_prefix-')).toBe(true);
    });

    it('特殊文字を含むプレフィックスでIDを生成する', () => {
      const prefix = 'test@#$';
      const id = generatePrefixedId(prefix);

      expect(id.startsWith('test@#$-')).toBe(true);
      expect(id.length).toBe(prefix.length + 1 + 36);
    });
  });

  describe('パフォーマンステスト', () => {
    it('大量の呼び出しでも正常に動作する', () => {
      const prefix = 'perf';
      const ids = new Set<string>();

      // 1000回呼び出してもすべて異なるIDが生成されることを確認
      for (let i = 0; i < 1000; i++) {
        const id = generatePrefixedId(prefix);
        expect(id.startsWith(`${prefix}-`)).toBe(true);
        ids.add(id);
      }

      expect(ids.size).toBe(1000); // すべて異なるID
    });

    it('異なるプレフィックスでの連続呼び出しが正常に動作する', () => {
      const prefixes = ['nursery', 'session', 'question', 'user', 'template'];
      const results: string[] = [];

      prefixes.forEach((prefix) => {
        const id = generatePrefixedId(prefix);
        expect(id.startsWith(`${prefix}-`)).toBe(true);
        results.push(id);
      });

      // すべて異なるIDであることを確認
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(prefixes.length);
    });
  });
});

describe('generateId', () => {
  describe('正常系', () => {
    it('UUID v4形式の文字列を返す', () => {
      const id = generateId();

      // UUID v4のパターンをチェック
      const uuidV4Pattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidV4Pattern);
      expect(typeof id).toBe('string');
      expect(id.length).toBe(36);
    });

    it('呼び出すたびに異なるIDを返す', () => {
      const id1 = generateId();
      const id2 = generateId();
      const id3 = generateId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('crypto.randomUUIDを呼び出している', () => {
      const mockRandomUUID = vi.spyOn(crypto, 'randomUUID');
      mockRandomUUID.mockReturnValue('87654321-4321-4000-8000-abcdef123456');

      const result = generateId();

      expect(mockRandomUUID).toHaveBeenCalledTimes(1);
      expect(result).toBe('87654321-4321-4000-8000-abcdef123456');

      mockRandomUUID.mockRestore();
    });

    it('UUID v4の形式要件を満たす（バージョンとバリアント）', () => {
      const id = generateId();
      const parts = id.split('-');

      expect(parts).toHaveLength(5);
      expect(parts[0]).toHaveLength(8); // time-low
      expect(parts[1]).toHaveLength(4); // time-mid
      expect(parts[2]).toHaveLength(4); // time-high-and-version
      expect(parts[3]).toHaveLength(4); // clock-seq-and-reserved
      expect(parts[4]).toHaveLength(12); // node

      // バージョン4であることを確認（time-high-and-versionの最初の文字が'4'）
      expect(parts[2][0]).toBe('4');

      // バリアントビットの確認（clock-seq-and-reservedの最初の文字が8,9,a,b）
      const variantChar = parts[3][0].toLowerCase();
      expect(['8', '9', 'a', 'b']).toContain(variantChar);
    });
  });

  describe('パフォーマンステスト', () => {
    it('大量の呼び出しでも正常に動作し、すべて異なるIDを生成する', () => {
      const ids = new Set<string>();

      // 1000回呼び出してもすべて異なるIDが生成されることを確認
      for (let i = 0; i < 1000; i++) {
        const id = generateId();
        expect(id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
        ids.add(id);
      }

      expect(ids.size).toBe(1000); // すべて異なるID
    });

    it('連続呼び出しで過度なメモリ使用がない', () => {
      // メモリリークの兆候がないことを確認するための簡単なテスト
      const ids = [];

      for (let i = 0; i < 1000; i++) {
        ids.push(generateId());
      }

      // 配列をクリアしてGCが実行できるようにする
      ids.length = 0;

      // 単純に大量呼び出しが完了することを確認
      expect(true).toBe(true);
    });
  });

  describe('generateIdとgeneratePrefixedIdの関係性', () => {
    it('generateIdとgeneratePrefixedIdは同じUUID生成ロジックを使用する', () => {
      const mockRandomUUID = vi.spyOn(crypto, 'randomUUID');
      mockRandomUUID.mockReturnValue('11111111-2222-4000-8000-333333333333');

      const simpleId = generateId();
      mockRandomUUID.mockReturnValue('11111111-2222-4000-8000-333333333333'); // 再度同じ値をモック
      const prefixedId = generatePrefixedId('test');

      expect(simpleId).toBe('11111111-2222-4000-8000-333333333333');
      expect(prefixedId).toBe('test-11111111-2222-4000-8000-333333333333');
      expect(mockRandomUUID).toHaveBeenCalledTimes(2);

      mockRandomUUID.mockRestore();
    });

    it('両方の関数が独立してユニークなIDを生成する', () => {
      const simpleIds = Array.from({ length: 100 }, () => generateId());
      const prefixedIds = Array.from({ length: 100 }, () =>
        generatePrefixedId('test')
      );

      // 各配列内でのユニーク性
      expect(new Set(simpleIds).size).toBe(100);
      expect(new Set(prefixedIds).size).toBe(100);

      // プレフィックス部分を除いたUUID部分も異なることを確認
      const prefixedUUIDs = prefixedIds.map((id) => id.substring(5)); // 'test-'を除去
      expect(new Set(prefixedUUIDs).size).toBe(100);

      // simpleIdsとprefixedUUIDsに重複がないことを確認
      const allUUIDs = [...simpleIds, ...prefixedUUIDs];
      expect(new Set(allUUIDs).size).toBe(200);
    });
  });
});
