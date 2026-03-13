"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { Store } from "lucide-react";

export default function BarbeariaPerfilPage() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/barbearia/perfil")
      .then((r) => r.json())
      .then((data) => {
        if (data?.name != null) setName(data.name);
        if (data?.address != null) setAddress(data.address);
        if (data?.city != null) setCity(data.city);
        if (data?.phone != null) setPhone(data.phone);
        if (data?.logo != null) setLogo(data.logo);
        if (data?.latitude != null) setLatitude(String(data.latitude));
        if (data?.longitude != null) setLongitude(String(data.longitude));
      })
      .catch(() => setError("Erro ao carregar dados."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const lat = latitude ? parseFloat(latitude) : null;
    const lng = longitude ? parseFloat(longitude) : null;
    if (latitude && isNaN(lat!)) {
      setError("Latitude inválida.");
      setSaving(false);
      return;
    }
    if (longitude && isNaN(lng!)) {
      setError("Longitude inválida.");
      setSaving(false);
      return;
    }
    try {
      const res = await fetch("/api/barbearia/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          phone: phone.trim() || undefined,
          logo: logo || null,
          latitude: lat ?? null,
          longitude: lng ?? null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar.");
        return;
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-heading-1 flex items-center gap-2">
          <Store className="h-8 w-8" />
          Perfil da barbearia
        </h1>
        <p className="mt-1 text-caption text-muted-foreground">
          Nome, endereço, telefone e logo. A logo aparece na listagem de barbearias.
        </p>
      </div>

      <Card className="rounded-2xl border border-border/80 shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle>Dados e imagem</CardTitle>
          <CardDescription>Altere os dados da sua barbearia e a logo (imagem de perfil da barbearia).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <div>
              <Label className="text-sm font-medium">Logo da barbearia</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Imagem que aparece nos cards e na página da barbearia.</p>
              <div className="mt-2">
                <PhotoUpload value={logo} onChange={setLogo} label="" rounded="lg" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bp-name">Nome</Label>
                <Input id="bp-name" value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bp-phone">Telefone</Label>
                <Input id="bp-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bp-address">Endereço</Label>
              <Input id="bp-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, bairro" className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bp-city">Cidade</Label>
              <Input id="bp-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" className="h-11 rounded-xl" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bp-lat">Latitude (para o mapa)</Label>
                <Input id="bp-lat" type="text" inputMode="decimal" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="Ex: -12.9711" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bp-lng">Longitude (para o mapa)</Label>
                <Input id="bp-lng" type="text" inputMode="decimal" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="Ex: -38.5108" className="h-11 rounded-xl" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Preencha latitude e longitude para sua barbearia aparecer no mapa. Você pode obter no Google Maps (clique com o botão direito no local e copie as coordenadas).</p>
            <Button type="submit" disabled={saving} className="rounded-xl">
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
