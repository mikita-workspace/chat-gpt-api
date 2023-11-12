import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, UseFilters, UseInterceptors } from '@nestjs/common';
import { TTL_CONFIG_CACHE_MS } from 'src/common/constants';
import { HttpExceptionFilter } from 'src/common/exceptions';

import { GithubService } from './github.service';

@UseFilters(new HttpExceptionFilter())
@UseInterceptors(CacheInterceptor)
@Controller('api/github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @CacheTTL(TTL_CONFIG_CACHE_MS)
  @Get('releases')
  async getReleases() {
    return this.githubService.getReleases();
  }
}
