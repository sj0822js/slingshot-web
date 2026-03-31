"use client";

type StateKey = "admin" | "ingredients" | "pricing" | "recipes" | "healthcheck" | "analytics";

type PersistEnvelope<T> = {
  data: T;
  updatedAt: string;
};

type RemoteRow<T> = {
  key: StateKey;
  value: T;
  updated_at: string;
};

export type RemoteStateCheckResult = {
  checkedAt: string;
  enabled: boolean;
  ok: boolean;
  message: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const isRemoteEnabled = Boolean(SUPABASE_URL && SUPABASE_PUBLIC_KEY);

const getLocalEnvelope = <T>(storageKey: string, legacyReader?: () => T): PersistEnvelope<T> | null => {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistEnvelope<T> | T;
      if (parsed && typeof parsed === "object" && "data" in parsed && "updatedAt" in parsed) {
        return parsed as PersistEnvelope<T>;
      }

      return {
        data: parsed as T,
        updatedAt: new Date(0).toISOString(),
      };
    }
  } catch {
    return null;
  }

  if (!legacyReader) {
    return null;
  }

  try {
    return {
      data: legacyReader(),
      updatedAt: new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
};

const setLocalEnvelope = <T>(storageKey: string, envelope: PersistEnvelope<T>) => {
  window.localStorage.setItem(storageKey, JSON.stringify(envelope));
};

const fetchRemoteEnvelope = async <T>(key: StateKey): Promise<PersistEnvelope<T> | null> => {
  if (!isRemoteEnabled) {
    return null;
  }

  const response = await fetch(
        `${SUPABASE_URL}/rest/v1/app_state?key=eq.${key}&select=key,value,updated_at`,
    {
      headers: {
        apikey: SUPABASE_PUBLIC_KEY!,
        Authorization: `Bearer ${SUPABASE_PUBLIC_KEY!}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch remote ${key} state`);
  }

  const rows = (await response.json()) as RemoteRow<T>[];
  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    data: row.value,
    updatedAt: row.updated_at,
  };
};

const pushRemoteEnvelope = async <T>(key: StateKey, envelope: PersistEnvelope<T>) => {
  if (!isRemoteEnabled) {
    return;
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/app_state?on_conflict=key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_PUBLIC_KEY!,
      Authorization: `Bearer ${SUPABASE_PUBLIC_KEY!}`,
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify([
      {
        key,
        value: envelope.data,
        updated_at: envelope.updatedAt,
      },
    ]),
  });

  if (!response.ok) {
    throw new Error(`Failed to persist remote ${key} state`);
  }
};

const newerEnvelope = <T>(local: PersistEnvelope<T> | null, remote: PersistEnvelope<T> | null) => {
  if (!local) {
    return remote;
  }

  if (!remote) {
    return local;
  }

  return new Date(remote.updatedAt).getTime() > new Date(local.updatedAt).getTime() ? remote : local;
};

export const createEnvelope = <T>(data: T): PersistEnvelope<T> => ({
  data,
  updatedAt: new Date().toISOString(),
});

export const loadAppState = async <T>(
  key: StateKey,
  storageKey: string,
  fallbackData: T,
  options?: {
    legacyReader?: () => T;
  }
): Promise<PersistEnvelope<T>> => {
  const local = getLocalEnvelope<T>(storageKey, options?.legacyReader);

  if (!isRemoteEnabled) {
    const localOnly = local ?? createEnvelope(fallbackData);
    setLocalEnvelope(storageKey, localOnly);
    return localOnly;
  }

  try {
    const remote = await fetchRemoteEnvelope<T>(key);
    const latest = newerEnvelope(local, remote) ?? createEnvelope(fallbackData);

    setLocalEnvelope(storageKey, latest);

    if (!remote || latest.updatedAt !== remote.updatedAt) {
      await pushRemoteEnvelope(key, latest);
    }

    return latest;
  } catch {
    const localOnly = local ?? createEnvelope(fallbackData);
    setLocalEnvelope(storageKey, localOnly);
    return localOnly;
  }
};

export const saveAppState = async <T>(key: StateKey, storageKey: string, data: T) => {
  const envelope = createEnvelope(data);
  setLocalEnvelope(storageKey, envelope);

  if (!isRemoteEnabled) {
    return envelope;
  }

  try {
    await pushRemoteEnvelope(key, envelope);
  } catch {
    return envelope;
  }

  return envelope;
};

export const isRemoteStateEnabled = () => isRemoteEnabled;

export const verifyRemoteState = async (): Promise<RemoteStateCheckResult> => {
  try {
    const response = await fetch("/api/storage-health", {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        checkedAt: new Date().toISOString(),
        enabled: isRemoteEnabled,
        ok: false,
        message: `점검 API 호출 실패: ${response.status}`,
      };
    }

    return (await response.json()) as RemoteStateCheckResult;
  } catch (error) {
    return {
      checkedAt: new Date().toISOString(),
      enabled: isRemoteEnabled,
      ok: false,
      message: error instanceof Error ? error.message : "Supabase 연결 점검에 실패했습니다",
    };
  }
};
