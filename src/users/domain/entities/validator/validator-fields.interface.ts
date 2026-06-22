export type FieldsErrors = {
  [field: string]: string[];
};

export interface ValidatorFieldsInterface<PropsInput, PropsValidated> {
  errors: FieldsErrors;
  validateData: PropsInput;
  validate(rawData: PropsInput, rulesInstance: PropsValidated): boolean;
}
