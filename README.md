[![Build And Test](https://github.com/Avallone-io/rls/actions/workflows/build-and-test.yml/badge.svg?branch=master)](https://github.com/Avallone-io/rls/actions/workflows/build-and-test.yml)
[![.github/workflows/release.yml](https://github.com/Avallone-io/rls/actions/workflows/release.yml/badge.svg?branch=master)](https://github.com/Avallone-io/rls/actions/workflows/release.yml)

# Description

Row level security utilitary package to apply to NestJS and TypeORM.

This solution does not work by having multiple connections to database (eg: one connection / tenant). Instead, this solution works by applying the database policies for RLS as described in [this aws blog post](https://aws.amazon.com/blogs/database/multi-tenant-data-isolation-with-postgresql-row-level-security/) (under the **_Alternative approach_**).

# Install

> $ npm install @mrsimpson/rls

# Usage

To create a RLSConnection instance you'll need the original connection to db. Setup the typeorm config as usual, then wrap its connection into a **RLSConnection** instance, for each request.

This will run a `set "rls.tenant_id"` and `set "rls.actor_id"` for each request and will reset them after the query is executed.

---

**RLS Policies**

Your database policies will **have to** make use of `rls.tenant_id` and `rls.actor_id` in order to apply the isolation. Policy example:

```sql
CREATE POLICY tenant_isolation ON public."category" for ALL
USING ("tenant_id" = current_setting('rls.tenant_id'))
with check ("tenant_id" = current_setting('rls.tenant_id'));
```

---

## Express/KOA

For example, assuming an express application:

```typescript
app.use((req, res, next) => {
  const connection = getConnection(); // get default typeorm connection

  // get organizationId and actorId from somewhere (headers/token etc)
  const rlsConnection = new RLSConnection(connection, {
    actorId,
    organizationId,
  });

  res.locals.connection = rlsConnection;
  next();
});

// your handlers
const userRepo = res.locals.connection.getRepository(User);
await userRepo.find(); // will return only the results where the db rls policy applies
```

In the above example, you'll have to work with the supplied connection. Calling TypeORM function directly will work with the original connection which is not RLS aware.
