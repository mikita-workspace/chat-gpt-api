import { UTCDate } from '@date-fns/utc';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from '../app.controller';
import { AppService } from '../app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    jest.spyOn(global, 'Date').mockImplementationOnce(() => new Date('2021-09-12T11:01:58.135Z'));

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
      imports: [
        ConfigModule.forRoot({
          ignoreEnvVars: true,
          ignoreEnvFile: true,
          load: [() => ({ api: { name: 'NovaChat | GPT API' } })],
        }),
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  afterEach(async () => {
    jest.useRealTimers();
  });

  describe('Controller >> getInitial', () => {
    const mockRequest = {
      url: 'api/v1',
    };

    const mockInitialJson = {
      statusCode: 200,
      message: 'NovaChat | GPT API',
      timestamp: new UTCDate(),
      path: 'api/v1',
    };

    it('should return initial json', () => {
      expect(appController.getInitial(mockRequest as Request)).toMatchObject(mockInitialJson);
    });
  });
});
