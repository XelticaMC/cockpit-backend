import { BadRequestError, Body, Get, JsonController, OnUndefined, Post } from 'routing-controllers';
import { getConfig } from '../config';
import logger from '../logger';
import serverManager from '../services/server-manager';

@JsonController('/api/server')
export class ServerController {
  @Get()
  async getMeta() {
    return {
      server: getConfig().server,
      state: serverManager.state,
    };
  }
  @Get('/log')
  async getLog() {
    return serverManager.log;
  }
  @Post('/install')
  async install(@Body() body: Record<string, unknown>) {
    const type = typeof body.type === 'string' ? body.type : 'paper';
    const version = typeof body.version === 'string' ? body.version : null;
    const build = typeof body.build === 'number' ? body.build : null;
    const file = typeof body.file === 'string' ? body.file : null;

    if (type !== 'paper') throw new BadRequestError('invalid param: type');
    if (!version) throw new BadRequestError('missing param: version');
    if (!build) throw new BadRequestError('missing param: build');
    if (!file) throw new BadRequestError('missing param: file');

    serverManager.installAsync({
      type, version, build, file
    }).then(() => {
      logger.info('Installed the Minecraft server!');
    }).catch((e: unknown) => {
      logger.error(e);
    });
  }
  @Post('/start')
  async start() {
    serverManager.start();
  }
  @Post('/stop')
  async stop() {
    serverManager.stop();
  }
}
