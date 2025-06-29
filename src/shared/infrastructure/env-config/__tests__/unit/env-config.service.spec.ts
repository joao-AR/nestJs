import { Test, TestingModule } from '@nestjs/testing';
import { EnvConfigService } from '../../env-config.service';
import { EnvConfigModule } from '../../env-config.module';
import { ConfigModule } from '@nestjs/config';

describe('EnvConfigService unit tests', () => {
  let sut: EnvConfigService; // SUT system Under Test

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EnvConfigModule.forRoot(), ConfigModule],
      providers: [EnvConfigService],
    }).compile();

    sut = module.get<EnvConfigService>(EnvConfigService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should return the variable PORT', () => {
    expect(sut.getAppPort()).toBe(3000);
  });

  it('should return the variable NODE_ENV', () => {
    expect(sut.getNodeEnv()).toBe('test');
  });

  it('should return the variable JWT_SECRET', () => {
    expect(sut.getJwtSecret()).toBe('fake_secret');
  });

  it('should return the variable JWT_EXPIRESIN', () => {
    expect(sut.getJwtExpiresInSeconds()).toBe(86400);
  });
});
