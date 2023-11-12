import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError, HttpStatusCode } from 'axios';
import { catchError, forkJoin, map, of } from 'rxjs';

import { GITHUB_API } from './constants';

@Injectable()
export class GithubService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getReleases() {
    const owner = this.configService.get('github.owner');
    const accessToken = this.configService.get('github.token');

    const urls = [
      {
        url: `${GITHUB_API}/repos/${owner}/${this.configService.get(
          'github.clientRepo',
        )}/releases/latest`,
        repoName: this.configService.get('github.clientRepo'),
      },
      {
        url: `${GITHUB_API}/repos/${owner}/${this.configService.get(
          'github.apiRepo',
        )}/releases/latest`,
        repoName: this.configService.get('github.apiRepo'),
      },
    ];

    const commonHeaders = {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
    };

    return forkJoin(
      urls.map(({ url, repoName }) =>
        this.httpService.get(url, { headers: { ...commonHeaders, repoName } }).pipe(
          catchError((error: AxiosError) => {
            if (error.response.status === HttpStatusCode.NotFound) {
              return of({ data: null });
            }

            throw new BadRequestException(error.response.data);
          }),
        ),
      ),
    ).pipe(
      map((response) =>
        response.reduce((result, res) => {
          const data = res.data;
          const repoName = (res as { config: { headers: unknown } }).config?.headers?.['repoName'];

          if (data) {
            result.push({
              body: data.body,
              htmlUrl: data.html_url,
              name: data.name,
              owner: { name: data.author.login, url: data.author.login.url },
              publishedAt: data.published_at,
              repoName,
            });
          }

          return result;
        }, []),
      ),
    );
  }
}
