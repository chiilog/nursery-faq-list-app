/**
 * @description 依存性注入コンテナ
 * SOLID原則の依存性逆転原則（DIP）を実現するためのコンテナ
 */

import type {
  TemplateRepository,
  TemplateApplicationService,
} from '../../types/template';
import { TemplateDataStore } from '../../services/template/templateRepository';
import * as TemplateApplication from '../../services/template/templateApplicationService';

/**
 * @description サービスコンテナのインターフェース
 * 各種サービスのインスタンス取得を提供
 */
export interface ServiceContainer {
  getTemplateRepository(): TemplateRepository;
  getTemplateApplicationService(): TemplateApplicationService;
}

/**
 * @description デフォルトのサービスコンテナ実装
 * シングルトンパターンでインスタンスを管理
 */
export class DefaultServiceContainer implements ServiceContainer {
  private templateRepository?: TemplateRepository;
  private templateApplicationService?: TemplateApplicationService;

  getTemplateRepository(): TemplateRepository {
    if (!this.templateRepository) {
      this.templateRepository = new TemplateDataStore();
    }
    return this.templateRepository;
  }

  getTemplateApplicationService(): TemplateApplicationService {
    if (!this.templateApplicationService) {
      this.templateApplicationService = {
        applyTemplateToNursery: TemplateApplication.applyTemplateToNursery,
        applyTemplateQuestions: TemplateApplication.applyTemplateQuestions,
      };
    }
    return this.templateApplicationService;
  }

  /**
   * @description テスト用にモックインスタンスを設定
   * @param repository - テスト用のリポジトリモック
   */
  setTemplateRepository(repository: TemplateRepository): void {
    this.templateRepository = repository;
  }

  /**
   * @description テスト用にモックインスタンスを設定
   * @param service - テスト用のアプリケーションサービスモック
   */
  setTemplateApplicationService(service: TemplateApplicationService): void {
    this.templateApplicationService = service;
  }
}

/**
 * @description グローバルなサービスコンテナインスタンス
 */
export const container = new DefaultServiceContainer();

/**
 * @description コンテナの便利なアクセス関数
 */
export const getTemplateRepository = () => container.getTemplateRepository();
export const getTemplateApplicationService = () =>
  container.getTemplateApplicationService();
