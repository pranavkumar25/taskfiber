import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

/* ---------------------------------------------------------------------------
   6.29 · The weekly digest.

   A client should never have to ask for status, and most of them will never
   open the portal to get it — the target is that over 60% of client actions
   happen from email or WhatsApp. So the email is not a notification pointing at
   the product; it is the product's voice.

   Two rules it obeys. One primary action. And the consequence is stated BEFORE
   the button: approving from the email records the decision, exactly as it
   would in the portal.
--------------------------------------------------------------------------- */

export type DigestProps = {
  agency: { name: string; accentHex: string };
  client: { name: string };
  contact: { name: string };
  week: number;
  date: string;
  /** The human lede. Written by the lead, or drafted and then edited. */
  headline: string;
  needsYou: {
    title: string;
    version: string;
    whatChanged: string;
    dueLabel: string;
    approveUrl: string;
    portalUrl: string;
  } | null;
  shipped: { item: string; outcome: string; date: string }[];
  next: { date: string; event: string }[];
  metrics: { label: string; value: string }[];
  signOff: { name: string; role: string };
  preferencesUrl: string;
  portalUrl: string;
};

export function subjectFor(p: DigestProps) {
  const approvals = p.needsYou ? 1 : 0;
  return `${p.client.name} · week ${p.week}: ${approvals} approval, ${p.shipped.length} shipped`;
}

const MONO = "'Geist Mono', ui-monospace, monospace";
const SANS = "'Pretendard', system-ui, -apple-system, sans-serif";

