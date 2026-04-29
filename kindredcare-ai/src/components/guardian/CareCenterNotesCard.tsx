import { format, parseISO } from "date-fns";

export interface StaffNote {
  id: string;
  content: string;
  created_at: string;
  author?: { full_name?: string | null } | { full_name?: string | null }[] | null;
}

interface CareCenterNotesCardProps {
  notes: StaffNote[];
}

function authorName(author: StaffNote["author"]): string {
  const a = Array.isArray(author) ? author[0] : author;
  return a?.full_name ?? "Care center staff";
}

export function CareCenterNotesCard({ notes }: CareCenterNotesCardProps) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
      <h3 className="text-lg font-bold text-gray-900 mb-3">Notes from the care center</h3>

      {notes.length === 0 ? (
        <p className="text-sm text-gray-500">No notes from the care center yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {notes.map((n) => (
            <li key={n.id} className="py-3">
              <p className="text-sm text-gray-800 leading-relaxed">{n.content}</p>
              <p className="text-xs text-gray-400 mt-1">
                {authorName(n.author)} · {format(parseISO(n.created_at), "MMM d")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
