import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth.service';
import { JwtModule } from '@nestjs/jwt';
import { EnvConfigService } from '@/shared/infrastructure/env-config/env-config.service';

describe('AuthService unit tests', () => {
  let sut: AuthService;

  const mockEnvConfigService = {
    getJwtSecret: jest.fn().mockReturnValue('fake_secret'),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'fake_secret',
          signOptions: { expiresIn: '1d' },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: EnvConfigService,
          useValue: mockEnvConfigService,
        },
      ],
    }).compile();

    sut = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should return a jwt', async () => {
    const result = await sut.generateJwt('fakeId');
    expect(Object.keys(result)).toEqual(['accessToken']);
    expect(typeof result.accessToken).toBe('string');
  });

  it('should verify a jwt', async () => {
    const tokenObj = await sut.generateJwt('fakeId');

    const validToken = await sut.verifyJwt(tokenObj.accessToken);
    expect(validToken).not.toBeNull();
    expect(validToken.id).toBe('fakeId');

    await expect(sut.verifyJwt('invalid')).rejects.toThrow();
  });
});
