import { Test, TestingModule } from '@nestjs/testing';
import { RabbitmqfakeController } from './rabbitmqfake.controller';

describe('RabbitmqfakeController', () => {
    let controller: RabbitmqfakeController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RabbitmqfakeController],
        }).compile();

        controller = module.get<RabbitmqfakeController>(RabbitmqfakeController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
