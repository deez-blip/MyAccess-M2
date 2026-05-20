"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
  Search,
  UserRound,
} from "lucide-react";
import { auditApi, AuditLog, AuditLogsResponse } from "@/lib/api";

const EVENT_TYPES = [
  "all",
  "page_view",
  "login",
  "logout",
  "signup",
  "profile_update",
  "review_create",
  "review_update",
  "review_delete",
];

const LIMIT = 50;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

function formatEventType(value: string) {
  return value.replaceAll("_", " ");
}

function getUserLabel(log: AuditLog) {
  if (log.userEmail) return log.userEmail;
  if (log.userName) return log.userName;
  if (log.visitorId) return `Anonyme ${log.visitorId.slice(0, 8)}`;
  return "Anonyme";
}

function StatBlock({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className="text-slate-400">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export default function AdminPage() {
  const [data, setData] = useState<AuditLogsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("all");
  const [offset, setOffset] = useState(0);

  const total = data?.pagination.total || 0;
  const currentPage = Math.floor(offset / LIMIT) + 1;
  const pageCount = Math.max(1, Math.ceil(total / LIMIT));

  const mostFrequentEvent = useMemo(() => {
    const firstEvent = data?.stats.byEventType[0];
    if (!firstEvent) return "-";
    return `${formatEventType(firstEvent.event_type)} (${firstEvent.count})`;
  }, [data]);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await auditApi.logs({
        limit: LIMIT,
        offset,
        search: search.trim(),
        eventType,
      });
      setData(result);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Erreur lors du chargement des logs"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, eventType]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOffset(0);
    fetchLogs();
  };

  const goToPreviousPage = () => {
    setOffset((currentOffset) => Math.max(0, currentOffset - LIMIT));
  };

  const goToNextPage = () => {
    setOffset((currentOffset) =>
      currentOffset + LIMIT >= total ? currentOffset : currentOffset + LIMIT
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-slate-500">
                Administration
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
                Suivi utilisateur
              </h1>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto"
            >
              <div className="relative min-w-0 sm:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher"
                  className="h-11 w-full border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-slate-950"
                />
              </div>

              <select
                value={eventType}
                onChange={(event) => {
                  setEventType(event.target.value);
                  setOffset(0);
                }}
                className="h-11 border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-950"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type === "all" ? "Tous les événements" : formatEventType(type)}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Search className="h-4 w-4" />
                Filtrer
              </button>

              <button
                type="button"
                onClick={fetchLogs}
                className="inline-flex h-11 items-center justify-center border border-slate-300 bg-white px-3 text-slate-700 transition hover:bg-slate-100"
                aria-label="Rafraîchir les logs"
                title="Rafraîchir les logs"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </form>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatBlock
            icon={<Activity className="h-5 w-5" />}
            label="Logs filtrés"
            value={total}
          />
          <StatBlock
            icon={<Clock className="h-5 w-5" />}
            label="Dernières 24 h"
            value={data?.stats.last24h || 0}
          />
          <StatBlock
            icon={<UserRound className="h-5 w-5" />}
            label="Événement dominant"
            value={mostFrequentEvent}
          />
        </div>

        <section className="mt-6 border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Derniers événements
              </h2>
              <p className="text-sm text-slate-500">
                Page {currentPage} sur {pageCount}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={offset === 0 || isLoading}
                className="inline-flex h-9 w-9 items-center justify-center border border-slate-300 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Page précédente"
                title="Page précédente"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goToNextPage}
                disabled={offset + LIMIT >= total || isLoading}
                className="inline-flex h-9 w-9 items-center justify-center border border-slate-300 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Page suivante"
                title="Page suivante"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {error ? (
            <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Événement</th>
                  <th className="px-4 py-3 font-semibold">Page</th>
                  <th className="px-4 py-3 font-semibold">Utilisateur</th>
                  <th className="px-4 py-3 font-semibold">Visiteur</th>
                  <th className="px-4 py-3 font-semibold">IP</th>
                  <th className="px-4 py-3 font-semibold">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                      Chargement
                    </td>
                  </tr>
                ) : null}

                {!isLoading && data?.logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                      Aucun log trouvé
                    </td>
                  </tr>
                ) : null}

                {!isLoading &&
                  data?.logs.map((log) => (
                    <tr key={log.id} className="align-top hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                          {formatEventType(log.eventType)}
                        </span>
                      </td>
                      <td className="max-w-[260px] px-4 py-3 font-mono text-xs text-slate-700">
                        <span className="block truncate" title={log.pagePath || ""}>
                          {log.pagePath || "-"}
                        </span>
                      </td>
                      <td className="max-w-[240px] px-4 py-3 text-slate-700">
                        <span className="block truncate" title={getUserLabel(log)}>
                          {getUserLabel(log)}
                        </span>
                      </td>
                      <td className="max-w-[180px] px-4 py-3 font-mono text-xs text-slate-600">
                        <span className="block truncate" title={log.visitorId || ""}>
                          {log.visitorId || "-"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600">
                        {log.ipAddress || "-"}
                      </td>
                      <td className="max-w-[260px] px-4 py-3 font-mono text-xs text-slate-600">
                        <span
                          className="block truncate"
                          title={JSON.stringify(log.metadata)}
                        >
                          {JSON.stringify(log.metadata)}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
