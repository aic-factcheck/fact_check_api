<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Fact checking API

[![users_service CI](https://github.com/aic-factcheck/fact_check_api/actions/workflows/ci_cd.yml/badge.svg)](https://github.com/aic-factcheck/fact_check_api/actions/workflows/ci_cd.yml)

## Features

- Nest.js framework with TypeScript([Nest](https://github.com/nestjs/nest))
- Uses Typescript strict null checks
- ES2017 latest features like Async/Await
- CORS enabled
- Uses [npm](https://www.npmjs.com/)
- Express + MongoDB ([Mongoose](http://mongoosejs.com/))
- Consistent coding styles with [Prettier](https://prettier.io/)
- [Docker](https://www.docker.com/) support
- Uses [helmet](https://docs.nestjs.com/security/helmet) to set some HTTP headers for security
- Load environment variables from .env files with [dotenv](https://github.com/rolodato/dotenv-safe)
- Request validation with [class-validator](https://github.com/typestack/class-validator)
- Linting with [eslint](http://eslint.org)
- Tests with [Jest](https://jestjs.io/docs/getting-started)
- Code coverage with [istanbul](https://istanbul.js.org)
- Git hooks with [husky](https://github.com/typicode/husky)
- Logging with [Pino & pino-http](https://github.com/iamolegga/nestjs-pino)
- Authentication and Authorization with [passport](http://passportjs.org)
- Automatic OpenAPI documentation generation with [Swagger](https://docs.nestjs.com/openapi/introduction)
- Continuous integration & CD support with Github Actions
- Monitoring with [ElasticSearch and Kibana](https://www.elastic.co/elastic-stack)

## Requirements

- [Node 16.13.1](https://nodejs.org/en/download/current/)
- [npm](https://www.npmjs.com/)

## Getting Started

#### Install dependencies:

```bash
$ npm install
```

#### Set environment variables:

```bash
$ cp .env.example .env
```

## Docker

#### Comfortable development with docker support:

```bash
# run containers locally
$ npm run docker:dev

# run container in production
npm run docker:prod

# run tests
npm run docker:test
```

## Running Locally

```bash
# development - Watch mode
$ npm run start

# Debug mode
$ npm run start:debug
```

## Running in Production

```bash
$ npm run start:prod
```

## Lint

```bash
# lint code with ESLint
$ npm run lint
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
