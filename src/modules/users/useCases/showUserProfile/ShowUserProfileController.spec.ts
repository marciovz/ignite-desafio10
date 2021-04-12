import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let userInMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Show One Profile', () => {
  beforeEach(() => {
    userInMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userInMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(userInMemoryUsersRepository);
  });

  it('should be able to list one profile by your id', async () => {
    const user = await createUserUseCase.execute({
      name: 'Jonh Due',
      email: 'jonh.due@email.com',
      password: '123456'
    })

    const profile = await showUserProfileUseCase.execute(user.id ||'undefined');

    expect(profile.email).toEqual('jonh.due@email.com');
  })


  it('should not be able to list one profile with incorrect id', async () => {
    await expect(async () => {
      await createUserUseCase.execute({
        name: 'Jonh Due',
        email: 'jonh.due@email.com',
        password: '123456'
      })
  
      return await showUserProfileUseCase.execute('incorrect_id');

    }).rejects.toBeInstanceOf(ShowUserProfileError);
  })

});