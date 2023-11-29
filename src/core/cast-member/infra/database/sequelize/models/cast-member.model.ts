import { CastMemberTypeEnum } from '../../../../domain/cast-member-type.value-object';
import {
    Column,
    DataType,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript';

type CastMemberModelProps = {
    castMemberId: string;
    name: string;
    type: CastMemberTypeEnum;
    createdAt: Date;
};

@Table({ tableName: 'cast_members', timestamps: false })
export default class CastMemberModel extends Model<CastMemberModelProps> {
    @PrimaryKey
    @Column({ type: DataType.UUID, field: 'cast_member_id' })
    declare castMemberId: string;

    @Column({ allowNull: false, type: DataType.STRING(255) })
    declare name: string;

    @Column({ allowNull: false, type: DataType.TINYINT })
    declare type: CastMemberTypeEnum;

    @Column({ allowNull: false, type: DataType.DATE(3), field: 'created_at' })
    declare createdAt: Date;
}
