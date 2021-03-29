import { Arg, Field, InputType, Resolver, Mutation, Ctx } from 'type-graphql';
import { User } from '../entities/User';
import { MyContext } from '../types';
import bcrypt from 'bcrypt';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async createUser(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<User> {
    const hashRounds = 10;
    const hashedPassword = bcrypt.hash(options.password, hashRounds);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });
    await em.persistAndFlush(user);
    return user;
  }
}
