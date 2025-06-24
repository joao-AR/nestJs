import { instanceToPlain } from 'class-transformer';
import { UserCollectionPresenter, UserPresenter } from '../../user.presenter';
import { PaginationPresenter } from '@/shared/infrastructure/presenters/pagination.presenter';

describe('UserPresenter unit tests', () => {
  const createdAt = new Date();
  let sut: UserPresenter;

  let props = {
    id: '84e9fc6b-20f6-416d-abc9-bc1394d11811',
    name: 'test name',
    email: 't@t.com',
    password: 'fakePass',
    createdAt,
  };

  beforeEach(() => {
    sut = new UserPresenter(props);
  });

  describe('Constructor', () => {
    it('Should be set values', () => {
      expect(sut).toMatchObject({
        id: props.id,
        name: props.name,
        email: props.email,
        createdAt: props.createdAt,
      });
    });
  });

  it('Should presenter data', () => {
    const output = instanceToPlain(sut);
    expect(output).toStrictEqual({
      id: props.id,
      name: props.name,
      email: props.email,
      createdAt: props.createdAt.toISOString(),
    });
  });
});

describe('UserCollectionPresenter unit tests', () => {
  const createdAt = new Date();

  const props = {
    id: '84e9fc6b-20f6-416d-abc9-bc1394d11811',
    name: 'test name',
    email: 't@t.com',
    password: 'fakePass',
    createdAt,
  };

  describe('Constructor', () => {
    it('Should be set values', () => {
      const sut = new UserCollectionPresenter({
        items: [props],
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
        total: 2,
      });

      expect(sut.meta).toBeInstanceOf(PaginationPresenter);
      expect(sut.meta).toStrictEqual(
        new PaginationPresenter({
          currentPage: 1,
          perPage: 2,
          lastPage: 1,
          total: 2,
        }),
      );
      expect(sut.data).toStrictEqual([new UserPresenter(props)]);
    });
  });

  it('Should presenter data', () => {
    let sut = new UserCollectionPresenter({
      items: [props],
      currentPage: 1,
      perPage: 2,
      lastPage: 1,
      total: 2,
    });

    let output = instanceToPlain(sut);

    const expectedResponse = {
      data: [
        {
          id: '84e9fc6b-20f6-416d-abc9-bc1394d11811',
          name: 'test name',
          email: 't@t.com',
          createdAt: createdAt.toISOString(),
        },
      ],
      meta: {
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
        total: 2,
      },
    };

    expect(output).toStrictEqual(expectedResponse);

    sut = new UserCollectionPresenter({
      items: [props],
      currentPage: '1' as any,
      perPage: '2' as any,
      lastPage: '1' as any,
      total: '2' as any,
    });

    output = instanceToPlain(sut);
    expect(output).toStrictEqual(expectedResponse);
  });
});
