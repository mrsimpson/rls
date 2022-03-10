import { RLSPostgresQueryRunner } from './RLSPostgresQueryRunner';
import { TenancyModelOptions } from '../interfaces/tenant-options.interface';
import { ReplicationMode } from 'typeorm';
import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';
import { RLSConnection } from './RLSConnection';

export class RLSPostgresDriver extends PostgresDriver {
  tenancyModelOptions: TenancyModelOptions;

  constructor(
    connection: RLSConnection,
    tenancyModelOptions: TenancyModelOptions,
  ) {
    super(connection);
    Object.assign(this, connection.driver);

    this.tenancyModelOptions = tenancyModelOptions;
  }

  createQueryRunner(mode: ReplicationMode): RLSPostgresQueryRunner {
    return new RLSPostgresQueryRunner(this, mode, this.tenancyModelOptions);
  }
}
