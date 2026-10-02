import { validateLicense } from "@/lib/license-server";
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
    const info = await validateLicense({
      license_key: body.license_key,
      device_fingerprint: body.device_fingerprint,
    });
    return jsonOk(info);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Validation failed";
    return jsonErr(msg, 400);
  }
}