export function WeeklyDigest(p: DigestProps) {
  return (
    <Html>
      <Head />
      <Preview>{p.headline}</Preview>
      <Body style={{ margin: 0, background: "#f5f5f5", fontFamily: SANS, color: "#171717" }}>
        <Container
          style={{
            width: 600,
            margin: "24px auto",
            background: "#ffffff",
            border: "1px solid #d4d4d4",
            borderRadius: 10,
          }}
        >
          {/* Brand row */}
          <Section style={{ padding: "24px 32px 0" }}>
            <table width="100%" cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td>
                    <table cellPadding={0} cellSpacing={0}>
                      <tbody>
                        <tr>
                          <td
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 7,
                              background: p.agency.accentHex,
                              color: "#ffffff",
                              textAlign: "center",
                              fontWeight: 600,
                              fontSize: 13,
                            }}
                          >
                            {p.agency.name[0]}
                          </td>
                          <td style={{ paddingLeft: 10, fontWeight: 600, fontSize: 15 }}>
                            {p.agency.name}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td
                    align="right"
                    style={{ fontFamily: MONO, fontSize: 12, color: "#525252" }}
                  >
                    Week {p.week} · {p.date}
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* The lede */}
          <Section style={{ padding: "20px 32px 0" }}>
            <Text
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.3,
              }}
            >
              {p.headline}
            </Text>
          </Section>

          {/* Needs you — the one primary action */}
          {p.needsYou ? (
            <Section style={{ padding: "20px 32px 0" }}>
              <table
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                style={{ border: "1px solid #e5e5e5", borderRadius: 10 }}
              >
                <tbody>
                  <tr>
                    <td style={{ padding: 16 }}>
                      <table width="100%" cellPadding={0} cellSpacing={0}>
                        <tbody>
                          <tr>
                            <td style={{ fontSize: 15, fontWeight: 500 }}>
                              {p.needsYou.title}{" "}
                              <span
                                style={{
                                  fontFamily: MONO,
                                  fontSize: 12,
                                  color: "#525252",
                                  background: "#f5f5f5",
                                  borderRadius: 4,
                                  padding: "1px 6px",
                                }}
                              >
                                {p.needsYou.version}
                              </span>
                            </td>
                            <td
                              align="right"
                              style={{ fontFamily: MONO, fontSize: 12, color: "#c2410c" }}
                            >
                              {p.needsYou.dueLabel}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <Text style={{ margin: "8px 0 0", fontSize: 15, color: "#525252" }}>
                        {p.needsYou.whatChanged}
                      </Text>

                      <table cellPadding={0} cellSpacing={0} style={{ marginTop: 14 }}>
                        <tbody>
                          <tr>
                            <td>
                              <Button
                                href={p.needsYou.approveUrl}
                                style={{
                                  display: "inline-block",
                                  height: 40,
                                  lineHeight: "40px",
                                  padding: "0 18px",
                                  borderRadius: 6,
                                  background: p.agency.accentHex,
                                  color: "#ffffff",
                                  fontSize: 14,
                                  fontWeight: 500,
                                }}
                              >
                                Approve {p.needsYou.version}
                              </Button>
                            </td>
                            <td style={{ paddingLeft: 8 }}>
                              <Button
                                href={p.needsYou.portalUrl}
                                style={{
                                  display: "inline-block",
                                  height: 40,
                                  lineHeight: "38px",
                                  padding: "0 18px",
                                  borderRadius: 6,
                                  background: "#ffffff",
                                  border: "1px solid #e5e5e5",
                                  color: "#171717",
                                  fontSize: 14,
                                  fontWeight: 500,
                                }}
                              >
                                View in portal
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* The consequence, stated before the button is pressed. */}
                      <Text style={{ margin: "12px 0 0", fontSize: 12, color: "#737373" }}>
                        Approving from this email records your decision. To request changes, reply
                        to this email.
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>
          ) : null}

          {/* Shipped */}
          {p.shipped.length ? (
            <Section style={{ padding: "20px 32px 0" }}>
              <Text style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 500, color: "#525252", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Shipped this week
              </Text>
              <table
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                style={{ border: "1px solid #e5e5e5", borderRadius: 10 }}
              >
                <tbody>
                  {p.shipped.map((s, i) => (
                    <tr key={s.item}>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 15,
                          borderTop: i ? "1px solid #f5f5f5" : undefined,
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>{s.item}</span>
                        <span style={{ color: "#525252" }}> · {s.outcome}</span>
                      </td>
                      <td
                        align="right"
                        style={{
                          padding: "12px 16px",
                          fontFamily: MONO,
                          fontSize: 12,
                          color: "#737373",
                          borderTop: i ? "1px solid #f5f5f5" : undefined,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          ) : null}

          {/* What is next */}
          {p.next.length ? (
            <Section style={{ padding: "20px 32px 0" }}>
              <Text style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 500, color: "#525252", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                What is next
              </Text>
              <table width="100%" cellPadding={0} cellSpacing={0}>
                <tbody>
                  <tr>
                    {p.next.map((n) => (
                      <td
                        key={n.event}
                        width="50%"
                        style={{
                          padding: 12,
                          border: "1px solid #e5e5e5",
                          borderRadius: 10,
                          verticalAlign: "top",
                        }}
                      >
                        <div style={{ fontFamily: MONO, fontSize: 12, color: "#737373" }}>
                          {n.date}
                        </div>
                        <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500 }}>
                          {n.event}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </Section>
          ) : null}

          {/* Metrics */}
          {p.metrics.length ? (
            <Section style={{ padding: "20px 32px 0" }}>
              <table
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                style={{ border: "1px solid #e5e5e5", borderRadius: 10 }}
              >
                <tbody>
                  <tr>
                    {p.metrics.map((m, i) => (
                      <td
                        key={m.label}
                        style={{
                          padding: 14,
                          borderLeft: i ? "1px solid #e5e5e5" : undefined,
                          width: `${100 / p.metrics.length}%`,
                        }}
                      >
                        <div style={{ fontSize: 13, color: "#525252" }}>{m.label}</div>
                        <div
                          style={{
                            marginTop: 4,
                            fontFamily: MONO,
                            fontSize: 18,
                            fontWeight: 500,
                          }}
                        >
                          {m.value}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </Section>
          ) : null}

          {/* A named human, not a no-reply */}
          <Section style={{ padding: "20px 32px 0" }}>
            <table cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      background: "#f5f5f5",
                      color: "#525252",
                      textAlign: "center",
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    {p.signOff.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </td>
                  <td style={{ paddingLeft: 10, fontSize: 13, color: "#525252" }}>
                    {p.signOff.name}, your {p.signOff.role} ·{" "}
                    <span style={{ textDecoration: "underline" }}>Reply to reach me</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Hr style={{ margin: "20px 32px 0", borderColor: "#f5f5f5" }} />

          <Section style={{ padding: "14px 32px 24px" }}>
            <Text style={{ margin: 0, fontSize: 13, color: "#737373" }}>
              This link is personal to you, {p.contact.name.split(" ")[0]}. Do not forward it; ask{" "}
              {p.agency.name} to add a colleague instead.
            </Text>
            <Text style={{ margin: "8px 0 0", fontSize: 13, color: "#737373" }}>
              <a href={p.preferencesUrl} style={{ color: "#737373" }}>
                Notification preferences
              </a>
              {" · "}
              <a href={p.portalUrl} style={{ color: "#737373" }}>
                Open portal
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
