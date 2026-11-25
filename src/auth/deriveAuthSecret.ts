export async function deriveAuthSecret(username: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = encoder.encode(`fromchat.user:${username}`);
  const ikm = encoder.encode(password);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    salt,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const prk = new Uint8Array(await crypto.subtle.sign("HMAC", baseKey, ikm));

  const expandKey = await crypto.subtle.importKey(
    "raw",
    prk,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const info = encoder.encode("auth-secret");
  let previous = new Uint8Array(0);
  let counter = 1;
  const out = new Uint8Array(32);
  let written = 0;
  while (written < 32) {
    const payload = new Uint8Array(previous.length + info.length + 1);
    payload.set(previous, 0);
    payload.set(info, previous.length);
    payload[payload.length - 1] = counter;
    previous = new Uint8Array(await crypto.subtle.sign("HMAC", expandKey, payload));
    const take = Math.min(previous.length, 32 - written);
    out.set(previous.subarray(0, take), written);
    written += take;
    counter += 1;
  }
  let binary = "";
  for (let i = 0; i < out.length; i += 1) {
    binary += String.fromCharCode(out[i]);
  }
  return btoa(binary);
}