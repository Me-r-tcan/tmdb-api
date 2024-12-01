import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { TMDB_API, API_CONFIG } from '../constants/constants';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TMDBService {
  private readonly apiKey: string;
  private readonly logger = new Logger(TMDBService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('TMDB_API_KEY');
  }

  async discoverMovies(): Promise<any[]> {
    this.logger.log('Fetching movies from TMDB discover endpoint...');
    const params = {
      api_key: this.apiKey,
      sort_by: 'release_date.asc',
      'vote_count.gte': 1500,
      'vote_average.gte': 8.4,
      with_watch_providers: 8,
      watch_region: 'TR',
    };

    return this.fetchPaginatedResults(
      `${TMDB_API.BASE_URL}${TMDB_API.DISCOVER_MOVIES}`,
      params,
    );
  }

  async getMovieDetails(movieId: number): Promise<any> {
    const url = `${TMDB_API.BASE_URL}${TMDB_API.MOVIE_DETAILS(movieId)}`;
    const params = { api_key: this.apiKey };

    const response = await this.retryOn429(() =>
      firstValueFrom(this.httpService.get(url, { params })),
    );

    return response.data;
  }

  private async fetchPaginatedResults(
    url: string,
    params: Record<string, any>,
  ): Promise<any[]> {
    const allResults = [];
    let page = 1;

    while (true) {
      const response = await this.retryOn429(() =>
        firstValueFrom(
          this.httpService.get(url, { params: { ...params, page } }),
        ),
      );

      const data = response.data;
      allResults.push(...data.results);

      if (page >= data.total_pages) {
        break;
      }

      page++;
    }

    return allResults;
  }

  private async retryOn429<T>(operation: () => Promise<T>): Promise<T> {
    while (true) {
      try {
        return await operation();
      } catch (error) {
        if (error.response?.status === 429) {
          this.logger.warn('Rate limit exceeded. Retrying after delay...');
          await this.sleep(API_CONFIG.RETRY_DELAY);
        } else {
          throw error;
        }
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
