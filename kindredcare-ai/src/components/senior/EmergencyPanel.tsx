"use client";

import type { EmergencyContact, Doctor } from "@/types/domain";
import { BigButton } from "./BigButton";

interface EmergencyPanelProps {
  contacts: EmergencyContact[];
  doctors: Doctor[];
  careCenterPhone?: string | null;
}

export function EmergencyPanel({ contacts, doctors, careCenterPhone }: EmergencyPanelProps) {
  const call = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\D/g, "")}`;
  };

  return (
    <div className="flex flex-col gap-5 p-4">
      <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4">
        <p className="text-senior-base font-bold text-red-700 text-center mb-1">
          In a life-threatening emergency, call 911 immediately.
        </p>
        <BigButton variant="emergency" size="xl" onClick={() => call("911")}>
          Call 911
        </BigButton>
      </div>

      {contacts.length > 0 && (
        <section aria-label="Emergency contacts">
          <h2 className="text-senior-lg font-bold text-gray-800 mb-3">Your Emergency Contacts</h2>
          <div className="flex flex-col gap-3">
            {contacts.map((c) => (
              <div key={c.id} className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex flex-col gap-2">
                <p className="text-senior-base font-bold">{c.full_name}</p>
                <p className="text-senior-sm text-gray-600">{c.relationship}</p>
                <BigButton onClick={() => call(c.phone)}>
                  Call {c.full_name}
                </BigButton>
              </div>
            ))}
          </div>
        </section>
      )}

      {doctors.length > 0 && (
        <section aria-label="Doctors">
          <h2 className="text-senior-lg font-bold text-gray-800 mb-3">Your Doctors</h2>
          <div className="flex flex-col gap-3">
            {doctors.map((d) => (
              <div key={d.id} className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex flex-col gap-2">
                <p className="text-senior-base font-bold">Dr. {d.full_name}</p>
                {d.specialty && <p className="text-senior-sm text-gray-600">{d.specialty}</p>}
                {d.phone && (
                  <BigButton variant="secondary" onClick={() => call(d.phone!)}>
                    Call Dr. {d.full_name.split(" ").slice(-1)[0]}
                  </BigButton>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {careCenterPhone && (
        <BigButton variant="secondary" onClick={() => call(careCenterPhone)}>
          Call Senior Care Center
        </BigButton>
      )}

      <p className="text-sm text-gray-500 text-center px-2">
        KindredCare AI is not a doctor and is not for medical diagnosis or treatment.
      </p>
    </div>
  );
}
