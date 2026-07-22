/**
 * 业务类型定义
 */

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
}

export interface ApiHealth {
  status: string;
  worker: string;
  colo: string;
}

export interface ApiInfo {
  name: string;
  runtime: string;
  features: string[];
  colo: string;
  timestamp: string;
}

export interface ApiMe {
  authenticated: boolean;
  name?: string;
  email?: string;
}
