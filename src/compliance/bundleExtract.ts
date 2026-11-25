import JSZip from "jszip";
import { API_BASE_URL } from "@/config";
import { apiFetch } from "@/api/client";

function safeFilename(name: string): string {
  return name.replace(/[^\w.\-]+/g, "_");
}

async function fetchBytes(path: string, token: string): Promise<ArrayBuffer> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }
  return res.arrayBuffer();
}

export async function buildComplianceZip(
  token: string,
  messageIds: number[],
  onProgress?: (label: string) => void,
): Promise<Blob> {
  const zip = new JSZip();
  const manifest: Record<string, unknown> = {
    bundle_version: 1,
    generated_at: new Date().toISOString(),
    api_base_url: API_BASE_URL,
    messages: [] as unknown[],
  };

  for (const messageId of messageIds) {
    onProgress?.(`Message ${messageId}`);
    const payload = await apiFetch<{ data: Record<string, unknown> }>(
      `/dm/compliance/extract/${messageId}`,
      token,
    );
    const data = payload.data;
    const folder = zip.folder(`messages/${messageId}`);
    if (!folder) {
      continue;
    }
    folder.file("message.json", JSON.stringify(data, null, 2));
    const files = (data.files as Record<string, unknown>[]) || [];
    const filesDir = folder.folder("files");
    for (const meta of files) {
      const path = String(meta.path || "");
      if (!path) {
        continue;
      }
      const bytes = await fetchBytes(path, token);
      const name = safeFilename(String(meta.name || "file"));
      filesDir?.file(`${messageId}_${meta.id || "x"}_${name}.enc`, bytes);
    }
    (manifest.messages as { message_id: number }[]).push({ message_id: messageId });
  }

  zip.file("bundle.json", JSON.stringify(manifest, null, 2));
  return zip.generateAsync({ type: "blob" });
}

export async function listComplianceMessageIds(token: string): Promise<number[]> {
  const rows = await apiFetch<{ id: number }[]>("/dm/owner/compliance-view", token);
  return rows.map((row) => row.id);
}