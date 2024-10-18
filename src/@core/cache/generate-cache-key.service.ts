import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { GetUserRequest } from 'src/api/auth/decorator/get-user.decorator';

const regex = /{(.*?)}/g;

const requestSourceMap = {
  BODY: 'body',
  PARAMS: 'params',
  QUERY: 'query',
};

const CoreStrategies = {
  // ORGANIZATION: {
  //   getter: (request: any): string => {
  //     const organizationId = GetUserRequest(request, 'organizationId');

  //     if (!organizationId) {
  //       throw new InternalServerErrorException('Organization id not found');
  //     }

  //     return organizationId;
  //   },
  // },
  USER: {
    getter: (request: any): string => {
      const userId = GetUserRequest(request, 'id');

      if (!userId) {
        throw new InternalServerErrorException('User id not found');
      }

      return userId;
    },
  },
  METHOD: {
    getter: (request: any) => {
      return request.method;
    },
  },
  PATH: {
    getter: (request: any): string => {
      return request.route.path;
    },
  },
  URL: {
    getter: (request: any): string => {
      return request.url;
    },
  },
};
const CoreStrategiesKeys = Object.keys(CoreStrategies);

const EnhancedStrategies = {
  OBJECT: (strategy: string[], request: any): string => {
    const [from, key] = strategy;

    return request[requestSourceMap[from]][key];
  },
};
const EnhancedStrategiesKeys = Object.keys(EnhancedStrategies);

const defaultStrategy = '{URL}';

@Injectable()
export class GenerateCacheKeyService {
  generateCacheKey({
    request,
    strategy = defaultStrategy,
  }: {
    request: any;
    strategy?: string;
  }) {
    let cacheKey = 'CACHE_KEY::' + strategy;

    const strategies = strategy.match(regex);

    if (!strategies) {
      throw new BadRequestException('No Strategies found!');
    }

    strategies.forEach((strategy) => {
      strategy = strategy.replace('{', '').replace('}', '');

      const [strategyKey] = strategy.split('.');

      if (CoreStrategiesKeys.includes(strategyKey)) {
        const Strategy = CoreStrategies[strategyKey];

        const value = Strategy.getter(request);

        cacheKey = cacheKey.replace(`{${strategyKey}}`, value);
      } else if (EnhancedStrategiesKeys.includes(strategyKey)) {
        cacheKey = this.handleEnhancedStrategies(request, strategy, cacheKey);
      }
    });

    return cacheKey;
  }

  handleEnhancedStrategies(
    request: any,
    strategy: string,
    cacheKey: string,
  ): string {
    const [strategyKey, ...s] = strategy.split('.');

    const EnhancedStrategy = EnhancedStrategies[strategyKey];

    switch (strategyKey) {
      case 'OBJECT':
        const value = EnhancedStrategy(s, request);

        cacheKey = cacheKey.replace(`{${strategy}}`, value);
    }

    return cacheKey;
  }
}
