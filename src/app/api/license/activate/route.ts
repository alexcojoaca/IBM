import { activateLicense } from "@/lib/license-server";
import { corsPreflight, jsonErr, jsonOk } from "@/lib/api-cors";

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.license_key || !body?.device_fingerprint) {
      return jsonErr("license_key and device_fingerprint required");
    }
    const info = await activateLicense({
      license_key: body.license_key,
      device_fingerprint: body.device_fingerprint,
      device_name: body.device_name,
    });
    return jsonOk(info);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Activation failed";
    const status = msg.includes("Missing") ? 500 : 400;
    return jsonErr(msg, status);
  }
}
