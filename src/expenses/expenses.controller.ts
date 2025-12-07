import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { Auth } from 'src/common/auth.decorator';
import { User } from 'generated/prisma/client';
import {
  CreateExpenseRequest,
  SearchExpenseRequest,
  ExpenseResponse,
  UpdateExpenseRequest,
} from 'src/model/expenses.model';
import { ApiResponse } from 'src/model/api.model';

@Controller('/api/expenses')
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Post()
  @HttpCode(200)
  async create(
    @Auth() user: User,
    @Body() request: CreateExpenseRequest,
  ): Promise<ApiResponse<ExpenseResponse>> {
    const result = await this.expensesService.create(user, request);
    return {
      success: true,
      message: 'Expense berhasil dibuat!',
      data: result,
    };
  }

  @Put('/:transactionId')
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Param('transactionId') transactionId: string,
    @Body() request: UpdateExpenseRequest,
  ): Promise<ApiResponse<ExpenseResponse>> {
    request.id = transactionId;
    const result = await this.expensesService.update(user, request);
    return {
      success: true,
      message: 'Expense berhasil diupdate!',
      data: result,
    };
  }

  @Delete('/:transactionId')
  @HttpCode(200)
  async remove(
    @Auth() user: User,
    @Param('transactionId') transactionId: string,
  ): Promise<ApiResponse<boolean>> {
    await this.expensesService.remove(user, transactionId);
    return {
      success: true,
      message: `Expense ${transactionId} berhasil dihapus!`,
      data: true,
    };
  }

  @Get()
  @HttpCode(200)
  async search(
    @Auth() user: User,
    @Query('title') title: string,
    @Query('amount') amount?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<ApiResponse<ExpenseResponse[]>> {
    const request: SearchExpenseRequest = {
      title: title,
      amount: amount,
      page: page || 1,
      size: size || 10,
    };
    return this.expensesService.search(user, request);
  }
}
