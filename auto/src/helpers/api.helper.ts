import { APIRequestContext, APIResponse } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * API Helper for making HTTP requests
 */
export class ApiHelper {
  private request: APIRequestContext;
  private baseURL: string;

  constructor(request: APIRequestContext) {
    this.request = request;
    this.baseURL = process.env.API_BASE_URL || process.env.BASE_URL || '';
  }

  /**
   * Make GET request
   */
  async get(endpoint: string, headers?: Record<string, string>): Promise<APIResponse> {
    return await this.request.get(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
  }

  /**
   * Make POST request
   */
  async post(endpoint: string, data?: any, headers?: Record<string, string>): Promise<APIResponse> {
    return await this.request.post(`${this.baseURL}${endpoint}`, {
      data,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
  }

  /**
   * Make PATCH request
   */
  async patch(endpoint: string, data?: any, headers?: Record<string, string>): Promise<APIResponse> {
    return await this.request.patch(`${this.baseURL}${endpoint}`, {
      data,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
  }

  /**
   * Make DELETE request
   */
  async delete(endpoint: string, headers?: Record<string, string>): Promise<APIResponse> {
    return await this.request.delete(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
  }

  /**
   * Get orders from API
   */
  async getOrders(params?: { page?: number; limit?: number; status?: string }): Promise<APIResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `/api/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.get(endpoint);
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<APIResponse> {
    return await this.get(`/api/orders/${orderId}`);
  }

  /**
   * Search orders
   */
  async searchOrders(keyword: string): Promise<APIResponse> {
    return await this.get(`/api/orders/search?q=${encodeURIComponent(keyword)}`);
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string): Promise<APIResponse> {
    return await this.patch(`/api/orders/${orderId}/status`, { status });
  }

  /**
   * Get customers from API
   */
  async getCustomers(params?: { page?: number; limit?: number }): Promise<APIResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/api/customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.get(endpoint);
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string): Promise<APIResponse> {
    return await this.get(`/api/customers/${customerId}`);
  }

  /**
   * Get system logs
   */
  async getSystemLogs(params?: { startDate?: string; endDate?: string; module?: string }): Promise<APIResponse> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.module) queryParams.append('module', params.module);

    const endpoint = `/api/system/logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.get(endpoint);
  }

  /**
   * Get accounts
   */
  async getAccounts(params?: { page?: number; limit?: number }): Promise<APIResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/api/accounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.get(endpoint);
  }
}

