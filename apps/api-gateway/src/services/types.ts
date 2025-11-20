export interface LambdaEvent {
  requestId?: string;
  headers?: Record<string, string>;
  action: string;
  body?: any;
}

export interface LambdaResponse {
  id: string;
  statusCode: number;
  message: string;
  body?: any;
}
