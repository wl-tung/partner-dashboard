/**
 * Type definitions for Partner Dashboard E2E tests
 */

export enum UserRole {
  STORE_OWNER = 'Store Owner',
  MALL_ADMINISTRATOR = 'Mall Administrator',
  STORE_MANAGER = 'Store Manager',
  STAFF = 'Staff'
}

export enum OrderStatus {
  DRAFT = '下書き',
  PROCESSING = '処理中',
  COMPLETED = '完了',
  PENDING = '保留中',
  PARTIALLY_REFUNDED = '一部返金済み',
  REFUNDED = '返金済み',
  CANCELLED = 'キャンセル'
}

export enum AccountStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
  PENDING = 'Pending'
}

export interface User {
  email?: string;
  employeeCode?: string;
  password: string;
  role: UserRole;
  storeCode?: string;
  buildingCode?: string;
  locationCode?: string;
}

export interface Location {
  storeCode: string;
  buildingCode: string;
  locationCode: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  amount: number;
  date: string;
  items: OrderItem[];
  shippingAddress?: Address;
  billingAddress?: Address;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate?: string;
  status: 'Active' | 'Inactive' | 'VIP';
}

export interface Account {
  employeeCode: string;
  accountName: string;
  email: string;
  status: AccountStatus;
  role: UserRole;
  permissions: Permission[];
  createdAt: string;
}

export interface Permission {
  module: string;
  actions: string[];
  locations?: string[];
}

export interface Address {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  prefecture: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface DashboardMetrics {
  todayOrders: number;
  todayOrderAmount: number;
  todaySales: number;
  monthlyOrderAmount: number;
  monthlySales: number;
  newCustomers: number;
  unprocessedOrders: number;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  module: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  status: 'Success' | 'Failed' | 'Warning' | 'Info';
}

