import { Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type CellValue = true | false | string;

interface ComparisonRow {
  feature: string;
  pingpanda: CellValue;
  statuspage: CellValue;
  instatus: CellValue;
  betterstack: CellValue;
}

const comparisonData: ComparisonRow[] = [
  {
    feature: "Starting Price",
    pingpanda: "$9/mo",
    statuspage: "$29/mo",
    instatus: "$29/mo",
    betterstack: "$34/mo",
  },
  {
    feature: "Free Tier",
    pingpanda: "Yes (1 page)",
    statuspage: false,
    instatus: "Yes (1 page)",
    betterstack: "Yes (limited)",
  },
  {
    feature: "Uptime Monitoring",
    pingpanda: true,
    statuspage: "Separate ($)",
    instatus: true,
    betterstack: true,
  },
  {
    feature: "AI Summaries",
    pingpanda: true,
    statuspage: false,
    instatus: false,
    betterstack: false,
  },
  {
    feature: "Slack Notifications",
    pingpanda: true,
    statuspage: true,
    instatus: true,
    betterstack: true,
  },
  {
    feature: "Subscriber Emails",
    pingpanda: true,
    statuspage: true,
    instatus: true,
    betterstack: true,
  },
  {
    feature: "Custom Branding",
    pingpanda: true,
    statuspage: "$79/mo",
    instatus: true,
    betterstack: true,
  },
  {
    feature: "Auto Incidents",
    pingpanda: true,
    statuspage: false,
    instatus: false,
    betterstack: true,
  },
];

function CellContent({ value }: { value: CellValue }) {
  if (value === true) {
    return <Check className="mx-auto h-5 w-5 text-green-600" />;
  }
  if (value === false) {
    return <X className="mx-auto h-5 w-5 text-red-400" />;
  }
  return (
    <span className="text-sm text-muted-foreground">{value}</span>
  );
}

export function Comparison() {
  return (
    <section id="comparison" className="bg-muted/40 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">How we compare</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            All the features you need at a fraction of the price. See how
            PingPanda stacks up against the big names.
          </p>
        </div>
        <div className="mt-12 overflow-x-auto rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Feature</TableHead>
                <TableHead className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-bold text-primary">PingPanda</span>
                    <Badge variant="secondary" className="text-xs">
                      You are here
                    </Badge>
                  </div>
                </TableHead>
                <TableHead className="text-center">Statuspage</TableHead>
                <TableHead className="text-center">Instatus</TableHead>
                <TableHead className="text-center">Better Stack</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((row) => (
                <TableRow key={row.feature}>
                  <TableCell className="font-medium">{row.feature}</TableCell>
                  <TableCell className="bg-primary/5 text-center">
                    <CellContent value={row.pingpanda} />
                  </TableCell>
                  <TableCell className="text-center">
                    <CellContent value={row.statuspage} />
                  </TableCell>
                  <TableCell className="text-center">
                    <CellContent value={row.instatus} />
                  </TableCell>
                  <TableCell className="text-center">
                    <CellContent value={row.betterstack} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
