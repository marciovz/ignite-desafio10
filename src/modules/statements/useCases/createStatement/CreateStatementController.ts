import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateStatementUseCase } from './CreateStatementUseCase';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { amount, description } = request.body;
    const { user_receiver_id } = request.params;

//    const splittedPath = request.originalUrl.split('/')
//    const type = splittedPath[splittedPath.length - 1] as OperationType;

    const requestType = request.originalUrl.match(/(deposit|withdraw|transfer)/g);
    
    if(!requestType || !requestType[0]) throw new Error('Invalid OperationType');
    
    const type = requestType[0] as OperationType;

    const createStatement = container.resolve(CreateStatementUseCase);

    const statement = await createStatement.execute({
      user_id,
      user_receiver_id,
      type,
      amount,
      description
    });

    return response.status(201).json(statement);
  }
}
