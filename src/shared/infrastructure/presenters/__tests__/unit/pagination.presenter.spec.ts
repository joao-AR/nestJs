import { instanceToPlain } from 'class-transformer';
import { PaginationPresenter } from '../../pagination.presenter';

describe('PaginationPresenter unit tests', () => {
  describe('Constructor', () => {
    it('Should set values', () => {
      const props = {
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
        total: 2,
      };

      const sut = new PaginationPresenter(props);
      expect(sut).toMatchObject({
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
        total: 2,
      });
    });

    it('Should set string values', () => {
      const props = {
        currentPage: '1' as any,
        perPage: '2' as any,
        lastPage: '1' as any,
        total: '2' as any,
      };

      const sut = new PaginationPresenter(props);
      expect(sut).toMatchObject({
        currentPage: '1',
        perPage: '2',
        lastPage: '1',
        total: '2',
      });
    });
  });

  it('Should presenter data', () => {
    let props = {
      currentPage: 1,
      perPage: 2,
      lastPage: 1,
      total: 2,
    };

    let sut = new PaginationPresenter(props);

    let output = instanceToPlain(sut);
    expect(output).toStrictEqual({
      currentPage: 1,
      perPage: 2,
      lastPage: 1,
      total: 2,
    });

    props = {
      currentPage: '1' as any,
      perPage: '2' as any,
      lastPage: '1' as any,
      total: '2' as any,
    };

    sut = new PaginationPresenter(props);

    output = instanceToPlain(sut);

    expect(output).toStrictEqual({
      currentPage: 1,
      perPage: 2,
      lastPage: 1,
      total: 2,
    });
  });
});
