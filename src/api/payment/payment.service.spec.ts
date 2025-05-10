import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PrismaService,
          useValue: { user: { findUnique: jest.fn() }, studentPayment: { findMany: jest.fn() } }
        },
        {
          provide: 'NotificationService',
          useValue: { create: jest.fn() }
        }
      ],
    }).compile();
    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
