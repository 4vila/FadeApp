"use client";

import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

type BarbeariaMapItem = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
};

const BRASIL_CENTRO: [number, number] = [-14.235, -51.9253];
const ZOOM_PADRAO = 6;
const ZOOM_CENTRO = 13;

// Ícone padrão do Leaflet (fallback caso o custom falhe)
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

// Ícone da posição do usuário
const iconUser = typeof window !== "undefined"
  ? L.divIcon({
      className: "leaflet-marker-icon-user",
      html: `<div style="width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })
  : undefined;

// Ícone customizado para barbearias (bolinha escura com tesoura, inspirado no logo)
const iconBarbearia = typeof window !== "undefined"
  ? L.divIcon({
      className: "leaflet-marker-icon-barbeartime",
      html: `<div style="
        width:26px;height:26px;
        border-radius:9999px;
        background:#020617;
        color:#f97316;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:15px;
        box-shadow:0 8px 18px rgba(15,23,42,0.55);
      ">
        ✂
      </div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 26],
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

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        {comCoords.length > 0
          ? `${comCoords.length} ${comCoords.length === 1 ? "barbearia no mapa" : "barbearias no mapa"}${centro ? " · centralizado no local escolhido" : ""}`
          : "Minimapa — cadastre latitude e longitude no perfil da barbearia para ver marcadores."}
      </p>
      <div className="h-[220px] w-full overflow-hidden rounded-xl border border-border/80 bg-muted/20 [&_.leaflet-marker-icon-user]:border-0">
        <MapContainer
          center={center}
          zoom={zoom}
          className="h-full w-full"
          scrollWheelZoom={false}
          style={{ minHeight: 220 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {comCoords.map((b) => (
            <Marker
              key={b.id}
              position={[b.latitude, b.longitude]}
              icon={iconBarbearia ?? iconDefault}
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
          {comCoords.length > 0 && <AjustarBounds barbearias={barbearias} centro={centro} />}
        </MapContainer>
      </div>
    </div>
  );
}
