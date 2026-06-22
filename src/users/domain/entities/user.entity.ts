import { Entity } from '@/shared/domain/entities/entity';
import { EntityValidatorError } from '@/shared/domain/errors/validation-error';
import { ValidatorFieldsInterface } from './validator/validator-fields.interface';

export type UserProps = {
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  roles?: UserRole[];
};

export type UserRole = {
  id: number;
  role: string;
};

export class UserEntity extends Entity<UserProps> {
  private static validator: ValidatorFieldsInterface<UserProps>;

  constructor(
    public readonly props: UserProps,
    id?: string,
  ) {
    UserEntity.validate(props);
    super(props, id);
    this.props.createdAt = this.props.createdAt ?? new Date();
    this.props.roles = this.props.roles ?? [];
  }

  static setValidator(validator: ValidatorFieldsInterface<UserProps>) {
    this.validator = validator;
  }

  updateName(value: string) {
    UserEntity.validate({ ...this.props, name: value });
    this.name = value;
  }

  updatePassword(value: string) {
    UserEntity.validate({ ...this.props, password: value });
    this.password = value;
  }

  get name() {
    return this.props.name;
  }

  private set name(value: string) {
    this.props.name = value;
  }

  get email() {
    return this.props.email;
  }

  get password() {
    return this.props.password;
  }

  private set password(value: string) {
    this.props.password = value;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get roles() {
    return this.props.roles || [];
  }

  static validate(props: UserProps) {
    const isValid = this.validator.validate(props);

    if (!isValid) {
      throw new EntityValidatorError(this.validator.errors);
    }
  }
}
