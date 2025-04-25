import { UserEntity } from '@/users/domain/entities/user.entity';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { UserOutPutMapper } from '../../user-output';

describe('UserOutputMapper unit tests', () => {
  it('Should convert a user in output', () => {
    const entity = new UserEntity(userDataBuilder({}));
    const spyToJson = jest.spyOn(entity, 'toJson');
    const sut = UserOutPutMapper.toOutput(entity);
    expect(spyToJson).toHaveBeenCalledTimes(1);
    expect(sut).toStrictEqual(entity.toJson());
  });
});
