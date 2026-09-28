import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = Array.from({ length: 61 }, (_, i) => String(i).padStart(2, "0"));
const QUICK_MINUTES = ["00", "15", "30", "45", "60"];

function parseTimeComponents(timeStr) {
  if (!timeStr) return null;
  const match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;

  const rawHour = parseInt(match[1], 10);
  const rawMin = parseInt(match[2], 10);
  const rawAmpm = (match[3] || "AM").toUpperCase();

  const validHour = rawHour >= 1 && rawHour <= 12 ? rawHour : 12;
  const validMin = rawMin >= 0 && rawMin <= 60 ? String(rawMin).padStart(2, "0") : "00";
  const validAmpm = rawAmpm === "PM" ? "PM" : "AM";

  return {
    hour: validHour,
    minute: validMin,
    ampm: validAmpm,
    totalMinutes: ((validHour % 12) + (validAmpm === "PM" ? 12 : 0)) * 60 + parseInt(validMin, 10),
  };
}

function checkExactTimeMatch(timeStr1, timeStr2) {
  if (!timeStr1 || !timeStr2) return false;
  const t1 = String(timeStr1).trim();
  const t2 = String(timeStr2).trim();
  if (t1.toLowerCase() === t2.toLowerCase()) return true;

  const p1 = parseTimeComponents(t1);
  const p2 = parseTimeComponents(t2);
  if (!p1 || !p2) return false;

  // Exact match if parsed hours, minutes, and AM/PM are all equal
  if (p1.hour === p2.hour && p1.minute === p2.minute && p1.ampm === p2.ampm) {
    return true;
  }

  // Also match if total minutes are equivalent (e.g. 9:60 AM vs 10:00 AM)
  return p1.totalMinutes === p2.totalMinutes;
}

function TimePickerModal({
  isOpen,
  onClose,
  onConfirm,
  initialTime = "",
  otherTime = "",
  fieldLabel = "Start",
  subjectCode = "",
  subjectTitle = "",
}) {
  const titleId = useId();
  const otherFieldLabel = fieldLabel === "Start" ? "End" : "Start";

  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedAmpm, setSelectedAmpm] = useState("AM");

  // Synchronize state when modal opens or initial values change
  useEffect(() => {
    if (!isOpen) return;

    const parsed = parseTimeComponents(initialTime);
    if (parsed) {
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);
      setSelectedAmpm(parsed.ampm);
    } else {
      // Sensible defaults if no existing time
      if (fieldLabel === "Start") {
        setSelectedHour(8);
        setSelectedMinute("00");
        setSelectedAmpm("AM");
      } else {
        setSelectedHour(5);
        setSelectedMinute("00");
        setSelectedAmpm("PM");
      }
    }
  }, [isOpen, initialTime, fieldLabel]);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const currentFormattedTime = useMemo(
    () => `${selectedHour}:${selectedMinute} ${selectedAmpm}`,
    [selectedHour, selectedMinute, selectedAmpm]
  );

  const isExactMatch = useMemo(() => {
    if (!otherTime || !String(otherTime).trim()) return false;
    return checkExactTimeMatch(currentFormattedTime, otherTime);
  }, [currentFormattedTime, otherTime]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (isExactMatch) return;
    onConfirm?.(currentFormattedTime);
  };

  return createPortal(
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close time selector"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
              <i className="fa-regular fa-clock text-base" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                12-Hour Format
              </p>
              <h2
                id={titleId}
                className="text-lg font-extrabold tracking-tight text-slate-900"
              >
                Select {fieldLabel} Time
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5 p-5">
          {subjectCode ? (
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
              <span className="font-bold text-slate-800">{subjectCode}</span>
              {subjectTitle ? <span className="truncate text-slate-400">• {subjectTitle}</span> : null}
            </div>
          ) : null}

          {/* Time Display Card */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-[#f4fbf3] py-4 px-3 shadow-inner">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800/80">
              Selected {fieldLabel} Time
            </span>
            <div className="mt-1 font-mono text-3xl font-extrabold tracking-tight text-slate-900">
              {String(selectedHour).padStart(2, "0")} : {selectedMinute}{" "}
              <span className="text-xl font-bold text-emerald-800">{selectedAmpm}</span>
            </div>
            {otherTime ? (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <span>{otherFieldLabel} Time:</span>
                <span className="font-bold text-slate-700">{otherTime}</span>
              </div>
            ) : null}
          </div>

          {/* Selectors */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Hour Selector (1 - 12) */}
            <div>
              <label
                htmlFor="timepicker-hour"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-500"
              >
                Hour (1-12)
              </label>
              <select
                id="timepicker-hour"
                value={selectedHour}
                onChange={(e) => setSelectedHour(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-center text-sm font-bold text-slate-800 shadow-sm transition hover:border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {HOURS.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour} ({String(hour).padStart(2, "0")})
                  </option>
                ))}
              </select>
            </div>

            {/* Minute Selector (00 - 60) */}
            <div>
              <label
                htmlFor="timepicker-minute"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-500"
              >
                Minute (00-60)
              </label>
              <select
                id="timepicker-minute"
                value={selectedMinute}
                onChange={(e) => setSelectedMinute(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-center text-sm font-bold text-slate-800 shadow-sm transition hover:border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {MINUTES.map((min) => (
                  <option key={min} value={min}>
                    {min}
                  </option>
                ))}
              </select>
            </div>

            {/* AM / PM Selector */}
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Period
              </span>
              <div className="mt-1 flex h-[42px] rounded-xl border border-slate-200 bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setSelectedAmpm("AM")}
                  className={`flex-1 rounded-lg text-xs font-bold transition ${
                    selectedAmpm === "AM"
                      ? "bg-emerald-800 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAmpm("PM")}
                  className={`flex-1 rounded-lg text-xs font-bold transition ${
                    selectedAmpm === "PM"
                      ? "bg-emerald-800 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>

          {/* Quick Minute Presets */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400">Quick Minute Presets</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {QUICK_MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMinute(m)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                    selectedMinute === m
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  :{m}
                </button>
              ))}
            </div>
          </div>

          {/* Exact Match Warning */}
          {isExactMatch ? (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 animate-in fade-in"
            >
              <i className="fa-solid fa-triangle-exclamation mt-0.5 shrink-0 text-sm text-rose-500" />
              <div>
                <p className="font-bold">Exact Time Conflict</p>
                <p className="mt-0.5 text-rose-700">
                  {fieldLabel} time cannot be the exact same value as {otherFieldLabel} time ({otherTime}).
                  The OK button is disabled until a different time is selected.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50 px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isExactMatch}
            onClick={handleConfirm}
            className={`rounded-xl px-5 py-2 text-sm font-bold transition ${
              isExactMatch
                ? "cursor-not-allowed border border-slate-200 bg-slate-200 text-slate-400 opacity-60 shadow-none pointer-events-none"
                : "cursor-pointer bg-emerald-800 text-white shadow-sm hover:bg-emerald-700 active:scale-95"
            }`}
            title={isExactMatch ? "Cannot select exact same time as other box" : "Confirm time selection"}
          >
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default TimePickerModal;
