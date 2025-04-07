import { HttpException, HttpStatus } from '@nestjs/common';

export class AlreadyExistsException extends HttpException {
  constructor(message = 'Resource already exists') {
    super(message, HttpStatus.CONFLICT);
  }
}
