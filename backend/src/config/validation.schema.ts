import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'staging', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  USER_POOL_ID: Joi.string().required(),
  USER_POOL_CLIENT_ID: Joi.string().required(),
  AWS_REGION: Joi.string().default('us-east-1'),

  SENTRY_DSN: Joi.string().uri().optional().allow(''),
  CORS_ORIGIN: Joi.string().default('http://localhost:4200'),
});
