import DomainEventMediator from '@core/shared/domain/domain-events/domain-event.mediator';
import { Global, Module } from '@nestjs/common';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';

@Global()
@Module({
    imports: [EventEmitterModule.forRoot()],
    providers: [
        {
            provide: DomainEventMediator,
            useFactory: (eventEmitter2: EventEmitter2) => {
                return new DomainEventMediator(eventEmitter2);
            },
            inject: [EventEmitter2],
        },
    ],
    exports: [DomainEventMediator],
})
export class EventModule {}
