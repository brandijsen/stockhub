const DEFAULT_BUCKET = "stockhub";

function projectUrl(): string | undefined {
  const explicit = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  if (explicit) {
    return explicit;
  }
  const db = process.env.DATABASE_URL ?? "";
  const match = db.match(/postgres\.([a-z0-9]+)/i);
  if (!match) {
    return undefined;
  }
  return `https://${match[1]}.supabase.co`;
}

function serviceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || undefined;
}

function bucketName(): string {
  return process.env.SUPABASE_STORAGE_BUCKET?.trim() || DEFAULT_BUCKET;
}

export function storageConfigured(): boolean {
  return Boolean(projectUrl() && serviceRoleKey());
}

function authHeaders(): Record<string, string> {
  const key = serviceRoleKey();
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return {
    Authorization: `Bearer ${key}`,
    apikey: key,
  };
}

let bucketReady: Promise<void> | null = null;

function ensureBucket(): Promise<void> {
  if (!bucketReady) {
    bucketReady = createBucketIfNeeded().catch((error) => {
      bucketReady = null;
      throw error;
    });
  }
  return bucketReady;
}

async function createBucketIfNeeded(): Promise<void> {
  const base = projectUrl();
  if (!base) {
    throw new Error("SUPABASE_URL is not set");
  }
  const id = bucketName();
  const res = await fetch(`${base}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, name: id, public: true }),
  });
  if (res.ok || res.status === 409) {
    return;
  }
  const text = await res.text();
  if (/already exists/i.test(text)) {
    return;
  }
  throw new Error(`Storage bucket failed: ${res.status} ${text}`);
}

export async function uploadPublicObject(
  objectPath: string,
  buffer: Buffer,
  mime: string,
): Promise<string> {
  const base = projectUrl();
  if (!base) {
    throw new Error("SUPABASE_URL is not set");
  }
  await ensureBucket();
  const bucket = bucketName();
  const res = await fetch(
    `${base}/storage/v1/object/${bucket}/${objectPath}`,
    {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": mime,
        "x-upsert": "true",
      },
      body: new Uint8Array(buffer),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Storage upload failed: ${res.status} ${text}`);
  }
  return `${base}/storage/v1/object/public/${bucket}/${objectPath}?v=${Date.now()}`;
}

export function objectPathFromStored(stored: string): string | null {
  if (!stored.startsWith("http")) {
    return stored.replace(/^\/+/, "");
  }
  try {
    const url = new URL(stored);
    const marker = `/object/public/${bucketName()}/`;
    const index = url.pathname.indexOf(marker);
    if (index === -1) {
      return null;
    }
    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

export async function deleteStoredObject(stored: string): Promise<void> {
  if (!storageConfigured()) {
    return;
  }
  const objectPath = objectPathFromStored(stored);
  if (!objectPath) {
    return;
  }
  const base = projectUrl();
  if (!base) {
    return;
  }
  const res = await fetch(
    `${base}/storage/v1/object/${bucketName()}/${objectPath}`,
    { method: "DELETE", headers: authHeaders() },
  );
  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    console.error(`Storage delete failed: ${res.status} ${text}`);
  }
}
