import {
  Arg,
  Field,
  InputType,
  Resolver,
  Query,
  Mutation,
  Ctx,
  ObjectType,
} from 'type-graphql';
import { User } from '../entities/User';
import { MyContext } from '../types';
import bcrypt from 'bcrypt';
import { registerValidator } from '../utils/validators';

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
export class AuthResolver {
  @Query(() => User, { nullable: true })
  async about(@Ctx() { em, req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async createUser(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const { errors, valid } = registerValidator(
      options.username,
      options.password
    );

    if (!valid) {
      return {
        errors: [
          {
            field: 'status',
            message: Object.values(errors)[0],
          },
        ],
      };
    }

    const existingUser = await em.findOne(User, { username: options.username });
    if (existingUser) {
      return {
        errors: [
          {
            field: 'status',
            message: `Username ${options.username} is already taken.`,
          },
        ],
      };
    }

    const hashRounds = 10;
    const hashedPassword = await bcrypt.hash(options.password, hashRounds);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });
    await em.persistAndFlush(user);
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
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
    req.session.userId = user.id;
    return { user };
  }
}
