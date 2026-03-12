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
    <Card className="group min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)] hover:shadow-primary/5">
      <Link href={`/barbearias/${id}`} className="block min-w-0">
        <div className="relative aspect-[2/1] w-full min-w-0 overflow-hidden bg-muted/50">
          {logo ? (
            <img
              src={logo}
              alt={name}
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
              <Scissors className="h-14 w-14" strokeWidth={1.5} aria-hidden />
            </div>
          )}
          <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-t from-card/90 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
        <CardHeader className="pb-2 pt-5">
          <h3 className="text-heading-3 line-clamp-1 text-foreground transition-colors group-hover:text-primary">
            {name}
          </h3>
        </CardHeader>
        <CardContent className="space-y-2.5 pb-5">
          {city && (
            <p className="flex items-center gap-2 text-caption text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-primary/70" aria-hidden />
              <span className="line-clamp-1">{city}{address ? ` · ${address}` : ""}</span>
            </p>
          )}
          {!city && address && (
            <p className="flex items-center gap-2 text-caption text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-primary/70" aria-hidden />
              <span className="line-clamp-1">{address}</span>
            </p>
          )}
          {phone && (
            <p className="flex items-center gap-2 text-caption text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0 text-primary/70" aria-hidden />
              <span>{phone}</span>
            </p>
          )}
          <div className="pt-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all group-hover:underline">
              Ver barbearia e agendar
              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
