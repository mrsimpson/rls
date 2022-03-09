import { ReplicationMode } from 'typeorm';
import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';
import { PostgresQueryRunner } from 'typeorm/driver/postgres/PostgresQueryRunner';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import {
  ActorId,
  TenancyModelOptions,
  OrganizationId,
} from '../interfaces/tenant-options.interface';

export class RLSPostgresQueryRunner extends PostgresQueryRunner {
  tenancyModelOptions: TenancyModelOptions = null;
  isTransactionCommand = false;

  constructor(
    driver: PostgresDriver,
    mode: ReplicationMode,
    tenancyModelOptions: TenancyModelOptions,
  ) {
    super(driver, mode);
    this.setOptions(tenancyModelOptions);
  }

  private setOptions(tenancyModelOptions: TenancyModelOptions) {
    this.tenancyModelOptions = tenancyModelOptions;
  }

  async query(
    queryString: string,
    params?: any[],
    useStructuredResult?: boolean,
  ): Promise<any> {
    if (!this.isTransactionCommand) {
      await super.query(
        `set "rls.org_id" = '${this.tenancyModelOptions.organizationId}'; set "rls.actor_id" = '${this.tenancyModelOptions.actorId}';`,
      );
    }

    const result = await super.query(queryString, params, useStructuredResult);

    if (!this.isTransactionCommand) {
      await super.query(`reset rls.actor_id; reset rls.org_id;`);
    }
    return result;
  }

  async startTransaction(isolationLevel?: IsolationLevel): Promise<void> {
    this.isTransactionCommand = true;
    await super.startTransaction(isolationLevel);
    this.isTransactionCommand = false;
  }

  async commitTransaction(): Promise<void> {
    this.isTransactionCommand = true;
    await super.commitTransaction();
    this.isTransactionCommand = false;
  }

  async rollbackTransaction(): Promise<void> {
    this.isTransactionCommand = true;
    await super.rollbackTransaction();
    this.isTransactionCommand = false;
  }
}
