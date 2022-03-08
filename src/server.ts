import { createKoaServer } from 'routing-controllers';
import Koa from 'koa';
import * as websocket from 'websocket';

import controllers from './controllers';
import { getConfig } from './config';
import logger from './logger';

logger.info('Starting Cockpit...');

const app = createKoaServer({
  controllers,
  classTransformer: false,
  defaultErrorHandler: true,
  defaults: {
    undefinedResultCode: 204,
  },
}) as Koa;

app.use((ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  return next();
});

export const server = app.listen({
  port: getConfig().port,
}, () => {
  logger.info('Now listen in port ' + getConfig().port);
});

export const ws = new websocket.server({
  httpServer: server,
});

const connList = {
  'moderator': [] as websocket.connection[],
};

ws.on('request', req => {
  // TODO: アクセスコントロール
  const conn = req.accept();
  connList.moderator.push(conn);
  conn.once('close', () => {
    connList.moderator = connList.moderator.filter(c => c !== conn);
  });

  conn.on('message', data => {
    if (data.type === 'utf8' && data.utf8Data === 'ping') {
      conn.send('pong');
    }
  });
});

export const sendMessage = (role: keyof typeof connList, type: MessageType, body?: unknown) => {
  _sendRawMessage(role, {
    type,
    body,
    ts: new Date(),
  });
};

export const _sendRawMessage = (role: keyof typeof connList, data: string | Record<string, unknown>) => {
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  connList[role].forEach(c => c.send(payload));
};

export type MessageType =
  | 'server.log.clear'
  | 'server.log'
  | 'server.update'
  | 'server.update.state'
  ;