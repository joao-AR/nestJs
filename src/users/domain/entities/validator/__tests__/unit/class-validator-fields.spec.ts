import { ClassValidatorFields } from '../../class-validator-fields';
import * as libClassValidator from 'class-validator';
class StubClassValidatorFields extends ClassValidatorFields<{
  field: string;
}> {}

describe('ClassValidatorFields unit tests', () => {
  it('Should initialize errors and validateData Variables with null', () => {
    const sut = new StubClassValidatorFields();

    expect(sut.errors).toBeNull();
    expect(sut.validateData).toBeNull();
  });

  it('Should validate with errors', () => {
    const spyValidateSync = jest.spyOn(libClassValidator, 'validateSync');

    spyValidateSync.mockReturnValue([
      {
        property: 'field',
        constraints: { isRequired: 'test error' },
      },
    ]);

    const sut = new StubClassValidatorFields();

    expect(sut.validate(null)).toBeFalsy();
    expect(spyValidateSync).toHaveBeenCalled();
    expect(sut.validateData).toBeNull();
    expect(sut.errors).toStrictEqual({ field: ['test error'] });
  });

  it('Should validate without errors', () => {
    const spyValidateSync = jest.spyOn(libClassValidator, 'validateSync');
    spyValidateSync.mockReturnValue([]);
    const sut = new StubClassValidatorFields();

    expect(sut.validate({ field: 'value' })).toBeTruthy();
    expect(spyValidateSync).toHaveBeenCalled();
    expect(sut.validateData).toStrictEqual({ field: 'value' });
    expect(sut.errors).toBeNull();
  });
});
