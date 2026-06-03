import type { ReactNode } from "react";
import { WhyWindowDoorSchedulesGoWrong } from "@/components/journal/posts/why-window-and-door-schedules-go-wrong";

/** Maps a journal slug to its article body component. */
export const POST_CONTENT: Record<string, () => ReactNode> = {
  "why-window-and-door-schedules-go-wrong": WhyWindowDoorSchedulesGoWrong,
};
