import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Auth')
export class Auth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  full_name: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  refreshToken?: string;

  // @OneToMany(() => UserCar, (userCar) => userCar.user)
  // userCars: UserCar[];
}
