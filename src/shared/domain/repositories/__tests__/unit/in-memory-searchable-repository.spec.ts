import { Entity } from '@/shared/domain/entities/entity';
import { InMemorySearchableRepository } from '../../in-memory-searchable.repository';
import {
  SearchParams,
  SearchResult,
} from '../../searchable-repository-contracts';

type StubEntityProps = {
  name: string;
  price: number;
};

class StubEntity extends Entity<StubEntityProps> {}

class StubInMemorySearchableRepository extends InMemorySearchableRepository<StubEntity> {
  sortableFields: string[] = ['name'];
  protected async applyFilter(
    items: StubEntity[],
    filter: string | null,
  ): Promise<StubEntity[]> {
    if (!filter) {
      return items;
    }

    return items.filter(item =>
      item.props.name.toLowerCase().includes(filter.toLowerCase()),
    );
  }
}

describe('InMemorySearchableRepository unit tests', () => {
  let sut: StubInMemorySearchableRepository;

  beforeEach(() => {
    sut = new StubInMemorySearchableRepository();
  });

  describe('applyFilter method', () => {
    it('Should not filter items when filter param is null', async () => {
      const items = [new StubEntity({ name: 'test name', price: 10 })];
      const spyFilterMethod = jest.spyOn(items, 'filter');
      const itemsFiltered = await sut['applyFilter'](items, null);
      // Using sut['applyFilter'] because applyFilter is a protected function, so we have to use this workaround to use the function here to test it
      expect(itemsFiltered).toStrictEqual(items);
      expect(spyFilterMethod).not.toHaveBeenCalled();
    });

    it('Should filter items using filter param', async () => {
      const items = [
        new StubEntity({ name: 'test', price: 10 }),
        new StubEntity({ name: 'TEST', price: 20 }),
        new StubEntity({ name: 'fake', price: 30 }),
      ];
      const spyFilterMethod = jest.spyOn(items, 'filter');
      let itemsFiltered = await sut['applyFilter'](items, 'TEST');
      // Using sut['applyFilter'] because applyFilter is a protected function, so we have to use this workaround to use the function here to test it
      expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
      expect(spyFilterMethod).toHaveBeenCalledTimes(1);

      itemsFiltered = await sut['applyFilter'](items, 'test');
      expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
      expect(spyFilterMethod).toHaveBeenCalledTimes(2);

      itemsFiltered = await sut['applyFilter'](items, 'no-filter');
      expect(itemsFiltered).toHaveLength(0);
      expect(spyFilterMethod).toHaveBeenCalledTimes(3);
    });
  });
  describe('applySort method', () => {
    it('Should not order items', async () => {
      const items = [
        new StubEntity({ name: 'b', price: 10 }),
        new StubEntity({ name: 'a', price: 20 }),
      ];

      let itemsSorted = await sut['applySort'](items, null, null);

      expect(itemsSorted).toStrictEqual(items);

      itemsSorted = await sut['applySort'](items, 'price', 'asc');
      expect(itemsSorted).toStrictEqual(items);
    });

    it('Should order items', async () => {
      const items = [
        new StubEntity({ name: 'b', price: 10 }),
        new StubEntity({ name: 'a', price: 20 }),
        new StubEntity({ name: 'c', price: 30 }),
      ];

      let itemsSorted = await sut['applySort'](items, 'name', 'asc');
      expect(itemsSorted).toStrictEqual([items[1], items[0], items[2]]);

      itemsSorted = await sut['applySort'](items, 'name', 'desc');
      expect(itemsSorted).toStrictEqual([items[2], items[0], items[1]]);
    });
  });

  describe('applyPaginate method', () => {
    it('Should paginate items', async () => {
      const items = [
        new StubEntity({ name: 'a', price: 20 }),
        new StubEntity({ name: 'b', price: 10 }),
        new StubEntity({ name: 'c', price: 30 }),
        new StubEntity({ name: 'd', price: 30 }),
        new StubEntity({ name: 'e', price: 30 }),
      ];

      let itemsPaginated = await sut['applyPaginate'](items, 1, 2);
      expect(itemsPaginated).toStrictEqual([items[0], items[1]]);

      itemsPaginated = await sut['applyPaginate'](items, 2, 2);
      expect(itemsPaginated).toStrictEqual([items[2], items[3]]);

      itemsPaginated = await sut['applyPaginate'](items, 3, 2);
      expect(itemsPaginated).toStrictEqual([items[4]]);

      itemsPaginated = await sut['applyPaginate'](items, 4, 2);
      expect(itemsPaginated).toStrictEqual([]);
    });
  });
  describe('search method', () => {
    it('Should only paginate when others params are null', async () => {
      const entity = new StubEntity({ name: 'a', price: 20 });
      const items = Array(16).fill(entity); // Creating a array with 16 positions and filling the space with a copy of entity

      sut.items = items;

      let params = await sut.search(new SearchParams());

      expect(params).toStrictEqual(
        new SearchResult({
          items: Array(15).fill(entity),
          total: 16,
          currentPage: 1,
          perPage: 15,
          sort: null,
          sortDir: null,
          filter: null,
        }),
      );
    });

    it('Should paginate and filter', async () => {
      const items = [
        new StubEntity({ name: 'TEST', price: 10 }),
        new StubEntity({ name: 'a', price: 20 }),
        new StubEntity({ name: 'test', price: 30 }),
        new StubEntity({ name: 'TeSt', price: 30 }),
      ];
      sut.items = items;

      let params = await sut.search(
        new SearchParams({
          page: 1,
          perPage: 2,
          filter: 'TEST',
        }),
      );

      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[0], items[2]],
          total: 3,
          currentPage: 1,
          perPage: 2,
          sort: null,
          sortDir: null,
          filter: 'TEST',
        }),
      );

      params = await sut.search(
        new SearchParams({
          page: 2,
          perPage: 2,
          filter: 'TEST',
        }),
      );

      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[3]],
          total: 3,
          currentPage: 2,
          perPage: 2,
          sort: null,
          sortDir: null,
          filter: 'TEST',
        }),
      );
    });

    it('Should only paginate and sort', async () => {
      const items = [
        new StubEntity({ name: 'b', price: 10 }),
        new StubEntity({ name: 'y', price: 20 }),
        new StubEntity({ name: 'c', price: 30 }),
        new StubEntity({ name: 'a', price: 30 }),
        new StubEntity({ name: 'z', price: 30 }),
      ];
      sut.items = items;

      let params = await sut.search(
        new SearchParams({
          page: 1,
          perPage: 2,
          sort: 'name',
        }),
      );

      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[4], items[1]],
          total: 5,
          currentPage: 1,
          perPage: 2,
          sort: 'name',
          sortDir: 'desc',
          filter: null,
        }),
      );

      params = await sut.search(
        new SearchParams({
          page: 2,
          perPage: 2,
          sort: 'name',
        }),
      );

      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[2], items[0]],
          total: 5,
          currentPage: 2,
          perPage: 2,
          sort: 'name',
          sortDir: 'desc',
          filter: null,
        }),
      );

      params = await sut.search(
        new SearchParams({
          page: 1,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
        }),
      );

      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[3], items[0]],
          total: 5,
          currentPage: 1,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
          filter: null,
        }),
      );

      params = await sut.search(
        new SearchParams({
          page: 3,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
        }),
      );

      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[4]],
          total: 5,
          currentPage: 3,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
          filter: null,
        }),
      );
    });

    it('Should paginate, filter and sort', async () => {
      const items = [
        new StubEntity({ name: 'TEST', price: 10 }),
        new StubEntity({ name: 'a', price: 20 }),
        new StubEntity({ name: 'e', price: 30 }),
        new StubEntity({ name: 'test', price: 30 }),
        new StubEntity({ name: 'TeSt', price: 30 }),
      ];
      sut.items = items;

      let params = await sut.search(
        new SearchParams({
          page: 1,
          perPage: 2,
          filter: 'TEST',
          sort: 'name',
        }),
      );

      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[3], items[4]],
          total: 3,
          currentPage: 1,
          perPage: 2,
          sort: 'name',
          sortDir: 'desc',
          filter: 'TEST',
        }),
      );

      params = await sut.search(
        new SearchParams({
          page: 2,
          perPage: 2,
          filter: 'TEST',
          sort: 'name',
        }),
      );

      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[0]],
          total: 3,
          currentPage: 1,
          perPage: 2,
          sort: 'name',
          sortDir: 'desc',
          filter: 'TEST',
        }),
      );
    });
  });
});
