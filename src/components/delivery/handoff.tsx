"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/overlay";
import { Input, Select } from "@/components/ui/field";
import { RoleTag } from "@/components/ui/pill";

/**
 * 6.13 · The won-deal handoff.
 *
 * The screen's promise, stated in the modal: company, contacts and value come
 * across; nothing is re-typed. Confirming lands on the onboarding checklist,
 * already running.
 */
export function HandoffButton({
  deal,
  className,
}: {
  deal: {
    id: string;
    name: string;
    company: string;
    contacts: { name: string; proposedRole: string }[];
  };
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        className={`w-full ${className ?? ""}`}
        onClick={() => setOpen(true)}
      >
        Create client and portal
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        width={520}
        title={`${deal.company} → client`}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setOpen(false);
                router.push("/clients/new");
              }}
            >
              Create client and start onboarding
            </Button>
          </>
        }
      >
        <p>
          From the CRM deal &ldquo;{deal.name}&rdquo;. Company, contacts and value come across;
          nothing is re-typed.
        </p>

        <dl className="mt-4 flex flex-col gap-3 text-body">
          <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-3">
            <dt className="text-steel">Client name</dt>
            <dd>
              <Input defaultValue={deal.company} />
            </dd>
          </div>
          <div className="grid grid-cols-[120px_minmax(0,1fr)] items-start gap-3">
            <dt className="pt-1 text-steel">Contacts</dt>
            <dd className="flex flex-wrap gap-1.5">
              {deal.contacts.map((c) => (
                <span
                  key={c.name}
                  className="inline-flex items-center gap-1.5 rounded-chip border border-ash bg-surface px-2 py-1 text-meta text-charcoal"
                >
                  {c.name}
                  <RoleTag>{c.proposedRole.toLowerCase()}</RoleTag>
                </span>
              ))}
            </dd>
          </div>
          <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-3">
            <dt className="text-steel">Portal template</dt>
            <dd>
              <Select defaultValue="marketing">
                <option value="marketing">Marketing agency</option>
                <option value="design">Design studio</option>
                <option value="influencer">Influencer management</option>
              </Select>
            </dd>
          </div>
          <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-3">
            <dt className="text-steel">Drive folder</dt>
            <dd className="font-mono text-meta text-steel">
              Create /Clients/{deal.company}
            </dd>
          </div>
          <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-3">
            <dt className="text-steel">Onboarding</dt>
            <dd className="text-meta text-steel">Run the 6-step checklist</dd>
          </div>
        </dl>
      </Modal>
    </>
  );
}
