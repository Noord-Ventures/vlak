"use client";

import type { ComponentType } from "react";
import { inputNavigationPreviews } from "./input-navigation";
import { dataPreviews } from "./data";
import { mediaPreviews } from "./media";
import { healthPreviews } from "./health";

import { civicPreviews } from "./civic";
import { sciencePreviews } from "./science";
import { creativePreviews } from "./creative";

import { geospatialPreviews } from "./geospatial";
import { scienceSpecialistPreviews } from "./science-specialist";
import { workbenchPreviews } from "./workbench";
import { engineeringPreviews } from "./engineering";

import { roboticsPreviews } from "./robotics";
import { electronicsPreviews } from "./electronics";
import { microbiologyPreviews } from "./microbiology";

/** Raw, interactive specimens. Editorial compositions belong only in In action. */
export const additionPreviews: Record<string, ComponentType> = {
  ...inputNavigationPreviews,
  ...dataPreviews,
  ...mediaPreviews,
  ...healthPreviews,
  ...civicPreviews,
  ...sciencePreviews,
  ...creativePreviews,
  ...geospatialPreviews,
  ...scienceSpecialistPreviews,
  ...workbenchPreviews,
  ...engineeringPreviews,
  ...roboticsPreviews,
  ...electronicsPreviews,
  ...microbiologyPreviews,
};
