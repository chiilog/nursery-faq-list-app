/**
 * UI テーマ定数
 * カラースキームとサイズの統一管理
 */

/**
 * UI カラースキーム定数
 */
export const UI_COLORS = {
  /** 気づきタグのカラー */
  INSIGHT_TAG: 'gray',
  /** プライマリカラー */
  PRIMARY: 'blue',
  /** 危険操作カラー */
  DANGER: 'red',
  /** 成功カラー */
  SUCCESS: 'green',
  /** 警告カラー */
  WARNING: 'orange',
} as const;

/**
 * UI サイズ定数
 */
export const UI_SIZES = {
  /** 小サイズ */
  SMALL: 'sm',
  /** 中サイズ */
  MEDIUM: 'md',
  /** 大サイズ */
  LARGE: 'lg',
} as const;

/**
 * カラー値の型定義
 */
export type UIColor = (typeof UI_COLORS)[keyof typeof UI_COLORS];

/**
 * サイズ値の型定義
 */
export type UISize = (typeof UI_SIZES)[keyof typeof UI_SIZES];
