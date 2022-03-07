import { writeFile } from 'fs/promises';
import { COCKPIT_JSON_PATH } from './const';
import rfdc from 'rfdc';
import immer from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { existsSync, readFileSync } from 'fs';

const deepClone = rfdc();

export interface ServerConfig {
  /** 種類。将来的にPaper以外にも対応させることを想定して定義している。 */
  type: 'paper',
  /** バージョン。 */
  version: string,
  /** ビルド番号。 */
  build: number,
}

export interface CockpitConfig {
  /** このサーバーのポート番号。 */
  port: number;

  /** ログレベル */
  logLevel: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

  /** 現在使用しているサーバーソフトウェアの情報。 */
  server: ServerConfig | null;
}

export const defaultConfig: CockpitConfig = {
  logLevel: 'debug',
  port: 4000,
  server: null,
};

let config = defaultConfig;

if (existsSync(COCKPIT_JSON_PATH)) {
  config = JSON.parse(readFileSync(COCKPIT_JSON_PATH, { encoding: 'utf-8' }));
}

export function getConfig() { return deepClone(config); }

export async function saveConfigAsync() {
  await writeFile(COCKPIT_JSON_PATH, JSON.stringify(config), { encoding: 'utf-8' });
}

export async function editConfigAsync(callback: (draft: WritableDraft<CockpitConfig>) => void) {
  config = immer(config, callback);
  await saveConfigAsync();
  return config;
}
