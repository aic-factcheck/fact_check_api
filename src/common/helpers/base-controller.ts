import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiHeader({
  name: 'x-custom-lang',
  description: 'sk',
})
export abstract class BaseController {}
