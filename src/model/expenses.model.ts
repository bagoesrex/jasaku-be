export class ExpenseResponse {
  id: string;
  title: string;
  amount: string;
  expense_date: string;
}

export class CreateExpenseRequest {
  title: string;
  amount: string;
  expense_date: string;
}

export class UpdateExpenseRequest {
  id: string;
  title: string;
  amount: string;
  expense_date: string;
}

export class SearchExpenseRequest {
  title?: string;
  amount?: string;
  page: number;
  size: number;
}
