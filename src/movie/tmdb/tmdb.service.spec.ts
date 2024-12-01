import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { TMDBService } from './tmdb.service';
import { TMDB_API } from '../constants/constants';
import { of } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

function createMockAxiosResponse<T>(data: T): AxiosResponse<T, any> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {
      headers: {},
    } as InternalAxiosRequestConfig<any>,
  };
}

describe('TMDBService', () => {
  let service: TMDBService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TMDBService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('TEST_API_KEY'),
          },
        },
      ],
    }).compile();

    service = module.get<TMDBService>(TMDBService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('discoverMovies', () => {
    it('should fetch movies from the TMDB discover endpoint', async () => {
      const mockResponse = createMockAxiosResponse({
        results: [{ id: 1, title: 'Movie 1' }],
        total_pages: 1,
      });

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      const movies = await service.discoverMovies();

      expect(httpService.get).toHaveBeenCalledWith(
        `${TMDB_API.BASE_URL}${TMDB_API.DISCOVER_MOVIES}`,
        {
          params: {
            api_key: 'TEST_API_KEY',
            sort_by: 'release_date.asc',
            'vote_count.gte': 1500,
            'vote_average.gte': 8.4,
            with_watch_providers: 8,
            watch_region: 'TR',
            page: 1,
          },
        },
      );
      expect(movies).toEqual(mockResponse.data.results);
    });
  });

  describe('getMovieDetails', () => {
    it('should fetch movie details by ID', async () => {
      const mockResponse = createMockAxiosResponse({
        id: 1,
        title: 'Movie 1',
        overview: 'A great movie',
      });

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      const details = await service.getMovieDetails(1);

      expect(httpService.get).toHaveBeenCalledWith(
        `${TMDB_API.BASE_URL}${TMDB_API.MOVIE_DETAILS(1)}`,
        { params: { api_key: 'TEST_API_KEY' } },
      );
      expect(details).toEqual(mockResponse.data);
    });
  });

  describe('fetchPaginatedResults', () => {
    it('should fetch paginated results', async () => {
      const mockPage1 = createMockAxiosResponse({
        results: [{ id: 1, title: 'Movie 1' }],
        total_pages: 2,
      });

      const mockPage2 = createMockAxiosResponse({
        results: [{ id: 2, title: 'Movie 2' }],
        total_pages: 2,
      });

      jest
        .spyOn(httpService, 'get')
        .mockReturnValueOnce(of(mockPage1))
        .mockReturnValueOnce(of(mockPage2));

      const results = await (service as any).fetchPaginatedResults(
        `${TMDB_API.BASE_URL}${TMDB_API.DISCOVER_MOVIES}`,
        { api_key: 'TEST_API_KEY' },
      );

      expect(results).toEqual([
        { id: 1, title: 'Movie 1' },
        { id: 2, title: 'Movie 2' },
      ]);
      expect(httpService.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('retryOn429', () => {
    it('should retry on 429 status code', async () => {
      jest
        .spyOn(service as any, 'sleep')
        .mockImplementation(() => Promise.resolve());

      const mockResponse = createMockAxiosResponse('Success');
      let callCount = 0;

      const operation = jest.fn(() => {
        if (callCount === 0) {
          callCount++;
          return Promise.reject({ response: { status: 429 } });
        }
        return Promise.resolve(mockResponse);
      });

      const result = await (service as any).retryOn429(operation);

      expect(result).toEqual(mockResponse);
      expect(callCount).toBe(1);
    });

    it('should throw error for non-429 errors', async () => {
      const operation = jest.fn(() =>
        Promise.reject({ response: { status: 500 } }),
      );

      await expect((service as any).retryOn429(operation)).rejects.toEqual({
        response: { status: 500 },
      });
    });
  });

  describe('sleep', () => {
    it('should delay for the specified time', async () => {
      jest.useFakeTimers();

      const sleepPromise = (service as any).sleep(1000);
      jest.advanceTimersByTime(1000);

      await expect(sleepPromise).resolves.toBeUndefined();
    });
  });
});
