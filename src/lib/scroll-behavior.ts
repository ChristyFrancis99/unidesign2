export const WALKTHROUGH_VIDEO_SECONDS = 20;
export const DESKTOP_PIN_VIEWPORTS = 4;
export const MOBILE_PIN_VIEWPORTS = 3;

export function getWalkthroughTime(progress: number, duration: number): number {
  const normalizedProgress = Math.max(0, Math.min(1, progress));
  return normalizedProgress * duration;
}

export function getWalkthroughPinDistance(viewportHeight: number, isMobile: boolean): number {
  return viewportHeight * (isMobile ? MOBILE_PIN_VIEWPORTS : DESKTOP_PIN_VIEWPORTS);
}
