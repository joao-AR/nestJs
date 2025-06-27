import { of } from 'rxjs';
import { WrapperDataInterceptor } from '../../wrapper-data.interceptor';

describe('WrapperDataInterceptor unit tests', () => {
  let interceptor: WrapperDataInterceptor;
  let props: any;

  beforeEach(() => {
    interceptor = new WrapperDataInterceptor();
    props = {
      name: 'Test name',
      email: 't@t.com',
      password: 'Pass123',
    };
  });

  it('Should wrapper with data key', () => {
    const obs$ = interceptor.intercept({} as any, {
      handle: () => of(props),
    });

    obs$.subscribe({
      next: value => {
        expect(value).toStrictEqual({ data: props });
      },
    });
    expect(interceptor).toBeDefined();
  });

  it('Should not wrapper when meta key is defined', () => {
    const res = {
      data: [props],
      meta: {
        total: 1,
      },
    };

    const obs$ = interceptor.intercept({} as any, {
      handle: () => of(res),
    });

    obs$.subscribe({
      next: value => {
        expect(value).toStrictEqual(res);
      },
    });
  });
});
