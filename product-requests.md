# Product Requests

## 1. Freeze and Seize

The ops team needs the ability to freeze and unfreeze customer accounts when suspicious activity is detected. You may notice that some accounts in the system are already marked as **FROZEN**, but there is currently no way to freeze or unfreeze an account through the app. The data model supports the status, but the workflow to change it does *not* exist yet.

Your job is to build that workflow. A supervisor should be able to freeze an active account with a required reason, and unfreeze a frozen account with a required reason. The action should be reflected immediately in the UI, and the reason should be visible to all users on the account detail page. Analysts can see that an account is frozen and why, but they cannot take action themselves.

**This is your product request. Everything else — from the data model changes, the API surface, the UI, the edge cases, the audit requirements — is up to your spec.**



## 2. The Stakeout

The ops team reviews transactions daily, but they have no way to flag a suspicious transaction for follow-up or route it to a review queue. When an analyst spots something unusual, (could be a pattern of wire transfers, an unusual large payment, a possible duplicate, etc.), they currently have no option but to mention it verbally to a supervisor and hope it gets addressed. There is no formal mechanism to track it. 

Your job is to build that mechanism. An analyst should be able to flag a transaction as suspicious with a **required reason**. Flagged transactions should be surfaced in a way that supervisors can review and resolve them. A supervisor resolving a flag should be a deliberate action, not just a deletion. 

**This is your product request. Everything else — from the data model changes, the API surface, the UI, the edge cases, the audit requirements — is up to your spec.**