import { InventoryItem } from '../types/models';
import { DataGenerator } from './DataGenerator';

const STORAGE_KEY = 'iqe_inventory'; // The single source of truth

// A simple in-memory cache to avoid reading from localStorage repeatedly
let inventoryCache: InventoryItem[] | null = null;

class UnifiedDataService {
  private async loadAndStandardizeData(): Promise<InventoryItem[]> {
    if (inventoryCache) {
      // Return a deep copy to prevent mutations from affecting the cache
      return JSON.parse(JSON.stringify(inventoryCache));
    }

    try {
      const rawData = localStorage.getItem(STORAGE_KEY);
      const parsedData: InventoryItem[] = rawData ? JSON.parse(rawData) : [];
      inventoryCache = parsedData;
      // Return a deep copy
      return JSON.parse(JSON.stringify(inventoryCache));
    } catch (error) {
      console.error("Failed to load or parse inventory data from localStorage", error);
      return []; // Return empty array on error
    }
  }

  public async getInventoryData(): Promise<InventoryItem[]> {
    return this.loadAndStandardizeData();
  }

  public async getOnlineData(): Promise<InventoryItem[]> {
    const allData = await this.loadAndStandardizeData();
    // Online data is defined as inventory items that have an online date.
    return allData.filter(item => !!item.onlineDate);
  }

  public async getLabData(): Promise<InventoryItem[]> {
    const allData = await this.loadAndStandardizeData();
    // Lab data is defined as items that have been tested.
    return allData.filter(item => item.testStatus !== 'Untested');
  }

  public async generateAndSaveData(options: { count: number; clearExisting: boolean }): Promise<void> {
    const newItems = DataGenerator.generateInventoryData({ count: options.count });
    
    if (options.clearExisting) {
      this.saveData(newItems);
      return;
    }
    
    const existingItems = await this.loadAndStandardizeData();
    const combinedItems = [...existingItems, ...newItems];
    this.saveData(combinedItems);
  }

  public async clearAllData(): Promise<void> {
    this.saveData([]);
  }

  public async updateItem(itemToUpdate: InventoryItem): Promise<void> {
    // Invalidate cache before update, forcing a re-read from storage
    this.clearCache();
    const items = await this.loadAndStandardizeData();
    const index = items.findIndex(item => item.id === itemToUpdate.id);

    if (index !== -1) {
      items[index] = { ...items[index], ...itemToUpdate };
    } else {
      // If item doesn't exist, add it.
      items.push(itemToUpdate);
    }
    
    this.saveData(items);
  }

  private saveData(data: InventoryItem[]): void {
    try {
      // Create a deep copy to ensure cache is not just a reference to the saved object
      const dataToSave = JSON.parse(JSON.stringify(data));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      inventoryCache = dataToSave; // Update cache
    } catch (error) {
      console.error("Failed to save inventory data to localStorage", error);
    }
  }

  public clearCache(): void {
    inventoryCache = null;
  }
}

export default new UnifiedDataService(); 