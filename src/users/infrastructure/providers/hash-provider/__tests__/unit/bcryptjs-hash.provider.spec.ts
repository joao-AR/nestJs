import { BcryptjsHashProvider } from '../../bcryptjs-hash.provider';

describe('BcryptjsHashProvider unit tests', () => {
  let sut: BcryptjsHashProvider;

  beforeEach(() => {
    sut = new BcryptjsHashProvider();
  });

  it('Should return an encrypted password ', async () => {
    const password = '123Test';
    const hash = await sut.generateHash(password);
    expect(hash).toBeDefined();
  });

  it('Should return false on invalid password', async () => {
    const password = '123Test';
    const hash = await sut.generateHash(password);
    const result = await sut.compareHash('fake', hash);
    expect(result).toBeFalsy();
  });

  it('Should return false on invalid password ans hash', async () => {
    const password = '123Test';
    const hash = await sut.generateHash(password);
    const result = await sut.compareHash('fake', hash);
    expect(result).toBeFalsy();
  });

  it('Should return true on valid password and hash', async () => {
    const password = '123Test';
    const hash = await sut.generateHash(password);
    const result = await sut.compareHash(password, hash);
    expect(result).toBeTruthy();
  });
});
