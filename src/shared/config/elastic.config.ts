import { registerAs } from '@nestjs/config';
import { ElasticConfig } from './config.type';

export default registerAs<ElasticConfig>('elastic', () => ({
  host: process.env.ELASTIC_SEARCH_HOST || 'http://elasticsearch:9200',
  username: process.env.ELASTIC_SEARCH_USERNAME || 'kibana-user',
  password: process.env.ELASTIC_SEARCH_PWD || 'pwd123456',
}));
