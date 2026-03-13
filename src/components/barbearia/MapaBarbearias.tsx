"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

type BarbeariaMapItem = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
};

// Tipagem mínima para a API do Google Maps (carregada via script no browser)
interface GoogleMapsAPI {
  maps: {
    Map: new (el: HTMLElement, opts?: object) => { fitBounds: (b: unknown, p?: number) => void };
    Marker: new (opts: object) => void;
    LatLngBounds: new () => { extend: (p: { lat: number; lng: number }) => void };
    SymbolPath: { CIRCLE: number };
  };
}

declare global {
  interface Window {
    google?: GoogleMapsAPI;
    initMapBarbearias?: () => void;
  }
}

export function MapaBarbearias({
  barbearias,
  userLocation,
}: {
  barbearias: BarbeariaMapItem[];
  userLocation: { lat: number; lng: number } | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const key = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY : "";

  const comCoords = barbearias.filter((b) => b.latitude != null && b.longitude != null) as (BarbeariaMapItem & {
    latitude: number;
    longitude: number;
  })[];

  useEffect(() => {
    if (!key) {
      setError("Mapa: configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no .env");
      return;
    }
    if (window.google?.maps) {
      setScriptLoaded(true);
      return;
    }
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      window.initMapBarbearias = () => setScriptLoaded(true);
      return () => { delete window.initMapBarbearias; };
    }
    window.initMapBarbearias = () => setScriptLoaded(true);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=initMapBarbearias`;
    script.async = true;
    script.defer = true;
    script.onerror = () => setError("Falha ao carregar o mapa.");
    document.head.appendChild(script);
    return () => {
      delete window.initMapBarbearias;
    };
  }, [key]);

  useEffect(() => {
    if (!scriptLoaded || !window.google?.maps || !mapRef.current || !key) return;

    const center = userLocation ?? (comCoords[0] ? { lat: comCoords[0].latitude, lng: comCoords[0].longitude } : { lat: -14.235, lng: -51.9253 });
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: userLocation ? 13 : comCoords.length ? 12 : 4,
      mapTypeControl: true,
      fullscreenControl: true,
      zoomControl: true,
    });

    comCoords.forEach((b) => {
      new window.google!.maps.Marker({
        position: { lat: b.latitude, lng: b.longitude },
        map,
        title: b.name,
      });
    });

    if (userLocation) {
      new window.google.maps.Marker({
        position: userLocation,
        map,
        title: "Você está aqui",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });
    }

    if (comCoords.length > 1 || userLocation) {
      const bounds = new window.google.maps.LatLngBounds();
      comCoords.forEach((b) => bounds.extend({ lat: b.latitude, lng: b.longitude }));
      if (userLocation) bounds.extend(userLocation);
      map.fitBounds(bounds, 50);
    }
  }, [scriptLoaded, key, userLocation, comCoords.length]);

  if (error) {
    return (
      <div className="rounded-xl border border-border/80 bg-muted/30 p-6 text-center">
        <MapPin className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        {comCoords.length} {comCoords.length === 1 ? "barbearia no mapa" : "barbearias no mapa"}
        {userLocation && " · centralizado perto de você"}
      </p>
      <div ref={mapRef} className="h-[320px] w-full rounded-xl border border-border/80 bg-muted/20" aria-label="Mapa de barbearias" />
    </div>
  );
}
