import { DataTable, SkeletonRow, TableHeader } from "@/components/ui/surface";

const COLS = "minmax(240px,1fr) 150px 130px 130px 28px";

/**
 * Loading, for the all-clients list.
 *
 * The skeleton matches the real row's geometry exactly and does not animate. A
 * shimmer reads as progress; a still shape reads as structure, which is the
 * honest thing to say while we are only waiting on a query.
 */
export default function ClientsLoading() {
  const widths = [
    [190, 96, 88, 76],
    [150, 120, 70, 92],
    [210, 104, 80, 64],
    [170, 88, 96, 84],
    [200, 112, 72, 70],
    [160, 96, 88, 88],
    [180, 120, 64, 76],
    [200, 88, 92, 80],
  ];

  return (
    <div className="px-8 pt-8 pb-24">
      <div className="mb-4 flex items-center gap-2">
        <h1 className="mr-2 text-h1 font-semibold">Clients</h1>
        <span className="h-7 w-16 rounded-full bg-canvas" />
        <span className="h-7 w-20 rounded-full bg-canvas" />
        <span className="h-7 w-24 rounded-full bg-canvas" />
      </div>

      <DataTable>
        <TableHeader cols={COLS}>
          <span>Client</span>
          <span>Next milestone</span>
          <span>Approvals</span>
          <span>Portal</span>
          <span className="sr-only">Portal link</span>
        </TableHeader>
        {widths.map((w, i) => (
          <SkeletonRow key={i} cols={COLS} widths={[...w, 16]} tall />
        ))}
      </DataTable>
    </div>
  );
}
