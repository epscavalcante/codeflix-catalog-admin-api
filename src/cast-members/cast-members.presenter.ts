import { Transform } from 'class-transformer';
import { CastMemberOutputType } from '@core/cast-member/application/use-cases/mappers/cast-member-output.mapper';
import { CastMemberTypeEnum } from '@core/cast-member/domain/cast-member-type.value-object';
import CollectionPresenter from '../shared/presenters/collection.presenter';
import { ListCastMembersOutput } from '@core/cast-member/application/use-cases/list-cast-member-use-case';

export class CastMemberPresenter {
  id: string;
  name: string;
  type: CastMemberTypeEnum;
  @Transform(({ value }: { value: Date }) => {
    return value.toISOString();
  })
  createdAt: Date;

  constructor(output: CastMemberOutputType) {
    this.id = output.id;
    this.name = output.name;
    this.type = output.type;
    this.createdAt = output.createdAt;
  }
}

export class CastMemberCollectionPresenter extends CollectionPresenter {
  data: CastMemberPresenter[];

  constructor(output: ListCastMembersOutput) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map((item) => new CastMemberPresenter(item));
  }
}