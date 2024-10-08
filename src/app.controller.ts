import { Controller, Get } from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@ApiTags('App')
@ApiHeader({
  name: 'X-MyHeader',
  description: 'Custom header',
})
@Controller()
export class AppController {

  @Get()
  @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getRouteOne() {
    return "salom dunyo!"
  }



  @Get("test")
  getRouteTwo() {
    for (let i = 0; i < 100000000000; i++) {

    }

    return "salom dunyo from test route!"
  }

  @SkipThrottle()
  @Get("skip")
  skipRouteOnRateLimit() {
    return "ok "
  }
}
