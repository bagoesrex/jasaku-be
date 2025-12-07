import { HttpException, Injectable } from '@nestjs/common';
import { Prisma, Expense, User } from 'generated/prisma/client';
import { ValidationService } from 'src/common/validation.service';
import {
  CreateExpenseRequest,
  SearchExpenseRequest,
  ExpenseResponse,
  UpdateExpenseRequest,
} from 'src/model/expenses.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { ExpensesValidation } from './expenses.validation';
import { ApiResponse } from 'src/model/api.model';

@Injectable()
export class ExpensesService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  toExpenseResponse(expense: Expense): ExpenseResponse {
    return {
      id: expense.id,
      title: expense.title,
      amount: expense.amount.toString(),
      expense_date: expense.expenseDate.toISOString(),
    };
  }

  async checkExpenseMustExists(
    userId: string,
    expenseId: string,
  ): Promise<Expense> {
    const expense = await this.prismaService.expense.findFirst({
      where: {
        userId: userId,
        id: expenseId,
      },
    });

    if (!expense) {
      throw new HttpException('Expense is not found', 404);
    }

    return expense;
  }

  async create(
    user: User,
    request: CreateExpenseRequest,
  ): Promise<ExpenseResponse> {
    const createRequest = this.validationService.validate(
      ExpensesValidation.CREATE,
      request,
    ) as CreateExpenseRequest;

    const expense = await this.prismaService.expense.create({
      data: {
        title: createRequest.title,
        amount: new Prisma.Decimal(createRequest.amount),
        expenseDate: new Date(createRequest.expense_date),
        userId: user.id,
      },
    });

    return this.toExpenseResponse(expense);
  }

  async update(
    user: User,
    updateRequest: UpdateExpenseRequest,
  ): Promise<ExpenseResponse> {
    updateRequest = this.validationService.validate(
      ExpensesValidation.UPDATE,
      updateRequest,
    ) as UpdateExpenseRequest;

    let expense = await this.checkExpenseMustExists(user.id, updateRequest.id);

    expense = await this.prismaService.expense.update({
      where: {
        id: updateRequest.id,
        userId: user.id,
      },
      data: {
        title: updateRequest.title,
        amount: new Prisma.Decimal(updateRequest.amount),
        expenseDate: new Date(updateRequest.expense_date),
      },
    });

    return this.toExpenseResponse(expense);
  }

  async remove(user: User, expenseId: string): Promise<ExpenseResponse> {
    await this.checkExpenseMustExists(user.id, expenseId);

    const expense = await this.prismaService.expense.delete({
      where: {
        id: expenseId,
        userId: user.id,
      },
    });

    return this.toExpenseResponse(expense);
  }

  async search(
    user: User,
    request: SearchExpenseRequest,
  ): Promise<ApiResponse<ExpenseResponse[]>> {
    const searchRequest = this.validationService.validate(
      ExpensesValidation.SEARCH,
      request,
    ) as SearchExpenseRequest;

    const filters: Prisma.ExpenseWhereInput[] = [];

    if (searchRequest.title) {
      filters.push({
        title: {
          contains: searchRequest.title,
        },
      });
    }

    const skip = (searchRequest.page - 1) * searchRequest.size;

    const expenses = await this.prismaService.expense.findMany({
      where: {
        userId: user.id,
        AND: filters,
      },
      take: searchRequest.size,
      skip: skip,
    });

    const total = await this.prismaService.expense.count({
      where: {
        id: user.id,
        AND: filters,
      },
    });

    return {
      success: true,
      message: 'Expense berhasil difetch!',
      data: expenses.map((expense) => this.toExpenseResponse(expense)),
      paging: {
        current_page: searchRequest.page,
        size: searchRequest.size,
        total_page: Math.ceil(total / searchRequest.size),
      },
    };
  }
}
