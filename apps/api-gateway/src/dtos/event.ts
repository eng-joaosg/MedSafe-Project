export interface GatewayEvent {
  requestId: string;
  headers: Record<string, string>;
  body?: string;
}

export interface GatewayResponse {
  statusCode: number;
  body: string;
}
