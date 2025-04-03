import { SendSmsErrorResponse, SendSmsParams, SendSmsResponse } from './';
import { SmsStatusErrorResponse, SmsStatusParams, SmsStatusResponse } from './';

export interface SmsServiceInterface {
  sendSms(
    params: SendSmsParams,
  ): Promise<SendSmsResponse | SendSmsErrorResponse>;
  getSmsStatus(
    params: SmsStatusParams,
  ): Promise<SmsStatusResponse | SmsStatusErrorResponse>;
}
