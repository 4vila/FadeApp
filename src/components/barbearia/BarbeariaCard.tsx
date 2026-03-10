import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type BarbeariaCardProps = {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
};

export function BarbeariaCard({ id, name, address, city, phone }: BarbeariaCardProps) {
  return (
    <Link href={`/barbearias/${id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-2">
          <h3 className="font-semibold">{name}</h3>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {city && <p>{city}</p>}
          {address && <p>{address}</p>}
          {phone && <p>{phone}</p>}
        </CardContent>
      </Card>
    </Link>
  );
}
