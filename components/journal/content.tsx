import type { ReactNode } from "react";
import { JOURNAL, type JournalEntry } from "@/lib/journal";
import { WhyWindowDoorSchedulesGoWrong } from "@/components/journal/posts/why-window-and-door-schedules-go-wrong";
import { WhatICheckBeforeDrawingsGoToSite } from "@/components/journal/posts/what-i-check-before-drawings-go-to-site";
import { HowToReviewArchitectDrawingRegister } from "@/components/journal/posts/how-to-review-architect-drawing-register";
import { Stage4VsStage5Drawings } from "@/components/journal/posts/stage-4-vs-stage-5-drawings";
import { BuildingControlDrawingSupport } from "@/components/journal/posts/building-control-drawing-support";
import { BuildabilityReviewBeforeIssue } from "@/components/journal/posts/buildability-review-before-issue";

/** Maps a journal slug to its article body component. Add an entry here when a post is ready to publish. */
export const POST_CONTENT: Record<string, () => ReactNode> = {
  "buildability-review-before-issue": BuildabilityReviewBeforeIssue,
  "building-control-drawing-support": BuildingControlDrawingSupport,
  "stage-4-vs-stage-5-drawings": Stage4VsStage5Drawings,
  "how-to-review-architect-drawing-register": HowToReviewArchitectDrawingRegister,
  "what-i-check-before-drawings-go-to-site": WhatICheckBeforeDrawingsGoToSite,
  "why-window-and-door-schedules-go-wrong": WhyWindowDoorSchedulesGoWrong,
};

/**
 * Entries that actually have a written article body.
 *
 * An entry may exist in lib/journal.ts as metadata only (a draft). It stays out
 * of the live site — homepage, journal index, sitemap and static params — until
 * its content is registered in POST_CONTENT above. This prevents a planned-but-
 * unwritten post from producing dead 404 links.
 */
export const PUBLISHED: JournalEntry[] = JOURNAL.filter((entry) => entry.slug in POST_CONTENT);
