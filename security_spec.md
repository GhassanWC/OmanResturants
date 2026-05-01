# Restaurant Souq Security Specification

## Data Invariants
1. A restaurant must have a valid `ownerId` matching the creator's UID.
2. Only Admins can set `isApproved` or `isFeatured` to true.
3. Users cannot change their own `role`.
4. Reviews must belong to an existing restaurant and have a 1-5 rating.
5. Soft state transitions for advertising plans (limited to specific plans).

## Dirty Dozen Payloads (Target: Permission Denied)

1. **Identity Spoofing**: Create restaurant with someone else's `ownerId`.
2. **Privilege Escalation**: Update user profile to set `role: 'admin'`.
3. **Ghost Fields**: Create restaurant with undocumented `isApproved: true`.
4. **Bypass Approval**: Owner trying to approve their own restaurant.
5. **Orphaned Writes**: Create a review for a non-existent restaurant.
6. **Value Poisoning**: Set restaurant rating to `99`.
7. **Resource Poisoning**: Set restaurant description to a 2MB string.
8. **PII Leak**: Unauthorized read of private user data (handled by separation if we had private subcoll).
9. **State Shortcutting**: Change restaurant plan from `free` to `homepage_featured` without payment record (in rules: restrict `plan` field update to admin or verified payment flag).
10. **Malicious ID**: Use a 2KB string as `documentId`.
11. **Spoofed Timestamps**: Provide a client-side `createdAt` date.
12. **Duplicate Reviews**: (Handled by client, but rules should restrict `userId` consistency).

## Rules Deployment Plan
1. Draft rules with helpers.
2. Implement `isValid[Id]` and `isValid[Entity]` logic.
3. Enforce strict key checks on create/update.
4. Block PII reads.
