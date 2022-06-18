import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transactions } from 'src/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transactions])],
  providers: [TransactionsService],
  controllers: [TransactionsController]
})
export class TransactionsModule {}
