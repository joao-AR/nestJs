import { instanceToPlain } from 'class-transformer';
import { CollectionPresenter } from '../../collection.presenter';
import { PaginationPresenter } from '../../pagination.presenter';

class StubCollectionPresenter extends CollectionPresenter {
  data = [1, 2, 3];
}
describe('PaginationPresenter unit tests', () => {
  let sut: CollectionPresenter;

  const props = {
    currentPage: 1,
    perPage: 2,
    lastPage: 1,
    total: 2,
  };

  beforeEach(() => {
    sut = new StubCollectionPresenter(props);
  });
  describe('Constructor', () => {
    it('Should set values', () => {
      expect(sut['paginationPresenter']).toBeInstanceOf(PaginationPresenter);

      expect(sut['paginationPresenter']).toMatchObject({
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
        total: 2,
      });
    });
  });

  it('Should presenter data', () => {
    const output = instanceToPlain(sut);
    expect(output).toStrictEqual({
      data: [1, 2, 3],
      meta: {
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
        total: 2,
      },
    });
  });
});
