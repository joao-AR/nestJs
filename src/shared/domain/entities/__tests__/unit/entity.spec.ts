import { validate as uuidValidate } from 'uuid';
import { Entity } from '../../entity';
type StubProps = {
  prop1: string;
  prop2: number;
};

// O termo stub é uma convenção para classes duble para criar testes
class StubEntity extends Entity<StubProps> {}
describe('Entity unit tests', () => {
  it('Should set props and id', () => {
    const props = { prop1: 'Value1', prop2: 15 };
    const entity = new StubEntity(props);

    expect(entity.props).toStrictEqual(props);
    expect(entity._id).not.toBeNull();
    expect(uuidValidate(entity._id)).toBeTruthy();
  });

  it('Should accept a valid uuid', () => {
    const props = { prop1: 'Value1', prop2: 15 };
    const id = 'b825434a-4101-44b8-b27a-a7f52166f219';
    const entity = new StubEntity(props, id);

    expect(uuidValidate(entity._id)).toBeTruthy();
    expect(entity._id).toBe(id);
  });

  it('Should convert a entity to a javascript Object', () => {
    const props = { prop1: 'Value1', prop2: 15 };
    const id = 'b825434a-4101-44b8-b27a-a7f52166f219';
    const entity = new StubEntity(props, id);

    expect(entity.toJson()).toStrictEqual({
      id,
      ...props,
    });
  });
});
