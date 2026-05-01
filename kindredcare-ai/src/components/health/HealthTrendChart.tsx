"use client";

import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";

interface BPPoint {
  recorded_at: string;
  systolic: number;
  diastolic: number;
}

export function BPTrendChart({ data }: { data: BPPoint[] }) {
  const chartData = data
    .slice()
    .reverse()
    .map((d) => ({
      date: format(parseISO(d.recorded_at), "MMM d"),
      systolic: d.systolic,
      diastolic: d.diastolic,
    }));

  if (chartData.length === 0) {
    return <p className="text-gray-500 text-center py-8">No blood pressure data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip />
        <Line type="monotone" dataKey="systolic" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} name="Systolic" />
        <Line type="monotone" dataKey="diastolic" stroke="#1e40af" strokeWidth={2} dot={{ r: 4 }} name="Diastolic" />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface SugarPoint {
  recorded_at: string;
  value: number;
}

export function SugarTrendChart({ data }: { data: SugarPoint[] }) {
  const chartData = data
    .slice()
    .reverse()
    .map((d) => ({ date: format(parseISO(d.recorded_at), "MMM d"), value: d.value }));

  if (chartData.length === 0) {
    return <p className="text-gray-500 text-center py-8">No blood sugar data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#0f766e" strokeWidth={2} dot={{ r: 4 }} name="mg/dL" />
      </LineChart>
    </ResponsiveContainer>
  );
}
