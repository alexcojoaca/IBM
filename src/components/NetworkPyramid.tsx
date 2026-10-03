"use client";

import { useI18n } from "@/i18n/LanguageProvider";

export type PyramidNode = {
  id: string;
  full_name: string | null;
  email: string | null;
  referral_code: string | null;
  level: number;
  children: PyramidNode[];
};

function NodeCard({
  node,
  highlight,
  memberLabel,
}: {
  node: PyramidNode;
  highlight?: boolean;
  memberLabel: string;
}) {
  const label = node.full_name || node.email || memberLabel;
  return (
    <div
      title={node.email || ""}
      style={{
        minWidth: 120,
        maxWidth: 160,
        padding: "0.55rem 0.65rem",
        borderRadius: 10,
        border: highlight ? "1px solid var(--accent)" : "1px solid var(--line)",
        background: highlight ? "rgba(200,245,66,0.12)" : "var(--bg-elev)",
        textAlign: "center",
        fontSize: "0.8rem",
      }}
    >
      <div style={{ fontWeight: 650, marginBottom: 2 }}>{label}</div>
      <div className="muted" style={{ fontSize: "0.7rem" }}>
        {node.referral_code || "—"}
      </div>
      {node.level > 0 && (
        <div className="muted" style={{ fontSize: "0.68rem", marginTop: 2 }}>
          L{node.level}
        </div>
      )}
    </div>
  );
}

function LevelRow({
  nodes,
  levelLabel,
  emptyLabel,
  memberLabel,
}: {
  nodes: PyramidNode[];
  levelLabel: string;
  emptyLabel: string;
  memberLabel: string;
}) {
  if (!nodes.length) {
    return (
      <div style={{ textAlign: "center", margin: "0.75rem 0" }}>
        <div className="muted" style={{ fontSize: "0.75rem", marginBottom: 6 }}>
          {levelLabel}
        </div>
        <div className="muted" style={{ fontSize: "0.8rem" }}>
          {emptyLabel}
        </div>
      </div>
    );
  }
  return (
    <div style={{ margin: "0.85rem 0" }}>
      <div className="muted" style={{ fontSize: "0.75rem", textAlign: "center", marginBottom: 8 }}>
        {levelLabel} · {nodes.length}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "center",
        }}
      >
        {nodes.map((n) => (
          <NodeCard key={n.id} node={n} memberLabel={memberLabel} />
        ))}
      </div>
    </div>
  );
}

function flattenLevels(root: PyramidNode) {
  const l1 = root.children || [];
  const l2 = l1.flatMap((c) => c.children || []);
  const l3 = l2.flatMap((c) => c.children || []);
  return { l1, l2, l3 };
}

export function NetworkPyramid({
  root,
  title,
}: {
  root: PyramidNode | null;
  title?: string;
}) {
  const { t } = useI18n();
  if (!root) {
    return <p className="muted">{t("aff.noNetwork")}</p>;
  }
  const { l1, l2, l3 } = flattenLevels(root);
  const member = t("common.member");

  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: "1rem",
        background:
          "radial-gradient(600px 280px at 50% 0%, rgba(200,245,66,0.08), transparent 60%)",
      }}
    >
      {title && (
        <h3 style={{ marginTop: 0, fontFamily: "var(--font-display)", textAlign: "center" }}>
          {title}
        </h3>
      )}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
        <NodeCard node={{ ...root, level: 0 }} highlight memberLabel={member} />
      </div>
      <svg width="100%" height="28" viewBox="0 0 100 28" preserveAspectRatio="none">
        <line x1="50" y1="0" x2="50" y2="28" stroke="rgba(232,240,234,0.2)" strokeWidth="1" />
      </svg>
      <LevelRow
        nodes={l1.map((n) => ({ ...n, level: 1 }))}
        levelLabel={t("aff.levelLabel1")}
        emptyLabel={t("common.empty")}
        memberLabel={member}
      />
      <LevelRow
        nodes={l2.map((n) => ({ ...n, level: 2 }))}
        levelLabel={t("aff.levelLabel2")}
        emptyLabel={t("common.empty")}
        memberLabel={member}
      />
      <LevelRow
        nodes={l3.map((n) => ({ ...n, level: 3 }))}
        levelLabel={t("aff.levelLabel3")}
        emptyLabel={t("common.empty")}
        memberLabel={member}
      />
    </div>
  );
}

export function AdminNetworkBoard({ trees }: { trees: PyramidNode[] }) {
  const { t } = useI18n();
  if (!trees.length) return <p className="muted">{t("aff.noMembers")}</p>;
  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      {trees.map((node) => (
        <NetworkPyramid
          key={node.id}
          root={node}
          title={node.full_name || node.email || t("common.member")}
        />
      ))}
    </div>
  );
}
