"use client";

import { BigButton } from "./BigButton";

interface ConfirmActionProps {
  prompt: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmAction({ prompt, onConfirm, onCancel }: ConfirmActionProps) {
  return (
    <div
      role="alertdialog"
      aria-label="Confirmation needed"
      className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-6 shadow-lg flex flex-col gap-5"
    >
      <p className="text-senior-lg font-semibold text-gray-900 text-center leading-snug">
        {prompt}
      </p>
      <div className="grid grid-cols-2 gap-4">
        <BigButton variant="confirm" onClick={onConfirm} aria-label="Yes, confirm">
          Yes
        </BigButton>
        <BigButton variant="cancel" onClick={onCancel} aria-label="No, cancel">
          No
        </BigButton>
      </div>
    </div>
  );
}
