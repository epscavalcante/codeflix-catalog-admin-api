import ApplicationService from '@core/shared/application/application.service';
import DomainEventMediator from '@core/shared/domain/domain-events/domain-event.mediator';
import IUnitOfWork from '@core/shared/domain/repositories/unit-of-work.interface';
import { Global, Module, Scope } from '@nestjs/common';

@Global()
@Module({
    providers: [
        {
            provide: ApplicationService,
            useFactory: (
                unitOfWork: IUnitOfWork,
                domainEventMediator: DomainEventMediator,
            ) => {
                return new ApplicationService(unitOfWork, domainEventMediator);
            },
            inject: ['UnitOfWork', DomainEventMediator],
            scope: Scope.REQUEST,
        },
    ],
    exports: [ApplicationService],
})
export class ApplicationModule {}
