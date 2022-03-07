import { existsSync } from 'fs';
import { SERVER_JAR_PATH } from '../const';

export function initializeServerJar() {
  // jarが既に入っている = セットアップ済み
  if (existsSync(SERVER_JAR_PATH)) return;
}