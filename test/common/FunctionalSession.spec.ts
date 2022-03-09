import { expect } from 'chai';
import { TenancyModelOptions } from 'lib/interfaces';
import { Category } from 'test/util/entity/Category';
import { Post } from 'test/util/entity/Post';
import {
  closeTestingConnections,
  getTypeOrmConfig,
  reloadTestingDatabases,
  setupSingleTestingConnection,
} from 'test/util/test-utils';
import { Connection, ConnectionOptions, createConnection } from 'typeorm';
import {
  RLSConnection,
  RLSPostgresDriver,
  RLSPostgresQueryRunner,
} from 'lib/common';

const configs = getTypeOrmConfig();

describe('Function Session', () => {
  let connection: RLSConnection;
  let originalConnection: Connection;
  let migrationConnection: Connection;
  let driver: RLSPostgresDriver;
  let queryRunner: RLSPostgresQueryRunner;

  let internalOrgId = 42;
  const fooTenant: TenancyModelOptions = {
    actorId: 10,

    get organizationId() {
      return internalOrgId;
    },

    set organizationId(orgId: number) {
      internalOrgId = orgId;
    },
  };

  before(async () => {
    const connectionOptions = setupSingleTestingConnection('postgres', {
      entities: [Post, Category],
      dropSchema: true,
      schemaCreate: true,
    });

    const migrationConnectionOptions = setupSingleTestingConnection(
      'postgres',
      {
        entities: [Post, Category],
      },
      {
        ...configs[0],
        name: 'migrationConnection',
      } as ConnectionOptions,
    );

    originalConnection = await createConnection(connectionOptions);
    migrationConnection = await createConnection(migrationConnectionOptions);

    connection = new RLSConnection(originalConnection, fooTenant);
    driver = connection.driver;
  });

  beforeEach(async () => {
    await reloadTestingDatabases([migrationConnection]);
    queryRunner = new RLSPostgresQueryRunner(driver, 'master', fooTenant);
  });

  afterEach(async () => await queryRunner.release());
  after(
    async () =>
      await closeTestingConnections([originalConnection, migrationConnection]),
  );

  it('should use getters in TenancyModelOptions', async () => {
    const [result] = await queryRunner.query(
      `select current_setting('rls.org_id') as "organizationId"`,
    );

    expect(parseInt(result.organizationId)).to.be.equal(42);
  });

  it('should react on changes of org ids', async () => {
    fooTenant.organizationId = 77;
    const [result] = await queryRunner.query(
      `select current_setting('rls.org_id') as "organizationId"`,
    );

    expect(parseInt(result.organizationId)).to.be.equal(77);
  });
});
