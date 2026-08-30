```
Project: RecoverAI

Problem Statement

Failed payments and payment-related disruptions cause merchants to lose otherwise recoverable revenue. Existing systems often treat every payment failure similarly—retrying when they shouldn't, failing to follow up when they should, or requiring manual intervention.
RecoverAI is an AI-powered revenue recovery agent that identifies revenue at risk, analyzes the reason for payment failure, determines the most appropriate recovery strategy, and executes a controlled recovery workflow.
The system can:

Detect revenue at risk from failed/abandoned transactions.

Analyze the failure reason using AI.

Determine the best recovery action — retry, payment reminder, payment-method update, escalation, or no action.

Apply safety/business rules before executing an action.

Execute the recovery workflow through Razorpay test-mode APIs / simulated transactions.

Track the outcome and calculate actual recovered revenue.

Maintain an audit trail of every AI decision and action.

Fall back to deterministic rules when the AI service is unavailable.

Example



Payment Failed
      ↓
₹4,999 | UPI | Bank Timeout
      ↓
AI Analysis
      ↓
Temporary failure
      ↓
Recovery probability: 91%
      ↓
Policy Check
      ↓
Retry allowed
      ↓
Retry Payment
      ↓
SUCCESS ✅
      ↓
₹4,999 Recovered

Whereas:



₹12,500 | Card | Insufficient Funds
              ↓
          AI Analysis
              ↓
       Retry NOT recommended
              ↓
       Send Payment Reminder
              ↓
        Customer retries
              ↓
          Recovered ✅



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
   └─ validators
      └─ transactionValidator.js

```
