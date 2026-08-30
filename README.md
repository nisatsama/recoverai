
```
RevenueAI
├─ client
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  └─ vite.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.jsx
│  │  ├─ assets
│  │  │  └─ react.svg
│  │  ├─ index.css
│  │  └─ main.jsx
│  └─ vite.config.js
└─ server
   ├─ .agents
   │  └─ skills
   │     ├─ prisma-cli
   │     │  ├─ references
   │     │  │  ├─ agent-safety.md
   │     │  │  ├─ complete.md
   │     │  │  ├─ db-execute.md
   │     │  │  ├─ db-pull.md
   │     │  │  ├─ db-push.md
   │     │  │  ├─ db-seed.md
   │     │  │  ├─ debug.md
   │     │  │  ├─ dev.md
   │     │  │  ├─ format.md
   │     │  │  ├─ generate.md
   │     │  │  ├─ init.md
   │     │  │  ├─ mcp.md
   │     │  │  ├─ migrate-deploy.md
   │     │  │  ├─ migrate-dev.md
   │     │  │  ├─ migrate-diff.md
   │     │  │  ├─ migrate-reset.md
   │     │  │  ├─ migrate-resolve.md
   │     │  │  ├─ migrate-status.md
   │     │  │  ├─ studio.md
   │     │  │  └─ validate.md
   │     │  └─ SKILL.md
   │     ├─ prisma-client-api
   │     │  ├─ references
   │     │  │  ├─ client-methods.md
   │     │  │  ├─ constructor.md
   │     │  │  ├─ filters.md
   │     │  │  ├─ model-queries.md
   │     │  │  ├─ query-options.md
   │     │  │  ├─ raw-queries.md
   │     │  │  ├─ relations.md
   │     │  │  └─ transactions.md
   │     │  └─ SKILL.md
   │     ├─ prisma-compute
   │     │  ├─ references
   │     │  │  ├─ app-deploy-cli.md
   │     │  │  ├─ compute-config.md
   │     │  │  ├─ create-prisma.md
   │     │  │  ├─ frameworks.md
   │     │  │  ├─ sdk-api.md
   │     │  │  └─ troubleshooting.md
   │     │  └─ SKILL.md
   │     ├─ prisma-database-setup
   │     │  ├─ references
   │     │  │  ├─ cockroachdb.md
   │     │  │  ├─ mongodb.md
   │     │  │  ├─ mysql.md
   │     │  │  ├─ postgresql.md
   │     │  │  ├─ prisma-client-setup.md
   │     │  │  ├─ prisma-postgres.md
   │     │  │  ├─ sqlite.md
   │     │  │  └─ sqlserver.md
   │     │  └─ SKILL.md
   │     ├─ prisma-driver-adapter-implementation
   │     │  └─ SKILL.md
   │     ├─ prisma-mongodb-upgrade
   │     │  ├─ references
   │     │  │  ├─ client-api-mapping.md
   │     │  │  ├─ decision-stay-or-migrate.md
   │     │  │  ├─ migrations-mapping.md
   │     │  │  ├─ schema-contract-mapping.md
   │     │  │  └─ verify-cutover-checklist.md
   │     │  └─ SKILL.md
   │     ├─ prisma-postgres
   │     │  ├─ references
   │     │  │  ├─ console-and-connections.md
   │     │  │  ├─ create-db-cli.md
   │     │  │  ├─ management-api-sdk.md
   │     │  │  └─ management-api.md
   │     │  └─ SKILL.md
   │     ├─ prisma-postgres-setup
   │     │  ├─ references
   │     │  │  ├─ api-basics.md
   │     │  │  ├─ auth.md
   │     │  │  ├─ endpoints.md
   │     │  │  └─ prisma7-client.md
   │     │  └─ SKILL.md
   │     └─ prisma-upgrade-v7
   │        ├─ references
   │        │  ├─ accelerate-users.md
   │        │  ├─ driver-adapters.md
   │        │  ├─ env-variables.md
   │        │  ├─ esm-support.md
   │        │  ├─ prisma-config.md
   │        │  ├─ removed-features.md
   │        │  └─ schema-changes.md
   │        └─ SKILL.md
   ├─ .claude
   │  └─ skills
   │     ├─ prisma-cli
   │     │  ├─ references
   │     │  │  ├─ agent-safety.md
   │     │  │  ├─ complete.md
   │     │  │  ├─ db-execute.md
   │     │  │  ├─ db-pull.md
   │     │  │  ├─ db-push.md
   │     │  │  ├─ db-seed.md
   │     │  │  ├─ debug.md
   │     │  │  ├─ dev.md
   │     │  │  ├─ format.md
   │     │  │  ├─ generate.md
   │     │  │  ├─ init.md
   │     │  │  ├─ mcp.md
   │     │  │  ├─ migrate-deploy.md
   │     │  │  ├─ migrate-dev.md
   │     │  │  ├─ migrate-diff.md
   │     │  │  ├─ migrate-reset.md
   │     │  │  ├─ migrate-resolve.md
   │     │  │  ├─ migrate-status.md
   │     │  │  ├─ studio.md
   │     │  │  └─ validate.md
   │     │  └─ SKILL.md
   │     ├─ prisma-client-api
   │     │  ├─ references
   │     │  │  ├─ client-methods.md
   │     │  │  ├─ constructor.md
   │     │  │  ├─ filters.md
   │     │  │  ├─ model-queries.md
   │     │  │  ├─ query-options.md
   │     │  │  ├─ raw-queries.md
   │     │  │  ├─ relations.md
   │     │  │  └─ transactions.md
   │     │  └─ SKILL.md
   │     ├─ prisma-compute
   │     │  ├─ references
   │     │  │  ├─ app-deploy-cli.md
   │     │  │  ├─ compute-config.md
   │     │  │  ├─ create-prisma.md
   │     │  │  ├─ frameworks.md
   │     │  │  ├─ sdk-api.md
   │     │  │  └─ troubleshooting.md
   │     │  └─ SKILL.md
   │     ├─ prisma-database-setup
   │     │  ├─ references
   │     │  │  ├─ cockroachdb.md
   │     │  │  ├─ mongodb.md
   │     │  │  ├─ mysql.md
   │     │  │  ├─ postgresql.md
   │     │  │  ├─ prisma-client-setup.md
   │     │  │  ├─ prisma-postgres.md
   │     │  │  ├─ sqlite.md
   │     │  │  └─ sqlserver.md
   │     │  └─ SKILL.md
   │     ├─ prisma-driver-adapter-implementation
   │     │  └─ SKILL.md
   │     ├─ prisma-mongodb-upgrade
   │     │  ├─ references
   │     │  │  ├─ client-api-mapping.md
   │     │  │  ├─ decision-stay-or-migrate.md
   │     │  │  ├─ migrations-mapping.md
   │     │  │  ├─ schema-contract-mapping.md
   │     │  │  └─ verify-cutover-checklist.md
   │     │  └─ SKILL.md
   │     ├─ prisma-postgres
   │     │  ├─ references
   │     │  │  ├─ console-and-connections.md
   │     │  │  ├─ create-db-cli.md
   │     │  │  ├─ management-api-sdk.md
   │     │  │  └─ management-api.md
   │     │  └─ SKILL.md
   │     ├─ prisma-postgres-setup
   │     │  ├─ references
   │     │  │  ├─ api-basics.md
   │     │  │  ├─ auth.md
   │     │  │  ├─ endpoints.md
   │     │  │  └─ prisma7-client.md
   │     │  └─ SKILL.md
   │     └─ prisma-upgrade-v7
   │        ├─ references
   │        │  ├─ accelerate-users.md
   │        │  ├─ driver-adapters.md
   │        │  ├─ env-variables.md
   │        │  ├─ esm-support.md
   │        │  ├─ prisma-config.md
   │        │  ├─ removed-features.md
   │        │  └─ schema-changes.md
   │        └─ SKILL.md
   ├─ .windsurf
   │  └─ skills
   │     ├─ prisma-cli
   │     │  ├─ references
   │     │  │  ├─ agent-safety.md
   │     │  │  ├─ complete.md
   │     │  │  ├─ db-execute.md
   │     │  │  ├─ db-pull.md
   │     │  │  ├─ db-push.md
   │     │  │  ├─ db-seed.md
   │     │  │  ├─ debug.md
   │     │  │  ├─ dev.md
   │     │  │  ├─ format.md
   │     │  │  ├─ generate.md
   │     │  │  ├─ init.md
   │     │  │  ├─ mcp.md
   │     │  │  ├─ migrate-deploy.md
   │     │  │  ├─ migrate-dev.md
   │     │  │  ├─ migrate-diff.md
   │     │  │  ├─ migrate-reset.md
   │     │  │  ├─ migrate-resolve.md
   │     │  │  ├─ migrate-status.md
   │     │  │  ├─ studio.md
   │     │  │  └─ validate.md
   │     │  └─ SKILL.md
   │     ├─ prisma-client-api
   │     │  ├─ references
   │     │  │  ├─ client-methods.md
   │     │  │  ├─ constructor.md
   │     │  │  ├─ filters.md
   │     │  │  ├─ model-queries.md
   │     │  │  ├─ query-options.md
   │     │  │  ├─ raw-queries.md
   │     │  │  ├─ relations.md
   │     │  │  └─ transactions.md
   │     │  └─ SKILL.md
   │     ├─ prisma-compute
   │     │  ├─ references
   │     │  │  ├─ app-deploy-cli.md
   │     │  │  ├─ compute-config.md
   │     │  │  ├─ create-prisma.md
   │     │  │  ├─ frameworks.md
   │     │  │  ├─ sdk-api.md
   │     │  │  └─ troubleshooting.md
   │     │  └─ SKILL.md
   │     ├─ prisma-database-setup
   │     │  ├─ references
   │     │  │  ├─ cockroachdb.md
   │     │  │  ├─ mongodb.md
   │     │  │  ├─ mysql.md
   │     │  │  ├─ postgresql.md
   │     │  │  ├─ prisma-client-setup.md
   │     │  │  ├─ prisma-postgres.md
   │     │  │  ├─ sqlite.md
   │     │  │  └─ sqlserver.md
   │     │  └─ SKILL.md
   │     ├─ prisma-driver-adapter-implementation
   │     │  └─ SKILL.md
   │     ├─ prisma-mongodb-upgrade
   │     │  ├─ references
   │     │  │  ├─ client-api-mapping.md
   │     │  │  ├─ decision-stay-or-migrate.md
   │     │  │  ├─ migrations-mapping.md
   │     │  │  ├─ schema-contract-mapping.md
   │     │  │  └─ verify-cutover-checklist.md
   │     │  └─ SKILL.md
   │     ├─ prisma-postgres
   │     │  ├─ references
   │     │  │  ├─ console-and-connections.md
   │     │  │  ├─ create-db-cli.md
   │     │  │  ├─ management-api-sdk.md
   │     │  │  └─ management-api.md
   │     │  └─ SKILL.md
   │     ├─ prisma-postgres-setup
   │     │  ├─ references
   │     │  │  ├─ api-basics.md
   │     │  │  ├─ auth.md
   │     │  │  ├─ endpoints.md
   │     │  │  └─ prisma7-client.md
   │     │  └─ SKILL.md
   │     └─ prisma-upgrade-v7
   │        ├─ references
   │        │  ├─ accelerate-users.md
   │        │  ├─ driver-adapters.md
   │        │  ├─ env-variables.md
   │        │  ├─ esm-support.md
   │        │  ├─ prisma-config.md
   │        │  ├─ removed-features.md
   │        │  └─ schema-changes.md
   │        └─ SKILL.md
   ├─ agents
   │  ├─ fallbackRules.js
   │  └─ recoveryAgents.js
   ├─ app.js
   ├─ config
   │  ├─ passport.js
   │  └─ prisma.js
   ├─ controllers
   │  ├─ aiDecisionController.js
   │  ├─ analyticsController.js
   │  ├─ auditController.js
   │  ├─ authController.js
   │  ├─ policyController.js
   │  ├─ recoveryController.js
   │  └─ transactionController.js
   ├─ docker-compose.yml
   ├─ middleware
   │  ├─ authMiddleware.js
   │  ├─ errorMiddleware.js
   │  └─ validate.js
   ├─ models
   ├─ package-lock.json
   ├─ package.json
   ├─ policies
   │  └─ recoveryPolicy.js
   ├─ prisma
   │  ├─ migrations
   │  │  ├─ 20260828133239_init
   │  │  │  └─ migration.sql
   │  │  ├─ 20260829094618_add_google_id_to_merchant
   │  │  │  └─ migration.sql
   │  │  ├─ 20260829160541_add_failure_reason_enum
   │  │  │  └─ migration.sql
   │  │  └─ migration_lock.toml
   │  ├─ README.MD
   │  ├─ schema.prisma
   │  └─ seed.js
   ├─ prisma7.config.ts
   ├─ routes
   │  ├─ aiDecisionRoutes.js
   │  ├─ analyticsRoutes.js
   │  ├─ auditRoutes.js
   │  ├─ authRoutes.js
   │  ├─ policyRoutes.js
   │  ├─ recoveryRoutes.js
   │  └─ transactionRoutes.js
   ├─ schemas
   │  └─ recoveryDecisionSchema.js
   ├─ services
   │  ├─ aiService.js
   │  ├─ analyticsService.js
   │  ├─ auditService.js
   │  ├─ paymentProvider.js
   │  ├─ paymentSimulator.js
   │  ├─ policyService.js
   │  └─ recoveryService.js
   ├─ skills-lock.json
   ├─ utils
   └─ validators
      └─ transactionValidator.js

```