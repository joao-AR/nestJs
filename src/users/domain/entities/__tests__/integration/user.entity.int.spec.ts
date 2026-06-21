import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { UserEntity, UserProps } from '../../user.entity';
import { EntityValidatorError } from '@/shared/domain/errors/validation-error';

describe('UserEntity integration test', () => {
  describe('constructor method', () => {
    it('Should throw an error when creating a user with invalid name', () => {
      let props: UserProps = {
        ...userDataBuilder({}),
        name: null,
      };
      expect(() => new UserEntity(props)).toThrow(EntityValidatorError);

      props = {
        ...userDataBuilder({}),
        name: '',
      };
      expect(() => new UserEntity(props)).toThrow(EntityValidatorError);

      props = {
        ...userDataBuilder({}),
        name: 'a'.repeat(256),
      };
      expect(() => new UserEntity(props)).toThrow(EntityValidatorError);

      props = {
        ...userDataBuilder({}),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        name: 10 as any,
      };
      expect(() => new UserEntity(props)).toThrow(EntityValidatorError);
    });

    it('Should throw an error when creating a user with invalid email', () => {
      let props: UserProps = {
        ...userDataBuilder({}),
        email: null,
      };
      expect(() => new UserEntity(props)).toThrow(EntityValidatorError);

      props = {
        ...userDataBuilder({}),
        email: '',
      };
      expect(() => new UserEntity(props)).toThrow(EntityValidatorError);

      props = {
        ...userDataBuilder({}),
        email: 'a'.repeat(256),
      };
      expect(() => new UserEntity(props)).toThrow(EntityValidatorError);

      props = {
        ...userDataBuilder({}),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        email: 10 as any,
      };
      expect(() => new UserEntity(props)).toThrow(EntityValidatorError);
    });

    it('Should throw an error when creating a user with invalid password', () => {
      let props: UserProps = {
        ...userDataBuilder({}),
        password: null,
      };
      expect(() => new UserEntity(props)).toThrow(EntityValidatorError);

      props = {
        ...userDataBuilder({}),
        password: '',
      };
      expect(() => new UserEntity(props)).toThrow(EntityValidatorError);

      props = {
        ...userDataBuilder({}),
        password: 'a'.repeat(101),
      };
      expect(() => new UserEntity(props)).toThrow(EntityValidatorError);

      props = {
        ...userDataBuilder({}),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        password: 10 as any,
      };
      expect(() => new UserEntity(props)).toThrow(EntityValidatorError);
    });

    it('Should throw an error when creating a user with invalid createdAt', () => {
      let props: UserProps = {
        ...userDataBuilder({}),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        createdAt: '2025' as any,
      };
      expect(() => new UserEntity(props)).toThrow(EntityValidatorError);

      props = {
        ...userDataBuilder({}),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        createdAt: 10 as any,
      };

      expect(() => new UserEntity(props)).toThrow(EntityValidatorError);
    });

    it('Should be a valid user', () => {
      expect.assertions(0); // expect that the code result zero problems
      const props: UserProps = {
        ...userDataBuilder({}),
      };
      new UserEntity(props);
    });
  });

  describe('UpdateName method', () => {
    it('Should throw an error when update user with invalid name', () => {
      const entity = new UserEntity(userDataBuilder({}));

      expect(() => entity.updateName(null)).toThrow(EntityValidatorError);
      expect(() => entity.updateName('')).toThrow(EntityValidatorError);
      expect(() => entity.updateName(10 as any)).toThrow(EntityValidatorError);
      expect(() => entity.updateName('a'.repeat(256))).toThrow(
        EntityValidatorError,
      );
    });

    it('Should be a valid user', () => {
      expect.assertions(0);

      const props: UserProps = { ...userDataBuilder({}) };

      const entity = new UserEntity(props);

      entity.updateName('new Name');
    });
  });

  describe('UpdatePassword method', () => {
    it('Should invalid a user using password field', () => {
      const entity = new UserEntity(userDataBuilder({}));

      expect(() => entity.updatePassword(null)).toThrow(EntityValidatorError);
      expect(() => entity.updatePassword('')).toThrow(EntityValidatorError);
      expect(() => entity.updatePassword(10 as any)).toThrow(
        EntityValidatorError,
      );
      expect(() => entity.updatePassword('a'.repeat(101))).toThrow(
        EntityValidatorError,
      );
    });

    it('Should be a valid user', () => {
      expect.assertions(0);

      const props: UserProps = { ...userDataBuilder({}) };

      const entity = new UserEntity(props);

      entity.updatePassword('new pass');
    });
  });
});
