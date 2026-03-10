"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Plus, Users } from "lucide-react";

type Barbearia = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  _count: { profissionais: number; agendamentos: number };
  users: { id: string; name: string | null; email: string }[];
};

export default function AdminBarbeariasPage() {
  const [list, setList] = useState<Barbearia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/barbearias")
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Barbearias</h1>
        <Button asChild>
          <Link href="/admin/barbearias/nova" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova barbearia
          </Link>
        </Button>
      </div>
      <p className="text-muted-foreground mt-1">
        Gerencie as barbearias da plataforma.
      </p>

      <div className="mt-6 space-y-4">
        {list.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma barbearia cadastrada.{" "}
              <Link href="/admin/barbearias/nova" className="text-primary hover:underline">
                Criar primeira barbearia
              </Link>
            </CardContent>
          </Card>
        ) : (
          list.map((b) => (
            <Card key={b.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{b.name}</p>
                    {b.city && (
                      <p className="text-sm text-muted-foreground">{b.city}</p>
                    )}
                    {b.phone && (
                      <p className="text-sm text-muted-foreground">{b.phone}</p>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/barbearia/dashboard">
                    Ver painel
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {b._count.profissionais} profissional(is)
                  </span>
                  <span>{b._count.agendamentos} agendamento(s)</span>
                </div>
                {b.users.length > 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Dono: {b.users[0].name ?? "—"} ({b.users[0].email})
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
