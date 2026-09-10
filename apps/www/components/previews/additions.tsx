"use client";

import dynamic from "next/dynamic";

import type { ComponentType } from "react";
import { iosPreviews } from "./ios";
import { androidPreviews } from "./android";
import { aiAttachmentPreviews } from "./ai-attachments";
import { aiCodeToolsPreviews } from "./ai-code-tools";
import { aiChatControlPreviews } from "./ai-chat-controls";
import { aiWorkPatternPreviews } from "./ai-work-patterns";
import { aiVoicePreviews } from "./ai-voice";
import { aiCodePreviews } from "./ai-code";
import { aiPreviews } from "./ai";
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
  ...iosPreviews,
  ...androidPreviews,
  ...aiAttachmentPreviews,
  ...aiCodeToolsPreviews,
  ...aiChatControlPreviews,
  "workflow-canvas": dynamic(() => import("./ai-workflow").then(module => module.aiWorkflowPreviews["workflow-canvas"])),
  "response-branch": dynamic(() => import("./ai-rich-response").then(module => module.ResponseBranchPreview)),
  "highlighted-code": dynamic(() => import("./ai-rich-response").then(module => module.HighlightedCodePreview)),
  "response-markdown": dynamic(() => import("./ai-rich-response").then(module => module.MarkdownPreview)),
  ...aiWorkPatternPreviews,
  ...aiVoicePreviews,
  ...aiCodePreviews,
  ...aiPreviews,
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
