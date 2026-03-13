"use client";

import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import Link from "next/link";

type BarbeariaMapItem = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
};

const BRASIL_CENTRO: [number, number] = [-14.235, -51.9253];
const ZOOM_PADRAO = 4;
const ZOOM_CENTRO = 12;

// Corrige ícone padrão do Leaflet em bundlers (Next.js)
const iconDefault = typeof window !== "undefined"
  ? L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })
  : undefined;

const iconUser = typeof window !== "undefined"
  ? L.divIcon({
      className: "leaflet-marker-icon-user",
      html: `<div style="width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })
  : undefined;

function AjustarBounds({
  barbearias,
  centro,
}: {
  barbearias: BarbeariaMapItem[];
  centro: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  const comCoords = barbearias.filter((b) => b.latitude != null && b.longitude != null);
  React.useEffect(() => {
    if (comCoords.length === 0) return;
    const bounds = L.latLngBounds(
      comCoords.map((b) => [b.latitude!, b.longitude!] as [number, number])
    );
    if (centro) bounds.extend([centro.lat, centro.lng]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [map, centro, barbearias]);
  return null;
}

export function MapaBarbearias({
  barbearias,
  centro,
}: {
  barbearias: BarbeariaMapItem[];
  centro: { lat: number; lng: number } | null;
}) {
  const comCoords = useMemo(
    () =>
      barbearias.filter((b) => b.latitude != null && b.longitude != null) as (BarbeariaMapItem & {
        latitude: number;
        longitude: number;
      })[],
    [barbearias]
  );

  const [center, zoom] = useMemo((): [[number, number], number] => {
    if (centro) return [[centro.lat, centro.lng], ZOOM_CENTRO];
    if (comCoords.length > 0) return [[comCoords[0].latitude, comCoords[0].longitude], ZOOM_CENTRO];
    return [BRASIL_CENTRO, ZOOM_PADRAO];
  }, [centro, comCoords]);

  if (comCoords.length === 0) {
    return (
      <div className="rounded-xl border border-border/80 bg-muted/30 p-6 text-center">
        <MapPin className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Nenhuma barbearia com endereço no mapa. Cadastre latitude e longitude no perfil da barbearia.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        {comCoords.length} {comCoords.length === 1 ? "barbearia no mapa" : "barbearias no mapa"}
        {centro && " · centralizado no local escolhido"}
      </p>
      <div className="h-[320px] w-full overflow-hidden rounded-xl border border-border/80 bg-muted/20 [&_.leaflet-marker-icon-user]:border-0">
        <MapContainer
          center={center}
          zoom={zoom}
          className="h-full w-full"
          scrollWheelZoom
          style={{ minHeight: 320 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {comCoords.map((b) => (
            <Marker
              key={b.id}
              position={[b.latitude, b.longitude]}
              icon={iconDefault}
            >
              <Popup>
                <Link href={`/barbearias/${b.id}`} className="font-medium text-primary hover:underline">
                  {b.name}
                </Link>
              </Popup>
            </Marker>
          ))}
          {centro && (
            <Marker position={[centro.lat, centro.lng]} icon={iconUser}>
              <Popup>Você está aqui</Popup>
            </Marker>
          )}
          <AjustarBounds barbearias={barbearias} centro={centro} />
        </MapContainer>
      </div>
    </div>
  );
}
