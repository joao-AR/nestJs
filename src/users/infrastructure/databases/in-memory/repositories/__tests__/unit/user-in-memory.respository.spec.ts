import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserInMemoryRepository } from '../../user-in-memory.repository';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { ConflictError } from '@/shared/domain/errors/conflict-error';

describe('UserInMemoryRepository unit tests', () => {
  let sut: UserInMemoryRepository;

  beforeEach(() => {
    sut = new UserInMemoryRepository();
  });

  it('should throw an error when not found - FoundByMail method', async () => {
    await expect(sut.findByEmail('test@email.com')).rejects.toThrow(
      new NotFoundError('Entity with email test@email.com not found'),
    );
  });

  it('should find a entity by email - FoundByMail method', async () => {
    const entity = new UserEntity(userDataBuilder({ email: 'test@email.com' }));
    const result = await sut.findByEmail('test@email.com');
    expect(entity.toJson()).toStrictEqual(result.toJson());
  });

  it('should throw an error when email already exists - emailExists method', async () => {
    const entity = new UserEntity(userDataBuilder({ email: 'test@email.com' }));
    await expect(sut.emailExists('test@email.com')).rejects.toThrow(
      new ConflictError('Email address test@email.com already in use'),
    );
  });

  it('should throw an error when not found - emailExists method', async () => {
    expect.assertions(0);
    await sut.emailExists('radom@email.com');
  });

  it('should not filter when filter object is null', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    await sut.insert(entity);
    const result = await sut.findAll();
    const spyFilter = jest.spyOn(result, 'filter');
    const itemsFiltered = await sut['applyFilter'](result, null);
    expect(spyFilter).not.toHaveBeenCalled();
    expect(itemsFiltered).toStrictEqual(result);
  });

  it('should filter name when using filter param', async () => {
    const items = [
      new UserEntity(userDataBuilder({ name: 'TEST' })),
      new UserEntity(userDataBuilder({ name: 'test' })),
      new UserEntity(userDataBuilder({ name: 'fake' })),
    ];

    const spyFilter = jest.spyOn(items, 'filter');
    const itemsFiltered = await sut['applyFilter'](items, 'test');
    expect(spyFilter).toHaveBeenCalled();
    expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
  });

  it('should sort by createdAt when sort param is null', async () => {
    const createdAt = new Date();
    const items = [
      new UserEntity(
        userDataBuilder({
          name: 'TEST',
          createdAt: createdAt,
        }),
      ),
      new UserEntity(
        userDataBuilder({
          name: 'test',
          createdAt: new Date(createdAt.getTime() + 1),
        }),
      ),
      new UserEntity(
        userDataBuilder({
          name: 'fake',
          createdAt: new Date(createdAt.getTime() + 2),
        }),
      ),
    ];

    const itemsSorted = await sut['applySort'](items, null, null);
    expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);
  });

  it('should sort by name field', async () => {
    const items = [
      new UserEntity(userDataBuilder({ name: 'x' })),
      new UserEntity(userDataBuilder({ name: 'b' })),
      new UserEntity(userDataBuilder({ name: 'c' })),
    ];

    let itemsSorted = await sut['applySort'](items, 'name', 'asc');
    expect(itemsSorted).toStrictEqual([items[1], items[2], items[0]]);

    itemsSorted = await sut['applySort'](items, 'name', null);
    expect(itemsSorted).toStrictEqual([items[0], items[2], items[1]]);
  });
});
