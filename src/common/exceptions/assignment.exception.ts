
import { HttpException, HttpStatus } from '@nestjs/common';

export class AssignmentNotFoundException extends HttpException {
  constructor(id: string) {
    super(`Assignment with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class AssignmentDeadlineException extends HttpException {
  constructor() {
    super('Assignment deadline has passed', HttpStatus.BAD_REQUEST);
  }
}
