export type FieldsErrors = {
  [field: string]: string[];
};

export interface ValidatorFieldsInterface<PropsValidated> {
  errors: FieldsErrors;
  validateData: PropsValidated;
  validate(data: any): boolean;
}
