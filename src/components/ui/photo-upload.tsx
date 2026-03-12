"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  className?: string;
  previewClassName?: string;
  rounded?: "full" | "lg" | "none";
}

export function PhotoUpload({
  value,
  onChange,
  label = "Foto",
  className,
  previewClassName,
  rounded = "full",
}: PhotoUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [uploadUnavailable, setUploadUnavailable] = React.useState(false);

  const MAX_DATA_URL_SIZE = 500 * 1024; // 500KB para fallback base64

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Selecione uma imagem (JPEG, PNG, WebP ou GIF).");
      return;
    }
    setUploadError(null);
    setUploadUnavailable(false);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        onChange(data.url);
        return;
      }
      const msg = data.error ?? "";
      if (res.status === 503 || msg.includes("não configurado") || msg.includes("Upload não configurado")) {
        if (file.size <= MAX_DATA_URL_SIZE) {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            if (dataUrl) onChange(dataUrl);
            setUploading(false);
          };
          reader.onerror = () => {
            setUploadError("Não foi possível ler a imagem.");
            setUploading(false);
          };
          reader.readAsDataURL(file);
          return;
        }
        setUploadError("Upload não configurado (Supabase). Use imagens menores que 500KB para salvar em base64.");
      } else {
        setUploadError(msg || "Falha ao enviar imagem.");
      }
    } finally {
      setUploading(false);
    }
  }

  const roundedClass =
    rounded === "full" ? "rounded-full" : rounded === "lg" ? "rounded-lg" : "";

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {!uploadUnavailable && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Enviando..." : "Anexar imagem"}
          </Button>
        )}
        {uploadUnavailable && (
          <p className="text-sm text-muted-foreground">
            Foto opcional. Upload indisponível no momento.
          </p>
        )}
        {value && (
          <>
            <div
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden bg-muted object-cover",
                roundedClass,
                previewClassName
              )}
            >
              <img src={value} alt="" className="h-full w-full object-cover" />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(null)}
              className="text-muted-foreground"
              aria-label="Remover foto"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      {uploadError && (
        <p className="text-sm text-destructive" role="alert">
          {uploadError}
        </p>
      )}
    </div>
  );
}
