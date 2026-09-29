export const AUDIT_ACTION_LABELS: Record<string, string> = {
  'memo.created': 'Memo added',
}

export function getAuditLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action] ?? action
}
