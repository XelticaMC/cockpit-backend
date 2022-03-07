import { getLogger } from 'log4js';
import { getConfig } from './config';

const logger = getLogger('Cockpit');
export default logger;

export const minecraftLogger = getLogger('Minecraft');

const lv = getConfig().logLevel;

logger.level = lv;
minecraftLogger.level = lv;
