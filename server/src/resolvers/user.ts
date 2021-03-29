import {
  Arg,
  Field,
  InputType,
  Resolver,
  Mutation,
  Ctx,
  ObjectType,
} from 'type-graphql';
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

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async createUser(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<User> {
    const hashRounds = 10;
    const hashedPassword = await bcrypt.hash(options.password, hashRounds);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });
    await em.persistAndFlush(user);
    return user;
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: 'username does not exist',
          },
        ],
      };
    }
    const valid = await bcrypt.compare(options.password, user.password);
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'password incorrect',
          },
        ],
      };
    }
    console.log(user);
    return { user };
  }
}
