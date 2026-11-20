import { describe, expect, it } from "vitest";

import {
  getWalkthroughPinDistance,
  getWalkthroughTime,
  WALKTHROUGH_VIDEO_SECONDS,
} from "@/lib/scroll-behavior";

describe("UnI Design Group walkthrough behaviour", () => {
  it("maps the full scroll range to the uploaded 20-second walkthrough", () => {
    expect(WALKTHROUGH_VIDEO_SECONDS).toBe(20);
    expect(getWalkthroughTime(0, 20)).toBe(0);
    expect(getWalkthroughTime(0.5, 20)).toBe(10);
    expect(getWalkthroughTime(1, 20)).toBe(20);
  });

  it("pins for four desktop viewports and three mobile viewports", () => {
    expect(getWalkthroughPinDistance(900, false)).toBe(3600);
    expect(getWalkthroughPinDistance(900, true)).toBe(2700);
  });

  it("clamps scroll progress at the video endpoints", () => {
    expect(getWalkthroughTime(-1, 20)).toBe(0);
    expect(getWalkthroughTime(2, 20)).toBe(20);
  });
});
