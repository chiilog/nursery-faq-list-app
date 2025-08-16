/**
 * ヘッダー関連の型定義
 */

import React from 'react';

export interface HeaderButton {
  icon?: React.ReactElement;
  text?: string;
  onClick?: () => void;
  variant?: 'ghost' | 'solid' | 'outline';
  'aria-label'?: string;
  hidden?: boolean;
}

export type HeaderVariant = 'centered' | 'with-buttons';
