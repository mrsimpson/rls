import { RLSPostgresQueryRunner } from './RLSPostgresQueryRunner';
import {
  ActorId,
  TenancyModelOptions,
  OrganizationId,
} from '../interfaces/tenant-options.interface';
import { ReplicationMode } from 'typeorm';
import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';
import { RLSConnection } from './RLSConnection';

export class RLSPostgresDriver extends PostgresDriver {
  organizationId: OrganizationId = null;
  actorId: ActorId = null;

  constructor(
    connection: RLSConnection,
    tenancyModelOptions: TenancyModelOptions,
  ) {
    super(connection);
    Object.assign(this, connection.driver);

    this.organizationId = tenancyModelOptions.organizationId;
    this.actorId = tenancyModelOptions.actorId;
  }

  createQueryRunner(mode: ReplicationMode): RLSPostgresQueryRunner {
    return new RLSPostgresQueryRunner(this, mode, {
      organizationId: this.organizationId,
      actorId: this.actorId,
    });
  }
}
