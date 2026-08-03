"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { RecordDialog } from "@/components/admin/record-dialog";
import { AnnouncementList } from "@/components/announcements/announcement-list";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestJson } from "@/lib/admin/client";
import { announcementSchema } from "@/lib/announcements/schemas";
import type { Announcement, AnnouncementForm, AnnouncementSetup } from "@/lib/announcements/types";

type Values = AnnouncementForm;

function AnnouncementFormEditor({ setup, item, submit, pending }: { setup: AnnouncementSetup; item: Announcement | null; submit: (values: Values) => void; pending: boolean }) {
  const initialTarget = item?.target ?? (setup.isAdmin ? "all" : "section");
  const form = useForm<Values>({
    resolver: zodResolver(announcementSchema) as never,
    defaultValues: item
      ? { title: item.title, body: item.body, status: item.status, target: item.target, targetIds: item.targetIds, publishedOn: item.publishedOn ?? "", expiresOn: item.expiresOn ?? "" }
      : { title: "", body: "", status: "draft", target: initialTarget, targetIds: [], publishedOn: new Date().toISOString().slice(0, 10), expiresOn: "" },
  });
  const [target, setTarget] = useState<Values["target"]>(initialTarget);
  const targetField = form.register("target");
  const options = target === "role"
    ? setup.roles.map((value) => ({ id: value, label: value }))
    : target === "class"
      ? setup.classes.map((value) => ({ id: value.id, label: value.name }))
      : target === "section"
        ? (setup.isAdmin ? setup.sections : setup.teacherSections)
        : target === "academicYear"
          ? setup.academicYears
          : [];

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
      <FormField id="announcementTitle" label="Title" required error={form.formState.errors.title?.message}>
        <Input id="announcementTitle" {...form.register("title")} />
      </FormField>
      <FormField id="announcementBody" label="Content" required error={form.formState.errors.body?.message}>
        <textarea id="announcementBody" className="min-h-32 w-full rounded-md border bg-card px-3 py-2 text-sm" {...form.register("body")} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="announcementStatus" label="Status" required>
          <select id="announcementStatus" className="h-10 w-full rounded-md border bg-card px-3 text-sm" {...form.register("status")}>
            <option value="draft">Draft</option><option value="published">Publish</option><option value="archived">Archive</option>
          </select>
        </FormField>
        <FormField id="announcementTarget" label="Audience" required>
          <select id="announcementTarget" className="h-10 w-full rounded-md border bg-card px-3 text-sm" {...targetField} onChange={(event) => { targetField.onChange(event); setTarget(event.target.value as Values["target"]); form.setValue("targetIds", []); }}>
            <option value="all" disabled={!setup.isAdmin}>All users</option><option value="section">Section</option>
            {setup.isAdmin ? <><option value="role">Role</option><option value="class">Class</option><option value="academicYear">Academic year</option></> : null}
          </select>
        </FormField>
      </div>
      {target !== "all" ? <FormField id="announcementTargets" label="Targets" required error={form.formState.errors.targetIds?.message}>
        <select id="announcementTargets" multiple className="min-h-28 w-full rounded-md border bg-card px-3 py-2 text-sm" {...form.register("targetIds")}>
          {options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
      </FormField> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="publishOn" label="Publish date" error={form.formState.errors.publishedOn?.message}><Input id="publishOn" type="date" {...form.register("publishedOn")} /></FormField>
        <FormField id="expiresOn" label="Expiry date" error={form.formState.errors.expiresOn?.message}><Input id="expiresOn" type="date" {...form.register("expiresOn")} /></FormField>
      </div>
      <div className="flex justify-end border-t pt-4"><Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save announcement"}</Button></div>
    </form>
  );
}

export function AnnouncementManagement({ initialData }: { initialData: AnnouncementSetup }) {
  const cache = useQueryClient();
  const query = useQuery({ queryKey: ["announcement-setup"], queryFn: () => requestJson<AnnouncementSetup>("/api/announcements"), initialData });
  const [item, setItem] = useState<Announcement | null | undefined>();
  const save = useMutation({
    mutationFn: (values: Values) => requestJson("/api/announcements", { method: "POST", body: JSON.stringify({ ...values, id: item?.id }) }),
    onSuccess: () => { toast.success("Announcement saved."); setItem(undefined); cache.invalidateQueries({ queryKey: ["announcement-setup"] }); },
    onError: (error) => toast.error(error.message),
  });
  const setup = query.data;
  if (!setup) return null;

  return <section className="space-y-5"><div className="flex justify-end"><Button onClick={() => setItem(null)}><Plus className="size-4" />Create announcement</Button></div><div className="space-y-3">{setup.announcements.map((announcement) => <div key={announcement.id} className="flex items-start gap-2"><div className="min-w-0 flex-1"><AnnouncementList announcements={[announcement]} /></div><Button size="sm" variant="ghost" aria-label="Edit announcement" onClick={() => setItem(announcement)}><Pencil className="size-4" /></Button></div>)}{!setup.announcements.length ? <AnnouncementList announcements={[]} empty="No announcements created yet." /> : null}</div><RecordDialog open={item !== undefined} onOpenChange={(open) => { if (!open) setItem(undefined); }} title={item ? "Edit announcement" : "Create announcement"} description={setup.isAdmin ? "Published announcements are visible only to their selected audience." : "Teachers may publish only to sections they are assigned to."}><AnnouncementFormEditor key={item?.id ?? "new"} setup={setup} item={item ?? null} submit={(values) => save.mutate(values)} pending={save.isPending} /></RecordDialog></section>;
}
