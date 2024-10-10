// admin.entity.ts
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@ApiTags('Admin')
@Entity()
export class Admin {
  @ApiProperty({ example: 1, description: "Admin's ID" })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'admin', description: "Admin's name" })
  @Column()
  name: string;

  @ApiProperty({ example: 'root', description: "Admin's password" })
  @Column()
  password: string;

  @ApiProperty({ example: '+998951006671', description: "Admin's phone" })
  @Column({ unique: true })
  phone: string;

  @ApiProperty({
    example: 'kjnuied8934h90f387489734bf3f7b73f',
    description: "Admin's refresh token",
  })
  @Column({ nullable: true })
  refreshToken: string;

  @ApiProperty({ description: "Admin's activeness" })
  @Column({ default: true })
  is_active: boolean;

  @ApiProperty({ description: "Admin's creatorness" })
  @Column({ default: false })
  is_creator: boolean;
}
