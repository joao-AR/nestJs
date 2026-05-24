import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { PrismaService } from './../../../../../shared/infrastructure/database/prisma/prisma.service';
import { SearchParams } from '@/shared/domain/repositories/searchable-repository-contracts';
import { UserEntity } from '@/users/domain/entities/user.entity';
import {
  UserRepository,
  UserSearchResult,
} from '@/users/domain/repositories/user.repository';
import { UserModelMapper } from '../models/user-module.mapper';
import { ConflictError } from '@/shared/domain/errors/conflict-error';

export class UserPrismaRepository implements UserRepository {
  constructor(private prismaService: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      const roles = user.roles.map(role => ({
        id: role.role.id,
        role: role.role.role,
      }));
      return UserModelMapper.toEntity(user, roles);
    } catch {
      throw new NotFoundError(`UserModel not found using email ${email}`);
    }
  }

  async emailExists(email: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (user) throw new ConflictError('Email address already in use');
  }

  sortableFields: string[] = ['name', 'createdAt'];

  async search(props: SearchParams<string>): Promise<UserSearchResult> {
    const sortable = this.sortableFields?.includes(props.sort) || false;
    const orderByField = sortable ? props.sort : 'createdAt';
    const orderByDir = sortable ? props.sortDir : 'desc';

    const count = await this.prismaService.user.count({
      ...(props.filter && {
        where: {
          name: {
            contains: props.filter,
            mode: 'insensitive',
          },
        },
      }),
    });

    const models = await this.prismaService.user.findMany({
      ...(props.filter && {
        where: {
          name: {
            contains: props.filter,
            mode: 'insensitive',
          },
        },
      }),
      include: { roles: { include: { role: true } } },
      orderBy: {
        [orderByField]: orderByDir,
      },
      skip: props.page && props.page > 0 ? (props.page - 1) * props.perPage : 1,
      take: props.perPage && props.perPage > 0 ? props.perPage : 15,
    });

    return new UserSearchResult({
      items: models.map(model => {
        return UserModelMapper.toEntity(model);
      }),
      total: count,
      currentPage: props.page,
      perPage: props.perPage,
      sort: orderByField,
      sortDir: orderByDir,
      filter: props.filter,
    });
  }

  async insert(entity: UserEntity): Promise<void> {
    const { roles, ...entityData } = entity.toJson();
    await this.prismaService.user.create({
      data: {
        ...entityData,
        roles: {
          createMany: {
            data: entity.roles.map(role => ({
              roleId: role.id,
            })),
          },
        },
      },
    });
  }

  findById(id: string): Promise<UserEntity> {
    return this._get(id);
  }

  async findAll(): Promise<UserEntity[]> {
    const models = await this.prismaService.user.findMany();
    return models.map(model => UserModelMapper.toEntity(model));
  }

  async update(entity: UserEntity): Promise<void> {
    await this._get(entity._id);

    await this.prismaService.user.update({
      data: entity.toJson(),
      where: {
        id: entity._id,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this._get(id);
    await this.prismaService.user.delete({
      where: {
        id,
      },
    });
  }

  protected async _get(id: string): Promise<UserEntity> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id },
      });
      return UserModelMapper.toEntity(user);
    } catch {
      throw new NotFoundError(`UserModel not found using ID ${id}`);
    }
  }
}
