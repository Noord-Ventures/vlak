"use client";

import type { ComponentType } from "react";
import { inputNavigationPreviews } from "./input-navigation";
import { dataPreviews } from "./data";
import { mediaPreviews } from "./media";
import { healthPreviews } from "./health";

/** Raw, interactive specimens. Editorial compositions belong only in In action. */
export const additionPreviews: Record<string, ComponentType> = {
  ...inputNavigationPreviews,
  ...dataPreviews,
  ...mediaPreviews,
  ...healthPreviews,
};
