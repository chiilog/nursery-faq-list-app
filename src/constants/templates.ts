/**
 * テンプレート関連の定数
 */

import type { QuestionList } from '../types/data';

/**
 * 空のテンプレート配列
 * readonlyとObject.freezeで不変性を保証
 */
export const EMPTY_TEMPLATES: readonly QuestionList[] = Object.freeze([]);
