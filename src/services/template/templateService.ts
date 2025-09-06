/**
 * @description テンプレート関連のサービス統合レイヤー
 */

import type {
  TemplateRepository,
  TemplateApplicationService,
} from '../../types/template';
import {
  getTemplateRepository,
  getTemplateApplicationService,
} from '../../infrastructure/di/container';

/**
 * @description テンプレートデータサービスを作成するファクトリー関数
 * データアクセス層に特化した機能を提供
 * @param repository - 依存性注入されるリポジトリ
 * @returns データアクセス関数群
 */
export const createTemplateDataService = (
  repository: TemplateRepository = getTemplateRepository()
) => {
  return {
    async getSystemTemplates(signal?: AbortSignal) {
      return repository.getSystemTemplates(signal);
    },

    async getCustomTemplates() {
      return repository.getCustomTemplates();
    },

    async saveCustomTemplate(
      template: Parameters<TemplateRepository['saveCustomTemplate']>[0]
    ) {
      return repository.saveCustomTemplate(template);
    },
  };
};

/**
 * @description テンプレート適用サービスを作成するファクトリー関数
 * ビジネスロジック層に特化した機能を提供
 * @param applicationService - 依存性注入されるアプリケーションサービス
 * @returns ビジネスロジック関数群
 */
export const createTemplateApplicationService = (
  applicationService: TemplateApplicationService = getTemplateApplicationService()
) => {
  return {
    applyTemplateToNursery(
      template: Parameters<
        TemplateApplicationService['applyTemplateToNursery']
      >[0],
      nursery: Parameters<
        TemplateApplicationService['applyTemplateToNursery']
      >[1]
    ) {
      return applicationService.applyTemplateToNursery(template, nursery);
    },

    applyTemplateQuestions(
      template: Parameters<
        TemplateApplicationService['applyTemplateQuestions']
      >[0],
      existingQuestions: Parameters<
        TemplateApplicationService['applyTemplateQuestions']
      >[1]
    ) {
      return applicationService.applyTemplateQuestions(
        template,
        existingQuestions
      );
    },
  };
};

/**
 * @description 統合テンプレートサービスを作成するファクトリー関数（Facade パターン）
 * データアクセス層とアプリケーション層を統合
 * @param dataService - データサービス
 * @param applicationService - アプリケーションサービス
 * @returns 統合サービス関数群
 */
export const createTemplateService = (
  dataService: ReturnType<
    typeof createTemplateDataService
  > = createTemplateDataService(),
  applicationService: ReturnType<
    typeof createTemplateApplicationService
  > = createTemplateApplicationService()
) => {
  return {
    // データアクセス層のメソッド
    async getSystemTemplates(signal?: AbortSignal) {
      return dataService.getSystemTemplates(signal);
    },

    async getCustomTemplates() {
      return dataService.getCustomTemplates();
    },

    async saveCustomTemplate(
      template: Parameters<TemplateRepository['saveCustomTemplate']>[0]
    ) {
      return dataService.saveCustomTemplate(template);
    },

    // アプリケーション層のメソッド
    applyTemplateToNursery(
      template: Parameters<
        TemplateApplicationService['applyTemplateToNursery']
      >[0],
      nursery: Parameters<
        TemplateApplicationService['applyTemplateToNursery']
      >[1]
    ) {
      return applicationService.applyTemplateToNursery(template, nursery);
    },

    applyTemplateQuestions(
      template: Parameters<
        TemplateApplicationService['applyTemplateQuestions']
      >[0],
      existingQuestions: Parameters<
        TemplateApplicationService['applyTemplateQuestions']
      >[1]
    ) {
      return applicationService.applyTemplateQuestions(
        template,
        existingQuestions
      );
    },
  };
};

// applyTemplateById は templateApplicationService から取得
import * as TemplateApplication from './templateApplicationService';
export const applyTemplateById = TemplateApplication.applyTemplateById;

/**
 * @description リポジトリインスタンス取得（テストモックや依存性注入で使用）
 */
export { getTemplateRepository } from '../../infrastructure/di/container';

/**
 * @description テンプレートサービスの型定義
 */
export type TemplateService = ReturnType<typeof createTemplateService>;
export type TemplateDataService = ReturnType<typeof createTemplateDataService>;
export type TemplateApplicationServiceType = ReturnType<
  typeof createTemplateApplicationService
>;
