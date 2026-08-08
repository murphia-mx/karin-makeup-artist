export interface ISystemRepository {
  /**
   * Logs an action performed by an administrator for auditing purposes.
   * @param userId The ID of the admin performing the action
   * @param action The action performed (e.g., 'approve_review', 'reject_review')
   * @param entityType The type of entity modified (e.g., 'review')
   * @param entityId The ID of the entity modified
   * @param payload Additional metadata or payload associated with the action
   */
  logAuditAction(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    payload?: any
  ): Promise<void>;

  /**
   * Creates a system event that can be displayed in the dashboard activity feed.
   * @param type The type of event (e.g., 'review_approved', 'system_alert')
   * @param title The title of the event
   * @param description Detailed description of the event
   * @param metadata Optional metadata
   */
  createSystemEvent(
    type: string,
    title: string,
    description?: string,
    metadata?: any
  ): Promise<void>;
}
