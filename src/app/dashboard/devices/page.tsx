"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashNav } from "@/components/DashNav";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/LanguageProvider";

type Device = {
  id: string;
  device_fingerprint: string;
  device_name: string | null;
  last_seen_at: string | null;
  is_active: boolean;
  license_id: string;
};

export default function DevicesPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [isAdmin, setIsAdmin] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    setIsAdmin(profile?.role === "admin");

    const { data: licenses } = await supabase
      .from("licenses")
      .select("id")
      .eq("user_id", user.id);
    const ids = (licenses || []).map((l) => l.id);
    if (!ids.length) {
      setDevices([]);
      return;
    }
    const { data } = await supabase
      .from("license_devices")
      .select("id, device_fingerprint, device_name, last_seen_at, is_active, license_id")
      .in("license_id", ids)
      .order("last_seen_at", { ascending: false });
    setDevices((data as Device[]) || []);
  };

  useEffect(() => {
    load();
  }, []);

  const disconnect = async (id: string) => {
    const supabase = createClient();
    await supabase.from("license_devices").update({ is_active: false }).eq("id", id);
    setMsg(t("devices.disconnectedMsg"));
    await load();
  };

  return (
    <div className="shell dash">
      <DashNav active="/dashboard/devices" isAdmin={isAdmin} />
      <main className="dash-main">
        <h1>{t("devices.title")}</h1>
        <p className="muted" style={{ marginTop: "-0.5rem" }}>
          {t("devices.sub")}
        </p>
        {msg && <p className="ok">{msg}</p>}
        <div className="panel">
          {!devices.length ? (
            <p className="muted">{t("devices.none")}</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>{t("devices.colDevice")}</th>
                  <th>{t("devices.colLast")}</th>
                  <th>{t("devices.colStatus")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d) => (
                  <tr key={d.id}>
                    <td>
                      {d.device_name || t("devices.defaultName")}
                      <div className="muted" style={{ fontSize: "0.75rem" }}>
                        {d.device_fingerprint.slice(0, 18)}…
                      </div>
                    </td>
                    <td>
                      {d.last_seen_at ? new Date(d.last_seen_at).toLocaleString() : "—"}
                    </td>
                    <td>{d.is_active ? t("common.active") : t("common.disconnected")}</td>
                    <td>
                      {d.is_active && (
                        <button className="btn" type="button" onClick={() => disconnect(d.id)}>
                          {t("devices.disconnect")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
