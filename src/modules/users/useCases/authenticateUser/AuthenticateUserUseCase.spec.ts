import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";

import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";


let userInMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe('Create Sessions', () => {

  beforeEach(() => {
    userInMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userInMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(userInMemoryUsersRepository);
  });

  it('should be able to create a session', async () => {
    const user = {
      name: 'Jonh Due',
      email: 'jonh.due@email.com',
      password: '123456'
    }

    await createUserUseCase.execute(user);

    const session = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    expect(session).toHaveProperty('token')
  });


  it('should not be able to create a session with incorrect email', async () => {
    await expect(async () => {
      const user = {
        name: 'Jonh Due',
        email: 'jonh.due@email.com',
        password: '123456'
      }
      await createUserUseCase.execute(user);
  
      const session = await authenticateUserUseCase.execute({
        email: 'wrong@email.com',
        password: user.password
      });
      return session;
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })


  it('should not be able to create a session with incorrect password', async () => {   
    await expect(async () => {
      const user = {
        name: 'Jonh Due',
        email: 'jonh.due@email.com',
        password: '123456'
      }
      await createUserUseCase.execute(user);

      const session = await authenticateUserUseCase.execute({
        email: user.email,
        password: 'incorrect'
      });
      return session;
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })

});