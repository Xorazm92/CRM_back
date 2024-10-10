
import { PartialType } from '@nestjs/swagger';
import { SignUpAuthDto } from './sigup-auth.dto';

export class UpdateUserDto extends PartialType(SignUpAuthDto) {}
