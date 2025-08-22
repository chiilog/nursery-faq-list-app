/**
 * @description アナリティクス関連の定数定義
 * DRY原則に従い、マジックナンバーや文字列を一元管理
 */

export const ANALYTICS_CONSTANTS = {
  CONSENT_KEY: 'analytics-consent',
  CONSENT_VALUES: {
    ACCEPTED: 'accepted',
    DECLINED: 'declined',
  } as const,
  ENV_VARS: {
    GA4_MEASUREMENT_ID: 'VITE_GA4_MEASUREMENT_ID',
    CLARITY_PROJECT_ID: 'VITE_CLARITY_PROJECT_ID',
    ANALYTICS_ENABLED: 'VITE_ANALYTICS_ENABLED',
  } as const,
} as const;
