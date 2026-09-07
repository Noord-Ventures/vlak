"use client";

import { useState } from "react";
import { RenderQueue } from "@noorddev/vlak-react";
import type { RenderJob } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker, UseCopy } from "../use-frame";

export function Use() {
  const [jobs, setJobs] = useState<RenderJob[]>([{ id: "master", label: "Film master", status: "rendering", progress: 42, detail: "ProRes master" }, { id: "review", label: "Review copy", status: "failed", detail: "Destination was unavailable" }]);
  return <UseField name="render-queue"><UseType>Keep exports visible</UseType><UseBody><UseStack><UseKicker>Delivery workspace</UseKicker><RenderQueue label="Exports" jobs={jobs} onCancel={(id) => setJobs((current) => current.map((job) => job.id === id ? { ...job, status: "canceled" } : job))} onRetry={(id) => setJobs((current) => current.map((job) => job.id === id ? { ...job, status: "queued", progress: null, detail: "Waiting for the renderer" } : job))} /><UseCopy>Actions update sample records. A renderer owns real export work.</UseCopy></UseStack></UseBody></UseField>;
}
