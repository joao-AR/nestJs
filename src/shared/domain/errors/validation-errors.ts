import { FieldsErrors } from '@/users/domain/entities/validator/validator-fields.interface';

export class ValidationError extends Error {}

export class EntityValidatorError extends Error {
  constructor(public error: FieldsErrors) {
    super('Entity Validation Error');
    this.name = 'Entity Validation Error';
  }
}
