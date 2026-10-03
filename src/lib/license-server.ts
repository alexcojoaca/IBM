import { generateLicenseKey } from "@/lib/license";
import { createServiceClient } from "@/lib/supabase/admin";

export const LICENSE_PRICE_EUR = 150;
export const LICENSE_DAYS = 365;

export type LicenseRow = {
  id: string;
  user_id: string | null;
  license_key: string;
  key_prefix: string;
  plan: string;
  status: string;
  max_devices: number;
  expires_at: string | null;
};

function normalizeKey(key: string) {
  let k = key
    .trim()
    .toUpperCase()
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9-]/g, "");
  // Accept pasted keys without dashes: IBMXXXXXXXXXXXXXXXX → IBM-XXXX-XXXX-XXXX-XXXX
  const compact = k.replace(/-/g, "");
  if (/^IBM[A-Z0-9]{16}$/.test(compact)) {
    const body = compact.slice(3);
    k = `IBM-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}-${body.slice(12, 16)}`;
  }
  return k;
}

export async function issueLicenseForUser(userId: string, notes?: string) {
  const supabase = createServiceClient();
  const key = generateLicenseKey();
  const expires = new Date();
  expires.setDate(expires.getDate() + LICENSE_DAYS);

  const { data, error } = await supabase
    .from("licenses")
    .insert({
      user_id: userId,
      license_key: key,
      key_prefix: key.slice(0, 8),
      plan: "Professional",
      status: "active",
      max_devices: 1,
      expires_at: expires.toISOString(),
      notes: notes || "Purchase €150",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as LicenseRow;
}

async function deviceCount(licenseId: string) {
  const supabase = createServiceClient();
  const { count } = await supabase
    .from("license_devices")
    .select("id", { count: "exact", head: true })
    .eq("license_id", licenseId)
    .eq("is_active", true);
  return count || 0;
}

async function licensePayload(license: LicenseRow) {
  const supabase = createServiceClient();
  const used = await deviceCount(license.id);
  let full_name: string | null = null;
  let email: string | null = null;
  if (license.user_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", license.user_id)
      .maybeSingle();
    full_name = profile?.full_name || null;
    email = profile?.email || null;
  }
  return {
    id: license.id,
    key_prefix: license.key_prefix,
    plan: license.plan,
    status: license.status,
    max_devices: license.max_devices,
    devices_used: used,
    features: {},
    expires_at: license.expires_at,
    full_name,
    email,
    holder_name: full_name || email || "IBM Member",
  };
}

export async function activateLicense(input: {
  license_key: string;
  device_fingerprint: string;
  device_name?: string;
}) {
  const supabase = createServiceClient();
  const key = normalizeKey(input.license_key);
  const { data: license, error } = await supabase
    .from("licenses")
    .select("*")
    .eq("license_key", key)
    .maybeSingle();

  if (error) throw new Error(`License lookup failed: ${error.message}`);
  if (!license) {
    throw new Error(
      `Invalid license key (${key}). Copy it again from Dashboard → Licenses.`
    );
  }
  if (license.status !== "active") throw new Error(`License is ${license.status}`);
  if (license.expires_at && new Date(license.expires_at) < new Date()) {
    await supabase.from("licenses").update({ status: "expired" }).eq("id", license.id);
    throw new Error("License expired");
  }

  const { data: existing } = await supabase
    .from("license_devices")
    .select("*")
    .eq("license_id", license.id)
    .eq("device_fingerprint", input.device_fingerprint)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("license_devices")
      .update({
        is_active: true,
        last_seen_at: new Date().toISOString(),
        device_name: input.device_name || existing.device_name,
      })
      .eq("id", existing.id);
  } else {
    const used = await deviceCount(license.id);
    if (used >= license.max_devices) {
      // Auto-free oldest seats so a valid key can always reconnect from a new browser
      await supabase
        .from("license_devices")
        .update({ is_active: false })
        .eq("license_id", license.id)
        .eq("is_active", true);
      const usedAfter = await deviceCount(license.id);
      if (usedAfter >= license.max_devices) {
        throw new Error(
          "Device limit reached. Open Dashboard → Devices → Disconnect, then try again."
        );
      }
    }
    const { error: insErr } = await supabase.from("license_devices").insert({
      license_id: license.id,
      device_fingerprint: input.device_fingerprint,
      device_name: input.device_name || "IBM Client",
      is_active: true,
      last_seen_at: new Date().toISOString(),
    });
    if (insErr) throw new Error(insErr.message);
  }

  return licensePayload(license as LicenseRow);
}

export async function validateLicense(input: {
  license_key: string;
  device_fingerprint: string;
}) {
  const supabase = createServiceClient();
  const key = normalizeKey(input.license_key);
  const { data: license } = await supabase
    .from("licenses")
    .select("*")
    .eq("license_key", key)
    .maybeSingle();

  if (!license) throw new Error("Invalid license key");
  if (license.status !== "active") throw new Error(`License is ${license.status}`);
  if (license.expires_at && new Date(license.expires_at) < new Date()) {
    throw new Error("License expired");
  }

  const { data: device } = await supabase
    .from("license_devices")
    .select("*")
    .eq("license_id", license.id)
    .eq("device_fingerprint", input.device_fingerprint)
    .eq("is_active", true)
    .maybeSingle();

  // If dashboard Disconnect flipped is_active=false, do NOT auto-rebind.
  // User must enter the key again (activate).
  if (!device) {
    throw new Error("Disconnected from your IBM account. Enter your license key again.");
  }

  await supabase
    .from("license_devices")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", device.id);

  return licensePayload(license as LicenseRow);
}

export async function deactivateLicense(input: {
  license_key: string;
  device_fingerprint: string;
}) {
  const supabase = createServiceClient();
  const key = normalizeKey(input.license_key);
  const { data: license } = await supabase
    .from("licenses")
    .select("id")
    .eq("license_key", key)
    .maybeSingle();
  if (!license) return { ok: true };

  await supabase
    .from("license_devices")
    .update({ is_active: false })
    .eq("license_id", license.id)
    .eq("device_fingerprint", input.device_fingerprint);

  return { ok: true };
}
