import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'generated/prisma/client';
import { UpdateUserRequest, UserResponse } from 'src/model/users.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersValidation } from './users.validation';
import { hashPassword } from 'src/common/utils/bcrypt.util';
import { ValidationService } from 'src/common/validation.service';

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async update(user: User, request: UpdateUserRequest): Promise<UserResponse> {
    const updateRequest = this.validationService.validate(
      UsersValidation.UPDATE,
      request,
    ) as UpdateUserRequest;

    if (updateRequest.name) {
      user.name = updateRequest.name;
    }

    if (updateRequest.password) {
      user.password = await hashPassword(updateRequest.password);
    }

    const result = await this.prismaService.user.update({
      where: {
        email: user.email,
      },
      data: user,
    });

    return {
      name: result.name,
      email: result.email,
    };
  }

  async get(user: User): Promise<UserResponse> {
    return {
      email: user.email,
      name: user.name,
      service_type: user.serviceType,
    };
  }

  async logout(user: User): Promise<UserResponse> {
    const result = await this.prismaService.user.update({
      where: {
        email: user.email,
      },
      data: {
        token: null,
      },
    });

    return {
      email: result.email,
      name: result.name,
      service_type: result.serviceType,
    };
  }
}
