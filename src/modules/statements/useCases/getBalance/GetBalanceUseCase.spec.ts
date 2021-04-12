import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsesRepository: InMemoryUsersRepository
let getBalanceUseCase: GetBalanceUseCase;


describe('Retorna o Balance', () => {

  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsesRepository = new InMemoryUsersRepository()
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsesRepository
    );
  });

  it('should be able to get a balance of a user', async () => {
    const user = await inMemoryUsesRepository.create({
      name: 'Jonh due',
      email: 'jonh.due@email.com',
      password: '123456'
    });

    await inMemoryStatementsRepository.create({
      user_id: user.id || '',
      description: 'deposit of 3000',
      amount: 3000,
      type: 'deposit' as OperationType
    });


    await inMemoryStatementsRepository.create({
      user_id: user.id || '',
      description: 'withdraw of 800',
      amount: 800,
      type: 'withdraw' as OperationType
    });

    const balance = await getBalanceUseCase.execute({
      user_id: user.id || ''
    });

    expect(balance.balance).toBe(2200);
    expect(balance.statement.length).toBe(2);
    expect(balance.statement[0].amount).toBe(3000);
    expect(balance.statement[1].amount).toBe(800);
  });


  it('should not be able to get a balance of a invalid userId', async () => {
    await expect(async () => {
      const user = await inMemoryUsesRepository.create({
        name: 'Jonh due',
        email: 'jonh.due@email.com',
        password: '123456'
      });
  
      await inMemoryStatementsRepository.create({
        user_id: user.id || '',
        description: 'deposit of 3000',
        amount: 3000,
        type: 'deposit' as OperationType
      });
  
      await inMemoryStatementsRepository.create({
        user_id: user.id || '',
        description: 'withdraw of 800',
        amount: 800,
        type: 'withdraw' as OperationType
      });
  
      return await getBalanceUseCase.execute({
        user_id: 'invalid'
      });
    }).rejects.toBeInstanceOf(GetBalanceError);

  });
});