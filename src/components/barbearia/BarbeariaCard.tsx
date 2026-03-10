"use client";

import Link from "next/link";
import { MapPin, Phone, Scissors, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
type BarbeariaCardProps = {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  logo?: string | null;
};

export function BarbeariaCard({ id, name, address, city, phone, logo }: BarbeariaCardProps) {
  return (
    <Card className="group overflow-hidden border-border/80 bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <Link href={`/barbearias/${id}`} className="block">
        <div className="relative aspect-[2/1] w-full overflow-hidden bg-muted/50">
          {logo ? (
            <img
              src={logo}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
              <Scissors className="h-12 w-12" strokeWidth={1.5} aria-hidden />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card/95 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </div>
        <CardHeader className="pb-2 pt-4">
          <h3 className="line-clamp-1 text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
            {name}
          </h3>
        </CardHeader>
        <CardContent className="space-y-2 pb-4">
          {city && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-primary/70" aria-hidden />
              <span className="line-clamp-1">{city}{address ? ` · ${address}` : ""}</span>
            </p>
          )}
          {!city && address && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-primary/70" aria-hidden />
              <span className="line-clamp-1">{address}</span>
            </p>
          )}
          {phone && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0 text-primary/70" aria-hidden />
              <span>{phone}</span>
            </p>
          )}
          <div className="pt-2">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
              Ver barbearia e agendar
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
