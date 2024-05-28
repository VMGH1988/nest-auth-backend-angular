import { PartialType } from '@nestjs/mapped-types';
// import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';

export class UpdateAuthDto extends PartialType(UpdateUserDto) {}



