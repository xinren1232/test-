import type { InventoryItem } from '../types/models';
import { materialSupplierMapping } from '../data/material_supplier_mapping.js';

// --- Type Definitions for data structures ---
interface MaterialInfo {
  name: string;
  suppliers: string[];
  code_prefix: string;
  unit: string;
  shelf_life_months: number;
}

interface CategoryInfo {
  category: string;
  materials: MaterialInfo[];
}

// --- Helper Functions ---
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

// --- Main Data Generator ---
export class DataGenerator {
  
  static generateInventoryData(options: { count: number }): InventoryItem[] {
    const items: InventoryItem[] = [];
    const today = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);

    const categories: CategoryInfo[] = Object.values(materialSupplierMapping);

    for (let i = 0; i < options.count; i++) {
      const category = getRandomElement(categories);
      const materialInfo = getRandomElement(category.materials);
      const supplier = getRandomElement(materialInfo.suppliers);
      
      const receiveDateStr = getRandomDate(ninetyDaysAgo, today);
      const receiveDate = new Date(receiveDateStr);
      
      const batchNumber = `B-${receiveDateStr.replace(/-/g, '')}-${getRandomNumber(100, 999)}`;
      
      const expirationDate = new Date(receiveDate);
      expirationDate.setMonth(expirationDate.getMonth() + materialInfo.shelf_life_months);

      const hasFailedInspection = Math.random() < 0.15;
      const hasFailedTest = !hasFailedInspection && Math.random() < 0.2;

      const item: InventoryItem = {
        id: `${batchNumber}-${materialInfo.code_prefix}-${getRandomNumber(1000, 9999)}`,
        materialCode: `${materialInfo.code_prefix}${getRandomNumber(1000, 9999)}`,
        materialName: materialInfo.name,
        quantity: getRandomNumber(100, 5000),
        unit: materialInfo.unit,
        storageLocation: `W${getRandomNumber(1, 5)}-R${getRandomNumber(1, 20)}-P${getRandomNumber(1, 10)}`,
        supplier,
        batchNumber,
        receiveDate: receiveDateStr,
        expirationDate: expirationDate.toISOString().split('T')[0],
        status: 'normal',
        inspectionStatus: hasFailedInspection ? 'failed' : 'passed',
        lastInspectionDate: getRandomDate(receiveDate, today),
        notes: hasFailedInspection ? 'Initial inspection failed.' : 'OK',
        materialCategory: category.category,
        
        ...this.generateRelatedData(hasFailedInspection, hasFailedTest, receiveDate, today)
      };
      
      items.push(item);
    }
    return items;
  }

  private static generateRelatedData(hasFailedInspection: boolean, hasFailedTest: boolean, receiveDate: Date, today: Date) {
    if (hasFailedInspection) {
      return { testStatus: 'Untested' as const };
    }

    const testStatus = hasFailedTest ? ('Fail' as const) : ('Pass' as const);
    
    // Test date is between receive date and today
    const testDate = getRandomDate(receiveDate, today);
    const onlineDate = hasFailedTest ? undefined : getRandomDate(new Date(testDate), new Date(new Date(testDate).getTime() + 14 * 24 * 60 * 60 * 1000));

    return {
      testStatus,
      testDate,
      testOperator: `Tech-${getRandomNumber(1, 5)}`,
      testDefectDescription: hasFailedTest ? getRandomElement(['性能不达标', '尺寸超差', '外观缺陷']) : undefined,
      onlineDate,
      factory: hasFailedTest ? undefined : getRandomElement(['深圳工厂', '重庆工厂', '南昌工厂']),
    };
  }
} 