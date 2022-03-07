export const MINECRAFT_PATH = './minecraft';

export const SERVER_JAR_FILE_NAME = 'server.jar';

export const EULA_FILE_NAME = 'eula.txt';

export const COCKPIT_JSON_FILE_NAME = 'cockpit.json';

export const SERVER_JAR_PATH = `${MINECRAFT_PATH}/${SERVER_JAR_FILE_NAME}` as const;

export const EULA_PATH = `${MINECRAFT_PATH}/${EULA_FILE_NAME}` as const;

export const COCKPIT_JSON_PATH =  `${MINECRAFT_PATH}/${COCKPIT_JSON_FILE_NAME}` as const;
