"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCommitmentAction } from "@/features/commitments/actions";

export function CreateCommitmentForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setError(undefined);
    startTransition(async () => {
      const result = await createCommitmentAction(Object.fromEntries(formData));
      if (result.error) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
      router.refresh();
    });
  }

  return <form ref={formRef} action={submit} className="commitment-form pact-card">
    <div className="commitment-form-heading"><p className="eyebrow">MAKE A PACT</p><h2>Choose one clear promise.</h2></div>
    <label className="field"><span>Title</span><input name="title" required maxLength={160} placeholder="What will you follow through on?" /></label>
    <label className="field"><span>Deadline</span><input name="deadline" type="datetime-local" required /></label>
    <label className="field"><span>Priority</span><select name="priority" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
    <label className="field"><span>Notes <small>optional</small></span><textarea name="description" maxLength={2000} rows={3} /></label>
    <label className="field"><span>Consequence <small>optional, kept private unless missed</small></span><textarea name="consequence" maxLength={500} rows={2} /></label>
    {error ? <p className="field-error" role="alert">{error}</p> : null}
    <button className="button-primary" type="submit" disabled={isPending}>{isPending ? "Creating…" : "Create commitment"}</button>
  </form>;
}
