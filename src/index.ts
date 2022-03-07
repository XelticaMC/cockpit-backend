/**
 * Cockpit ENTRY POINT
 */

import 'reflect-metadata';

import { createKoaServer } from 'routing-controllers';
import Koa from 'koa';

import controllers from './controllers';
import { getConfig } from './config';
import logger from './logger';

logger.info('Starting Cockpit...');

const server = createKoaServer({
  controllers,
  classTransformer: false,
  defaultErrorHandler: true,
  defaults: {
    undefinedResultCode: 204,
  },
}) as Koa;

server.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  await next();
});

server.listen({
  port: getConfig().port,
}, () => {
  logger.info('Now listen in port ' + getConfig().port);
});
