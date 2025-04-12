import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  username?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  firstName?: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty({ required: false })
  role?: string;

  @ApiProperty({ required: false })
  isActive?: boolean;
} 