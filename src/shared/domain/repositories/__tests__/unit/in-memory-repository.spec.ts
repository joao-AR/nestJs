import { Entity } from '@/shared/domain/entities/entity';
import { InMemoryRepository } from '../../in-memory.repository';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';

type StubProps = {
  name: string;
  price: number;
};

class StubEntity extends Entity<StubProps> {}

class StubInMemoryRepository extends InMemoryRepository<StubEntity> {}

describe('InMemoryRepository unit tests', () => {
  let sut: StubInMemoryRepository;

  beforeEach(() => {
    sut = new StubInMemoryRepository();
  });

  it('Should insert a new entity', async () => {
    const entity = new StubEntity({ name: 'test name', price: 10 });
    await sut.insert(entity);
    expect(entity.toJson()).toStrictEqual(sut.items[0].toJson());
  });

  it('Should throw error when entity not found', async () => {
    await expect(sut.findById('fakeId')).rejects.toThrow(
      new NotFoundError('Entity with id fakeId not found'),
    );
  });

  it('Should find an entity by id', async () => {
    const entity = new StubEntity({ name: 'test name', price: 10 });
    await sut.insert(entity);
    const result = await sut.findById(entity._id);

    expect(entity.toJson()).toStrictEqual(result.toJson());
  });

  it('Should return all entities', async () => {
    const entity = new StubEntity({ name: 'test name', price: 10 });
    await sut.insert(entity);
    const result = await sut.findAll();

    expect([entity]).toStrictEqual(result);
  });

  it('Should throw error on update when entity not found', async () => {
    const entity = new StubEntity({ name: 'test name', price: 10 });
    await expect(sut.update(entity)).rejects.toThrow(
      new NotFoundError(`Entity with id ${entity._id} not found`),
    );
  });

  it('Should update an entity', async () => {
    const entity = new StubEntity({ name: 'test name', price: 10 });
    await sut.insert(entity);
    const entityUpdated = new StubEntity(
      { name: 'updated name', price: 50 },
      entity._id,
    );

    await sut.update(entityUpdated);

    expect(entityUpdated.toJson()).toStrictEqual(sut.items[0].toJson());
  });

  it('Should throw error on update when entity not found', async () => {
    await expect(sut.delete('fakeId')).rejects.toThrow(
      new NotFoundError(`Entity with id fakeId not found`),
    );
  });

  it('Should delete an entity', async () => {
    const entity = new StubEntity({ name: 'test name', price: 10 });
    await sut.insert(entity);
    await sut.delete(entity._id);

    expect(sut.items).toHaveLength(0);
  });
});
