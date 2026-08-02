"use client";

import { ImagePlus } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { requestJson } from "@/lib/admin/client";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export function ProfilePhotoUpload({ profileId }: { profileId: string }) {
  const input = useRef<HTMLInputElement>(null); const [uploading, setUploading] = useState(false);
  const upload = async (file: File) => {
    if (!allowedTypes.has(file.type)) { toast.error("Choose a JPEG, PNG, or WebP image."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Profile images must be 5 MB or smaller."); return; }
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"; const path = `${profileId}/${crypto.randomUUID()}.${extension}`;
    setUploading(true);
    try {
      const supabase = createClient(); const { error } = await supabase.storage.from("profile-photos").upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      await requestJson(`/api/admin/profiles/${profileId}/avatar`, { method: "PUT", body: JSON.stringify({ path }) });
      toast.success("Profile image uploaded.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "The image could not be uploaded."); }
    finally { setUploading(false); if (input.current) input.current.value = ""; }
  };
  return <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 p-3"><p className="text-sm text-muted-foreground">Upload a JPEG, PNG, or WebP image up to 5 MB.</p><input ref={input} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} /><Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => input.current?.click()}><ImagePlus className="size-4" />{uploading ? "Uploading…" : "Upload photo"}</Button></div>;
}
