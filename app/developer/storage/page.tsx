import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { DeveloperPortalLayout } from "@/layouts/developer-portal-layout";
import { getPlatformStorage } from "@/services/developer/platform-service";
import { MetricCard } from "@/components/ui/metric-card";
import { formatBytes } from "@/utils/format";
export default async function Page() {
  const data = await getPlatformStorage();
  return (
    <DeveloperPortalLayout>
      <section className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard label="Stored files" value={String(data.files)} />
          <MetricCard
            label="Tracked storage"
            value={formatBytes(data.storageBytes)}
            tone="magenta"
          />
        </div>
        <Table>
          <thead>
            <tr>
              <Th>File</Th>
              <Th>Organization</Th>
              <Th>Size</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {data.largestFiles.map((f) => (
              <tr key={f.id}>
                <Td>{f.fileName}</Td>
                <Td>{f.printJob.organization.name}</Td>
                <Td>{formatBytes(f.fileSize)}</Td>
                <Td>{f.status}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </DeveloperPortalLayout>
  );
}
