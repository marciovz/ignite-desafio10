import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('List one statements', () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementRepository
    );
  });

  it('should be able to list one statement by id of a user', async () => {
    
    const user = await createUserUseCase.execute({
      name: 'Jonh Due',
      email: 'jonh.due@email.com',
      password: '123456'
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id || 'invalid' ,
      description: 'deposit of 3000,00',
      amount: 3000,
      type: 'deposit' as OperationType
    });

    const operation = await getStatementOperationUseCase.execute({
      user_id: user.id || '',
      statement_id: statement.id || '',
    });
    
    expect(operation.user_id).toBe(user.id);
    expect(operation.amount).toBe(3000);
    expect(operation.type).toBe('deposit')
  })



  it('should not be able to list one statement with invalid userId', async () => {
    await expect( async () => {
      const user = await createUserUseCase.execute({
        name: 'Jonh Due',
        email: 'jonh.due@email.com',
        password: '123456'
      });
  
      const statement = await createStatementUseCase.execute({
        user_id: user.id || 'invalid' ,
        description: 'deposit of 3000,00',
        amount: 3000,
        type: 'deposit' as OperationType
      });
  
      return await getStatementOperationUseCase.execute({
        user_id: 'invalid',
        statement_id: statement.id || '',
      });
  
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  })



  it('should not be able to list one statement with invalid statementOperationId', async () => {
    await expect( async () => {
      const user = await createUserUseCase.execute({
        name: 'Jonh Due',
        email: 'jonh.due@email.com',
        password: '123456'
      });
  
      const statement = await createStatementUseCase.execute({
        user_id: user.id || 'invalid' ,
        description: 'deposit of 3000,00',
        amount: 3000,
        type: 'deposit' as OperationType
      });
  
      return await getStatementOperationUseCase.execute({
        user_id: user.id || '',
        statement_id: 'invalid',
      });
  
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  })

});