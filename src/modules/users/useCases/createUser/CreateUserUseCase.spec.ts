import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserError } from './CreateUserError';
import { CreateUserUseCase } from "./CreateUserUseCase";

let userInMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Criar um usuário', () => {

  beforeEach(() => {
    userInMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userInMemoryUsersRepository);
  });


  it('should be able to create a new user', async () => {
    const newUser = {
      name: 'Jonh Due',
      email: 'jonh.due@email.com',
      password: '123456'
    }

    await createUserUseCase.execute(newUser);

    const user = await userInMemoryUsersRepository.findByEmail(newUser.email);
    
    expect(user).toHaveProperty('id');
    expect(user?.name).toBe(newUser.name);
    
  });


  it('should not be able to create a new user duplicate', async () => {
    
   await expect( async () => {
      const newUser = {
        name: 'Jonh Due',
        email: 'jonh.due@email.com',
        password: '123456'
      }
      
      await createUserUseCase.execute(newUser);
      return await createUserUseCase.execute(newUser);

    }).rejects.toBeInstanceOf(CreateUserError);

  });

});
