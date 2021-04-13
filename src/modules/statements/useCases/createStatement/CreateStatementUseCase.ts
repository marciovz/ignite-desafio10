import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";

interface ICreateStatementDTO {
  user_id: string;
  user_receiver_id?: string;
  type: OperationType;
  amount: number;
  description: string;
}


@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ user_id, user_receiver_id, type, amount, description }: ICreateStatementDTO) {
    const sender_id = type === 'transfer' ? user_id : undefined;
    
    const user = await this.usersRepository.findById(user_id);

    if(!user) {
      throw new CreateStatementError.UserNotFound();
    }

    if(type === 'withdraw' || type === 'transfer') {
      const { balance } = await this.statementsRepository.getUserBalance({ user_id });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds()
      }
    }

    if(type === 'transfer') {
      if (!user_receiver_id) {
        throw new CreateStatementError.UserNotFound();
      } 

      const user_receiver = await this.usersRepository.findById(user_receiver_id);
      
      if(!user_receiver) {
        throw new CreateStatementError.UserNotFound();
      } 

      await this.statementsRepository.create({
        user_id: user_receiver_id,
        sender_id,
        type,
        amount,
        description
      });

    }

    const statementOperation = await this.statementsRepository.create({
      user_id,
      sender_id,
      type,
      amount,
      description
    });

    return statementOperation;
  }
}
