import { UserEntity, UserProps } from '../../user.entity';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
describe('User entity unit tests', () => {
  let props: UserProps;
  let sut: UserEntity;
  beforeEach(() => {
    UserEntity.validate = jest.fn();
    props = userDataBuilder({});
    sut = new UserEntity(props);
  });

  it('Constructor method', () => {
    expect(sut.name).toEqual(props.name);
    expect(sut.email).toEqual(props.email);
    expect(sut.createdAt).toBeInstanceOf(Date);
    expect(UserEntity.validate).toHaveBeenCalled();
  });

  it('Getter of name field', () => {
    expect(sut.name).toBeDefined();
    expect(sut.name).toEqual(props.name);
    expect(typeof sut.name).toBe('string');
  });

  it('Setter of name field', () => {
    sut['name'] = 'new name';
    expect(sut.name).toEqual('new name');
    expect(typeof sut.name).toBe('string');
  });

  it('Getter of email field', () => {
    expect(sut.email).toBeDefined();
    expect(sut.email).toEqual(props.email);
    expect(typeof sut.email).toBe('string');
  });

  it('Getter of password field', () => {
    expect(sut.password).toBeDefined();
    expect(sut.password).toEqual(props.password);
    expect(typeof sut.password).toBe('string');
  });

  it('Setter of password field', () => {
    sut['password'] = 'new pass';
    expect(sut.password).toEqual('new pass');
    expect(typeof sut.password).toBe('string');
  });

  it('Getter of createdAt field', () => {
    expect(sut.createdAt).toBeDefined();
    expect(sut.createdAt).toBeInstanceOf(Date);
  });

  it('Should update a user', () => {
    sut.updateName('new name');
    expect(UserEntity.validate).toHaveBeenCalled();
    expect(sut.name).toEqual('new name');
  });

  it('Should update the password field', () => {
    sut.updatePassword('new pass');
    expect(UserEntity.validate).toHaveBeenCalled();
    expect(sut.password).toEqual('new pass');
  });
});
