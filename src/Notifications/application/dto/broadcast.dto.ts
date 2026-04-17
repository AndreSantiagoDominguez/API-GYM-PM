import { IsString, IsNotEmpty } from 'class-validator';

export class BroadcastDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
