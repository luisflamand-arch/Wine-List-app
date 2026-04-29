'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Upload, Save, Wine, Camera } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

type SettingsData = {
  restaurantName: string;
  logoUrl: string | null;
  cloudStoragePath: string | null;
  isPublicLogo: boolean;
  backgroundImageUrl: string | null;
  backgroundCloudStoragePath: string | null;
  isPublicBackground: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
};

export function AdminSettings() {
  const [settings, setSettings] = useState<SettingsData>({
    restaurantName: 'La Vinoteca', logoUrl: null, cloudStoragePath: null, isPublicLogo: true,
    backgroundImageUrl: null, backgroundCloudStoragePath: null, isPublicBackground: true,
    primaryColor: '#8B6914', secondaryColor: '#1A1A2E', accentColor: '#D4AF37',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r?.json()).then(d => { if (d) setSettings(d); }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
      if (r?.ok) toast.success('Ajustes guardados');
      else toast.error('Error al guardar');
    } catch { toast.error('Error al guardar'); }
    setSaving(false);
  };

  const handleLogoUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const presignedRes = await fetch('/api/upload/presigned', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, isPublic: true }),
      });
      const { uploadUrl, cloud_storage_path } = await presignedRes?.json() ?? {};
      if (!uploadUrl || !cloud_storage_path) throw new Error('No upload URL o path');

      const headers: Record<string, string> = { 'Content-Type': file.type };
      const urlParams = new URL(uploadUrl);
      const signedHeaders = urlParams.searchParams.get('X-Amz-SignedHeaders') ?? '';
      if (signedHeaders.includes('content-disposition')) {
        headers['Content-Disposition'] = 'attachment';
      }

      await fetch(uploadUrl, { method: 'PUT', headers, body: file });
      
      // Extraer bucket y region de la URL presignada
      const bucketMatch = uploadUrl.match(/https:\/\/([^.]+)\.s3\.([^.]+)\.amazonaws\.com/);
      const bucket = bucketMatch?.[1] ?? '';
      const region = bucketMatch?.[2] ?? 'us-east-1';
      
      if (!bucket) throw new Error('No se pudo determinar el bucket S3');
      
      // Construir URL pública desde cloud storage path
      const logoPublicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${cloud_storage_path}`;
      setSettings((p: any) => ({ ...(p ?? {}), logoUrl: logoPublicUrl, cloudStoragePath: cloud_storage_path, isPublicLogo: true }));
      toast.success('Logo subido correctamente');
    } catch (e: any) { 
      console.error('Logo upload error:', e);
      toast.error(e?.message ?? 'Error al subir logo'); 
    }
    setUploading(false);
  };

  const handleBackgroundUpload = async (file: File) => {
    if (!file) return;
    setUploadingBg(true);
    try {
      const presignedRes = await fetch('/api/upload/presigned', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, isPublic: true }),
      });
      const { uploadUrl, cloud_storage_path } = await presignedRes?.json() ?? {};
      if (!uploadUrl || !cloud_storage_path) throw new Error('No upload URL o path');

      const headers: Record<string, string> = { 'Content-Type': file.type };
      const urlParams = new URL(uploadUrl);
      const signedHeaders = urlParams.searchParams.get('X-Amz-SignedHeaders') ?? '';
      if (signedHeaders.includes('content-disposition')) {
        headers['Content-Disposition'] = 'attachment';
      }

      await fetch(uploadUrl, { method: 'PUT', headers, body: file });
      
      // Construir URL pública desde cloud storage path
      const bucketMatch = uploadUrl.match(/https:\/\/([^.]+)\.s3\.([^.]+)\.amazonaws\.com/);
      const bucket = bucketMatch?.[1] ?? '';
      const region = bucketMatch?.[2] ?? 'us-east-1';
      
      if (!bucket) throw new Error('No se pudo determinar el bucket S3');
      
      const bgPublicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${cloud_storage_path}`;
      setSettings((p: any) => ({ ...(p ?? {}), backgroundImageUrl: bgPublicUrl, backgroundCloudStoragePath: cloud_storage_path, isPublicBackground: true }));
    } catch (e: any) { 
      console.error('Background upload error:', e);
      toast.error(e?.message ?? 'Error al subir foto de fondo'); 
    }
    setUploadingBg(false);
  };

  return (
    <div className="max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-6 border border-border/30 mb-6" style={{ boxShadow: 'var(--shadow-md)' }}
      >
        <h3 className="font-display text-lg font-bold mb-5 flex items-center gap-2">
          <Wine className="w-5 h-5 text-primary" /> Branding
        </h3>
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium mb-1 block">Nombre del Restaurante</label>
            <input value={settings?.restaurantName ?? ''} onChange={(e: any) => setSettings((p: any) => ({ ...(p ?? {}), restaurantName: e?.target?.value ?? '' }))}
              className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Logo</label>
            <div className="flex items-center gap-4">
              {settings?.logoUrl && (
                <div className="relative w-16 h-16 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={settings.logoUrl} alt="Logo" fill className="object-contain" sizes="64px" />
                </div>
              )}
              <div className="flex gap-2">
                <label className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm cursor-pointer hover:bg-secondary/80 transition-colors">
                  <Upload className="w-4 h-4" /> {uploading ? 'Subiendo...' : 'Descargar'}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading}
                    onChange={(e: any) => { const f = e?.target?.files?.[0]; if (f) handleLogoUpload(f); }} />
                </label>
                <label className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4" /> {uploading ? 'Capturando...' : 'Tomar foto'}
                  <input type="file" accept="image/*" capture="environment" className="hidden" disabled={uploading}
                    onChange={(e: any) => { const f = e?.target?.files?.[0]; if (f) handleLogoUpload(f); }} />
                </label>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-xl p-6 border border-border/30 mb-6" style={{ boxShadow: 'var(--shadow-md)' }}
      >
        <h3 className="font-display text-lg font-bold mb-5 flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" /> Foto de Fondo
        </h3>
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Sube una imagen para cambiar el fondo de la pantalla principal</p>
          {settings?.backgroundImageUrl && (
            <div className="relative w-full h-32 bg-secondary rounded-lg overflow-hidden">
              <Image src={settings.backgroundImageUrl} alt="Background" fill className="object-cover" sizes="500px" />
            </div>
          )}
          <div className="flex gap-2">
            <label className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm cursor-pointer hover:bg-secondary/80 transition-colors w-fit">
              <Upload className="w-4 h-4" /> {uploadingBg ? 'Subiendo...' : 'Descargar'}
              <input type="file" accept="image/*" className="hidden" disabled={uploadingBg}
                onChange={(e: any) => { const f = e?.target?.files?.[0]; if (f) handleBackgroundUpload(f); }} />
            </label>
            <label className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm cursor-pointer hover:bg-primary/90 transition-colors w-fit">
              <Camera className="w-4 h-4" /> {uploadingBg ? 'Capturando...' : 'Tomar foto'}
              <input type="file" accept="image/*" capture="environment" className="hidden" disabled={uploadingBg}
                onChange={(e: any) => { const f = e?.target?.files?.[0]; if (f) handleBackgroundUpload(f); }} />
            </label>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-xl p-6 border border-border/30 mb-6" style={{ boxShadow: 'var(--shadow-md)' }}
      >
        <h3 className="font-display text-lg font-bold mb-5 flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" /> Colores
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: 'primaryColor', label: 'Primario' },
            { key: 'secondaryColor', label: 'Secundario' },
            { key: 'accentColor', label: 'Acento' },
          ].map((c: any) => (
            <div key={c?.key}>
              <label className="text-sm font-medium mb-2 block">{c?.label ?? ''}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={(settings as any)?.[c?.key] ?? '#000000'}
                  onChange={(e: any) => setSettings((p: any) => ({ ...(p ?? {}), [c?.key]: e?.target?.value ?? '' }))}
                  className="w-10 h-10 rounded-lg border border-border/50 cursor-pointer bg-transparent" />
                <span className="text-xs text-muted-foreground font-mono">{(settings as any)?.[c?.key] ?? ''}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar Ajustes'}
      </button>
    </div>
  );
}