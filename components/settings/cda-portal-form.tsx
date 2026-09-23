"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { upsertCdaPortalUrlFormAction, type CdaPortalConfig } from "@/lib/actions/system-config";
import { SYSTEM_CONFIG_ACTION_ERROR_MESSAGE } from "@/lib/settings/form-errors";

const fieldClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700";

type CdaPortalFormProps = {
  config: CdaPortalConfig;
};

export function CdaPortalForm({ config }: CdaPortalFormProps) {
  const [state, formAction, pending] = useActionState(upsertCdaPortalUrlFormAction, null);
  const errorMessage =
    state && state.ok === false ? SYSTEM_CONFIG_ACTION_ERROR_MESSAGE[state.code] : null;

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {errorMessage ? (
        <p className="text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-800" htmlFor="value">
          CDA Portal URL
        </label>
        <input
          className={fieldClass}
          defaultValue={config.storedValue ?? ""}
          id="value"
          name="value"
          placeholder="https://"
          type="url"
        />
        <p className="text-xs text-slate-500">
          Non-secret office shortcut only. Leave empty to use the environment fallback. Secrets stay
          in environment variables.
        </p>
      </div>

      <Button disabled={pending} type="submit">
        Save configuration
      </Button>
    </form>
  );
}
