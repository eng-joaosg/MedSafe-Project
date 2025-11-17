export interface INotificationGateway {
  publish(message: Record<string, any>): Promise<void>;
}
