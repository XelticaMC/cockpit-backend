import { BadRequestError, Body, Get, JsonController, Post } from 'routing-controllers';
import { getConfig } from '../config';
import logger from '../logger';
import serverManager from '../services/server-manager';

@JsonController('/api/server')
export class ServerController {
  @Get()
  getMeta() {
    return {
      server: getConfig().server,
      state: serverManager.state,
    };
  }
  @Get('/log')
  getLog() {
    return serverManager.log;
  }
  @Post('/install')
  install(@Body() body: Record<string, unknown>) {
    const type = typeof body.type === 'string' ? body.type : 'paper';
    const version = typeof body.version === 'string' ? body.version : null;
    const build = typeof body.build === 'number' ? body.build : null;
    const file = typeof body.file === 'string' ? body.file : null;

    if (type !== 'paper') throw new BadRequestError('param "type" must be a \'paper\'');
    if (!version) throw new BadRequestError('missing param: "version"');
    if (!build) throw new BadRequestError('missing param: "build"');
    if (!file) throw new BadRequestError('missing param: "file"');

    serverManager.installAsync({
      type, version, build, file
    }).then(() => {
      logger.info('Installed the Minecraft server!');
    }).catch((e: unknown) => {
      logger.error(e);
    });
  }
  @Post('/start')
  start() {
    serverManager.start();
  }
  @Post('/stop')
  stop() {
    serverManager.stop();
  }
  @Post('/command')
  command(@Body() body: Record<string, unknown>) {
    const command = body?.command;
    if (!command) throw new BadRequestError('missing param: "command"');
    if (typeof command !== 'string') throw new BadRequestError('param "command" must be a string');
    serverManager.sendCommand(command);
  }
}
