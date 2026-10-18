"use client";

import { useActionState, useState } from "react";

import { saveClosureAction, type ClosureState } from "@/actions/closures";

const initialState: ClosureState = {};

export function ClosureForm({ today }: { today: string }) {
  const [state, action, pending] = useActionState(saveClosureAction, initialState);
  const [allDay, setAllDay] = useState(false);

  return (
    <form action={action} className="admin-card p-5 sm:p-6">
      <h2 className="font-serif text-2xl">Add a closure</h2>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Block a full day or a time range. Slots that overlap a closure will not
        be bookable.
      </p>

      {state.message ? (
        <p
          role="status"
          className={`mt-4 border px-3 py-2 text-sm ${
            state.ok ? "border-line bg-white" : "border-ink/30 bg-mist"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="admin-label">Date</span>
          <input
            type="date"
            name="date"
            required
            min={today}
            defaultValue={today}
            className="admin-input"
          />
        </label>
        <label className="block">
          <span className="admin-label">Reason (optional)</span>
          <input
            type="text"
            name="reason"
            placeholder="Public holiday, training…"
            className="admin-input"
          />
        </label>
        <label className="flex items-center gap-3 border border-line px-4 py-3 text-sm sm:col-span-2">
          <input
            type="checkbox"
            name="allDay"
            checked={allDay}
            onChange={(event) => setAllDay(event.target.checked)}
            className="h-4 w-4 accent-black"
          />
          Closed all day
        </label>
        {!allDay ? (
          <>
            <label className="block">
              <span className="admin-label">From</span>
              <input
                type="time"
                name="startTime"
                defaultValue="09:00"
                className="admin-input"
              />
            </label>
            <label className="block">
              <span className="admin-label">To</span>
              <input
                type="time"
                name="endTime"
                defaultValue="13:00"
                className="admin-input"
              />
            </label>
          </>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="label mt-5 bg-ink px-5 py-3 text-white hover:bg-black disabled:opacity-50"
      >
        {pending ? "Saving…" : "Add closure"}
      </button>
    </form>
  );
}
