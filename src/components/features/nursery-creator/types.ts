/**
 * NurseryCreator関連の型定義
 */

export interface FormData {
  name: string;
  visitDate: Date | null;
}

export interface ValidationErrors {
  name?: string;
  visitDate?: string;
}

export interface NurseryCreatorProps {
  onCancel: () => void;
}
