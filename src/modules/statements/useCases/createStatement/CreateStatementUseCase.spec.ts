import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationUseCase } from "../getStatementOperation/GetStatementOperationUseCase";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";


let inMemoryUserRepository: InMemoryUsersRepository;
let inMemoryStatementRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Create Statement', () => {

  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUsersRepository();
    inMemoryStatementRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUserRepository,
      inMemoryStatementRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUserRepository,
      inMemoryStatementRepository
    );
  })

  it('should be able to create a new statement', async () => {
    const user = await createUserUseCase.execute({
      name: 'Jonh Due',
      email: 'jonh.due@email.com',
      password: '123456'
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id || '',
      description: 'Deposit of 3000',
      amount: 3000,
      type: 'deposit' as OperationType
    })

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id || '',
      statement_id: statement.id || ''
    });
    
    expect(statementOperation.user_id).toBe(user.id);
    expect(statementOperation.type).toBe('deposit');
    expect(statementOperation.amount).toBe(3000);
  })


  it('should not be able to create a new statement with a invalid userId', async () => {
    await expect(async () => {
      const user = await createUserUseCase.execute({
        name: 'Jonh Due',
        email: 'jonh.due@email.com',
        password: '123456'
      });
  
      return await createStatementUseCase.execute({
        user_id: 'invalid',
        description: 'Deposit of 3000',
        amount: 3000,
        type: 'deposit' as OperationType
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  })


  it('should not be able to create a new withdraw statement with a insufficient balance', async () => {
    await expect(async () => {
      const user = await createUserUseCase.execute({
        name: 'Jonh Due',
        email: 'jonh.due@email.com',
        password: '123456'
      });

      await createStatementUseCase.execute({
        user_id: user.id ||'',
        description: 'Deposit of 100',
        amount: 100,
        type: 'deposit' as OperationType
      })
  
      return await createStatementUseCase.execute({
        user_id: user.id ||'',
        description: 'Withdraw of 200',
        amount: 200,
        type: 'withdraw' as OperationType
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  })


});