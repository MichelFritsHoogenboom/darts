import { getDatabase } from "./schema";
import { DatabaseService } from "./DatabaseService";

export abstract class BaseService<
  T extends { id: string; createdAt: Date; updatedAt: Date }
> {
  protected abstract getTableName(): string;

  protected async getTable() {
    await DatabaseService.ensureDatabase();
    const db = getDatabase();
    return (db as any)[this.getTableName()];
  }

  async upsert(entity: T): Promise<T> {
    const table = await this.getTable();
    return await DatabaseService.upsert<T>(table, entity);
  }

  async get(id: string): Promise<T | undefined> {
    const table = await this.getTable();
    return await table.get(id);
  }

  async getAll(): Promise<T[]> {
    const table = await this.getTable();
    return await table.toArray();
  }

  async delete(id: string): Promise<void> {
    const table = await this.getTable();
    await table.delete(id);
  }

  async search(query: string, searchFields: string[]): Promise<T[]> {
    const table = await this.getTable();
    return await table
      .filter((entity: any) => {
        return searchFields.some((field) =>
          entity[field]?.toString().toLowerCase().includes(query.toLowerCase())
        );
      })
      .toArray();
  }
}
