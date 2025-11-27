import * as fs from 'fs';
import * as path from 'path';
import { User, Order, Customer, Account } from '../types';

/**
 * Data Helper for managing test data
 */
export class DataHelper {
  private testDataPath: string;

  constructor() {
    this.testDataPath = path.resolve(__dirname, '../../test-data');
  }

  /**
   * Load JSON file
   */
  private loadJsonFile<T>(filename: string): T {
    const filePath = path.join(this.testDataPath, filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Test data file not found: ${filePath}`);
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent) as T;
  }

  /**
   * Get test users
   */
  getTestUsers(): { [key: string]: User } {
    try {
      return this.loadJsonFile<{ [key: string]: User }>('users.json');
    } catch (error) {
      // Return default users if file doesn't exist
      return {
        storeOwner: {
          email: process.env.TEST_USER_EMAIL,
          employeeCode: process.env.TEST_USER_EMPLOYEE_CODE,
          password: process.env.TEST_USER_PASSWORD || '',
          role: 'Store Owner' as any,
          storeCode: process.env.TEST_STORE_CODE || 'TKY001',
          buildingCode: process.env.TEST_BUILDING_CODE || 'TKY001-A',
          locationCode: process.env.TEST_LOCATION_CODE || 'TKY001-A-1B'
        },
        admin: {
          email: process.env.ADMIN_USER_EMAIL,
          employeeCode: process.env.ADMIN_USER_EMPLOYEE_CODE,
          password: process.env.ADMIN_USER_PASSWORD || '',
          role: 'Mall Administrator' as any,
          storeCode: process.env.TEST_STORE_CODE || 'TKY001',
          buildingCode: process.env.TEST_BUILDING_CODE || 'TKY001-A',
          locationCode: process.env.TEST_LOCATION_CODE || 'TKY001-A-1B'
        }
      };
    }
  }

  /**
   * Get test data
   */
  getTestData(): any {
    try {
      return this.loadJsonFile<any>('test-data.json');
    } catch (error) {
      return {};
    }
  }

  /**
   * Generate random email
   */
  generateRandomEmail(prefix: string = 'test'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}-${timestamp}-${random}@example.com`;
  }

  /**
   * Generate random employee code
   */
  generateRandomEmployeeCode(prefix: string = 'EMP'): string {
    const random = Math.floor(Math.random() * 100000);
    return `${prefix}${random.toString().padStart(5, '0')}`;
  }

  /**
   * Generate random order number
   */
  generateRandomOrderNumber(prefix: string = 'ORD'): string {
    const timestamp = Date.now();
    return `${prefix}-${timestamp}`;
  }

  /**
   * Get current date in YYYY-MM-DD format
   */
  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get date N days ago
   */
  getDateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get date N days from now
   */
  getDateDaysFromNow(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Generate random Japanese name
   */
  generateRandomJapaneseName(): string {
    const firstNames = ['太郎', '花子', '次郎', '美咲', '健太', 'さくら'];
    const lastNames = ['田中', '佐藤', '鈴木', '高橋', '渡辺', '伊藤'];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${lastName} ${firstName}`;
  }

  /**
   * Generate random phone number (Japanese format)
   */
  generateRandomPhoneNumber(): string {
    const areaCode = ['03', '06', '090'];
    const selectedArea = areaCode[Math.floor(Math.random() * areaCode.length)];
    const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return `${selectedArea}-${number.substring(0, 4)}-${number.substring(4)}`;
  }
}

