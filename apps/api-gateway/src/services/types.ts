export interface LambdaEvent {
  requestId?: string;
  headers?: Record<string, string>;
  action?: string;
  body?: any;
}
