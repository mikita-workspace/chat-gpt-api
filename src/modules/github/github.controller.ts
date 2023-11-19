import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { TTL_CONFIG_CACHE_MS } from 'src/common/constants';

import { GithubService } from './github.service';

@UseInterceptors(CacheInterceptor)
@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @CacheTTL(TTL_CONFIG_CACHE_MS)
  @Get('releases')
  async getReleases() {
    return this.githubService.getReleases();
  }
}
