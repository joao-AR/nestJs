import {
  FieldsErrors,
  ValidatorFieldsInterface,
} from '@/users/domain/entities/validator/validator-fields.interface';
import { validateSync } from 'class-validator';

export abstract class ClassValidatorFields<PropsInput, PropsValidated>
  implements ValidatorFieldsInterface<PropsInput, PropsValidated>
{
  errors: FieldsErrors | null = null;
  validateData: PropsInput | null = null;

  validate(rawData: PropsInput, rulesInstance: PropsValidated): boolean {
    const errors = validateSync(rulesInstance as object);
    if (errors.length) {
      this.errors = {};
      for (const error of errors) {
        const field = error.property;
        this.errors[field] = Object.values(error.constraints ?? {});
      }
    } else {
      this.validateData = rawData;
    }
    return !errors.length;
  }
}
