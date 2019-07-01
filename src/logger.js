import pino from 'pino';

let logger = pino();

export function info(type, message, data) {
  logger.info({ type, message, ...data });
}

export function error(type, message, data) {
  logger.error({ type, message, ...data });
}

export function warn(type, message, data) {
  logger.warn({ type, message, ...data });
}

export default info;