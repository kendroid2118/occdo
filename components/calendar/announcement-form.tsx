"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { createAnnouncementFormAction } from "@/lib/actions/announcements";
import { ANNOUNCEMENT_ACTION_ERROR_MESSAGE } from "@/lib/announcements/form-errors";

const fieldClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700";

export function AnnouncementForm() {
  const [state, formAction, pending] = useActionState(createAnnouncementFormAction, null);
  const errorMessage =
    state && state.ok === false ? ANNOUNCEMENT_ACTION_ERROR_MESSAGE[state.code] : null;

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {errorMessage ? (
        <p className="text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-sm font-medium text-slate-800" htmlFor="title">
            Title
          </label>
          <input className={fieldClass} id="title" name="title" required />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-sm font-medium text-slate-800" htmlFor="body">
            Body
          </label>
          <textarea
            className="min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
            id="body"
            name="body"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="publishedDate">
            Published date (Asia/Manila)
          </label>
          <input className={fieldClass} id="publishedDate" name="publishedDate" required type="date" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="publishedTime">
            Published time (Asia/Manila)
          </label>
          <input
            className={fieldClass}
            defaultValue="08:00"
            id="publishedTime"
            name="publishedTime"
            required
            type="time"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="expiresDate">
            Expires date (Asia/Manila)
          </label>
          <input className={fieldClass} id="expiresDate" name="expiresDate" type="date" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="expiresTime">
            Expires time (Asia/Manila)
          </label>
          <input className={fieldClass} id="expiresTime" name="expiresTime" type="time" />
        </div>
        <div className="md:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-800">
            <input defaultChecked id="isActive" name="isActive" type="checkbox" value="true" />
            Active
          </label>
        </div>
      </div>

      <div className="flex gap-2">
        <Button disabled={pending} type="submit">
          Publish announcement
        </Button>
        <Button asChild variant="outline">
          <Link href="/calendar/announcements">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
