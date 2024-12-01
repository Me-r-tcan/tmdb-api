import { Test, TestingModule } from '@nestjs/testing';
import { CommonService } from './common.service';

describe('CommonService', () => {
  let service: CommonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommonService],
    }).compile();

    service = module.get<CommonService>(CommonService);
  });

  describe('generateMongoFilters', () => {
    it('should generate filters for exact fields', () => {
      const queryDto = { id: 1, name: 'Test' };
      const options = { exactFields: ['id'] as (keyof typeof queryDto)[] };

      const filters = service.generateMongoFilters(queryDto, options);

      expect(filters).toEqual({
        $and: [{ id: 1 }],
      });
    });

    it('should generate filters for non-exact fields', () => {
      const queryDto = { name: 'Test' };
      const options = { nonExactFields: ['name'] as (keyof typeof queryDto)[] };

      const filters = service.generateMongoFilters(queryDto, options);

      expect(filters).toEqual({
        $and: [{ name: { $regex: /Test/i } }],
      });
    });

    it('should generate filters for range fields', () => {
      const queryDto = { 'price.gte': 10, 'price.lte': 50 };
      const options = {};

      const filters = service.generateMongoFilters(queryDto, options);

      expect(filters).toEqual({
        $and: [{ price: { $gte: 10, $lte: 50 } }],
      });
    });

    it('should exclude fields specified in excludeFields', () => {
      const queryDto = { id: 1, name: 'Test' };
      const options = {
        excludeFields: ['id'] as (keyof typeof queryDto)[],
        nonExactFields: ['name'] as (keyof typeof queryDto)[],
      };

      const filters = service.generateMongoFilters(queryDto, options);

      expect(filters).toEqual({
        $and: [{ name: { $regex: /Test/i } }],
      });
    });

    it('should return an empty object if no filters are applicable', () => {
      const queryDto = {};
      const options = {};

      const filters = service.generateMongoFilters(queryDto, options);

      expect(filters).toEqual({});
    });
  });

  describe('calculatePagination', () => {
    it('should calculate pagination with default values', () => {
      const pagination = service.calculatePagination();

      expect(pagination).toEqual({ skip: 0, limit: 10 });
    });

    it('should calculate pagination for a given page and limit', () => {
      const pagination = service.calculatePagination(2, 5);

      expect(pagination).toEqual({ skip: 5, limit: 5 });
    });

    it('should sanitize negative page and limit values', () => {
      const pagination = service.calculatePagination(-1, -10);

      expect(pagination).toEqual({ skip: 0, limit: 1 });
    });
  });
});
