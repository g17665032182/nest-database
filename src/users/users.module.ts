import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';

@Module({
  imports:[MikroOrmModule.forFeature([User])],
  controllers: [],
  providers: [UsersService],
  exports:[UsersService]
})
export class UsersModule {}
