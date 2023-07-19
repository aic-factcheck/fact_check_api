export type AppConfig = {
  nodeEnv: string;
  name: string;
  workingDirectory: string;
  port: number;
  apiPrefix: string;
  fallbackLanguage: string;
  headerLanguage: string;
};

export type AuthConfig = {
  secret?: string;
  expires?: string;
};

export type MongoConfig = {
  uri?: string;
};

export type MailConfig = {
  port: number;
  host: string;
  user: string;
  password: string;
};

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  mongo: MongoConfig;
  mail: MailConfig;
};
