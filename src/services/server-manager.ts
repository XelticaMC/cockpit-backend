import { ChildProcess, spawn } from 'child_process';
import { createWriteStream, existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { get } from 'https';
import { editConfigAsync, ServerConfig } from '../config';
import { EULA_PATH, MINECRAFT_PATH, SERVER_JAR_FILE_NAME, SERVER_JAR_PATH } from '../const';
import logger from '../logger';
import { sendMessage } from '../server';

class ServerManager {
  public state: ServerState = 'STOPPED';
  public log: string[] = [];

  public start() {
    if (this.state !== 'STOPPED') throw new Error('Invalid state');
    logger.info('Starting Minecraft server...');
    this.setState('STARTING');
    this.log = [];
    sendMessage('moderator', 'server.log.clear');
    this.java = spawn('java', ['-jar', SERVER_JAR_FILE_NAME, 'nogui'], {
      cwd: MINECRAFT_PATH,
    });
    this.java.stdout?.on('data', (d: Buffer) => {
      // ロギング
      d.toString().trim().split('\n').forEach(log => {
        logger.info(log);
        this.log.push(log);
        sendMessage('moderator', 'server.log', log);

        // 起動判定
        if (this.donePattern.test(log)) {
          this.setState('RUNNING');
        }
      });
    });
    this.java.stderr?.on('data', (d: Buffer) => {
      logger.error(d.toString().trim());
    });
    this.java.on('close', () => {
      this.setState('STOPPED');
    });
  }

  public stop() {
    if (this.state !== 'RUNNING') throw new Error('Invalid state');
    this.setState('STOPPING');
    this.java?.stdin?.write('stop\n');
  }

  public sendCommand(command: string) {
    if (!this.java) throw new Error('Invalid state');
    if (this.state !== 'RUNNING') throw new Error('Invalid state');
    this.java.stdin?.write(command + '\n');
  }

  /**
   * サーバーをインストールします。
   */
  public async installAsync(props: ServerConfig & { file: string; }) {
    if (this.state !== 'STOPPED') throw new Error('Invalid state');
    this.setState('UPDATING');

    const url = `https://papermc.io/api/v2/projects/paper/versions/${props.version}/builds/${props.build}/downloads/${props.file}`;
    if (!existsSync(MINECRAFT_PATH)) {
      await mkdir(MINECRAFT_PATH);
    }
    const output = createWriteStream(SERVER_JAR_PATH, {
      flags: 'w',
    });

    const newServerConfig: ServerConfig = {
      type: props.type,
      version: props.version,
      build: props.build,
    };

    await Promise.all([
      // EULA 書き込み
      writeFile(EULA_PATH, 'eula=true'),
      // Cockpit Config 書き込み
      editConfigAsync(c => {
        c.server = newServerConfig;
      }),
      // サーバーJARのダウンロード
      new Promise<void>((res, rej) => {
        const httpGet = get(url, r => {
          r.pipe(output);
          r.on('end', () => {
            output.close();
            res();
          });
          sendMessage('moderator', 'server.update', newServerConfig);
        });
        httpGet.on('error', (e) => rej(e));
      }).finally(() => this.setState('STOPPED')),
    ]);
  }

  private setState(state: ServerState) {
    this.state = state;
    sendMessage('moderator', 'server.update.state', state);
  }

  private java?: ChildProcess;
  private donePattern = /Done \([0-9.s]+\)! For help, type "help"/;
}

const serverManager = new ServerManager();

export default serverManager;

export type ServerState = 'STOPPED' | 'UPDATING' | 'STARTING' | 'RUNNING' | 'STOPPING';
