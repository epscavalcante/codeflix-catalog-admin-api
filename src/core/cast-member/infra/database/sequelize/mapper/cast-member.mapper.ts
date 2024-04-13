import CastMember from '@core/cast-member/domain/cast-member.aggregate';
import CastMemberModel from '../models/cast-member.model';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.value-object';
import CastMemberType from '@core/cast-member/domain/cast-member-type.value-object';
import EntityValidationError from '@core/shared/domain/errors/entity-validation.error';

export default class CastMemberMapper {
    static toEntity(model: CastMemberModel): CastMember {
        const [castMemberType, castMemberTypeError] = CastMemberType.create(
            model.type,
        ).asArray();

        const castMember = new CastMember({
            castMemberId: new CastMemberId(model.castMemberId),
            name: model.name,
            type: castMemberType!,
            createdAt: model.createdAt,
        });

        castMember.validate();

        const notification = castMember.notification;

        if (castMemberTypeError) {
            notification.setError(castMemberTypeError.message, 'type');
        }

        if (notification.hasErrors()) {
            throw new EntityValidationError(notification.toJSON());
        }

        return castMember;
    }

    static toModel(castMember: CastMember): CastMemberModel {
        return CastMemberModel.build({
            castMemberId: castMember.castMemberId.value,
            name: castMember.name,
            type: castMember.type.value,
            createdAt: castMember.createdAt,
        });
    }
}
