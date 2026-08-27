import { getDatabase } from "~/database/schema";

export const DB_EXPORT_FORMAT = "darts-db-export";
export const DB_EXPORT_VERSION = 1;

const TABLE_NAMES = [
  "players",
  "competitions",
  "competitionEditions",
  "matches",
  "sets",
  "legs",
  "playerLegs",
  "scores",
  "singleDartScores",
  "playerStats",
] as const;

const DATE_KEYS = new Set(["createdAt", "updatedAt", "birthDate"]);

export type DbExportTableName = (typeof TABLE_NAMES)[number];

export type SerializedBlob = {
  __type: "Blob";
  mimeType: string;
  data: string;
};

export type DbExportPayload = {
  format: typeof DB_EXPORT_FORMAT;
  version: number;
  dbName: string;
  schemaVersion: number;
  exportedAt: string;
  tables: Partial<Record<DbExportTableName, unknown[]>>;
};

const isSerializedBlob = (value: unknown): value is SerializedBlob =>
  typeof value === "object" &&
  value !== null &&
  (value as SerializedBlob).__type === "Blob" &&
  typeof (value as SerializedBlob).data === "string";

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read blob as data URL"));
        return;
      }
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("Failed to extract base64 from data URL"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("Blob read failed"));
    reader.readAsDataURL(blob);
  });

const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
};

const serializeValue = async (value: unknown): Promise<unknown> => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Blob) {
    const serialized: SerializedBlob = {
      __type: "Blob",
      mimeType: value.type || "application/octet-stream",
      data: await blobToBase64(value),
    };
    return serialized;
  }

  if (Array.isArray(value)) {
    return Promise.all(value.map(serializeValue));
  }

  if (value !== null && typeof value === "object") {
    const entries = await Promise.all(
      Object.entries(value as Record<string, unknown>).map(
        async ([key, nested]) => [key, await serializeValue(nested)] as const,
      ),
    );
    return Object.fromEntries(entries);
  }

  return value;
};

const deserializeValue = (value: unknown, key?: string): unknown => {
  if (isSerializedBlob(value)) {
    return base64ToBlob(
      value.data,
      value.mimeType || "application/octet-stream",
    );
  }

  if (typeof value === "string" && key && DATE_KEYS.has(key)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => deserializeValue(item));
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(
        ([nestedKey, nested]) => [
          nestedKey,
          deserializeValue(nested, nestedKey),
        ],
      ),
    );
  }

  return value;
};

const downloadJson = (payload: DbExportPayload, filename: string) => {
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const exportFilename = (exportedAt: Date) => {
  const yyyy = exportedAt.getFullYear();
  const mm = String(exportedAt.getMonth() + 1).padStart(2, "0");
  const dd = String(exportedAt.getDate()).padStart(2, "0");
  return `ADL-darts-database-${yyyy}-${mm}-${dd}.json`;
};

const pickJsonFile = (): Promise<File | null> =>
  new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.addEventListener("cancel", () => resolve(null));
    input.click();
  });

const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Failed to read file as text"));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("File read failed"));
    reader.readAsText(file);
  });

const parseExportPayload = (raw: string): DbExportPayload => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Selected file is not valid JSON");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    (parsed as DbExportPayload).format !== DB_EXPORT_FORMAT ||
    typeof (parsed as DbExportPayload).version !== "number" ||
    typeof (parsed as DbExportPayload).tables !== "object" ||
    (parsed as DbExportPayload).tables === null
  ) {
    throw new Error("Selected file is not a valid darts database export");
  }

  const payload = parsed as DbExportPayload;
  if (payload.version > DB_EXPORT_VERSION) {
    throw new Error(
      `Export version ${payload.version} is newer than supported version ${DB_EXPORT_VERSION}`,
    );
  }

  return payload;
};

export async function exportDatabaseAsJson(): Promise<void> {
  const db = getDatabase();
  await db.open();

  const tableEntries = await Promise.all(
    TABLE_NAMES.map(async (name) => {
      const rows = await db.table(name).toArray();
      const serializedRows = await Promise.all(rows.map(serializeValue));
      return [name, serializedRows] as const;
    }),
  );

  const exportedAt = new Date();
  const payload: DbExportPayload = {
    format: DB_EXPORT_FORMAT,
    version: DB_EXPORT_VERSION,
    dbName: db.name,
    schemaVersion: db.verno,
    exportedAt: exportedAt.toISOString(),
    tables: Object.fromEntries(tableEntries) as DbExportPayload["tables"],
  };

  downloadJson(payload, exportFilename(exportedAt));
}

export async function importDatabaseFromJson(): Promise<boolean> {
  const file = await pickJsonFile();
  if (!file) return false;

  const raw = await readFileAsText(file);
  const payload = parseExportPayload(raw);
  const db = getDatabase();
  await db.open();

  const tables = TABLE_NAMES.map((name) => db.table(name));

  await db.transaction("rw", tables, async () => {
    for (const name of TABLE_NAMES) {
      const table = db.table(name);
      await table.clear();
      const rows = (payload.tables[name] ?? []).map((row) =>
        deserializeValue(row),
      );
      if (rows.length > 0) {
        await table.bulkPut(rows);
      }
    }
  });

  return true;
}
