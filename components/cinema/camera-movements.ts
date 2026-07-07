// Cinema Studio camera movements + speed ramps (plan §6) — one-file editable,
// matching Higgsfield Cinema Studio's picker.

export interface CameraMovement {
  id: string;
  label: string;
  promptSuffix: string; // merged into the generation prompt
}

export const CAMERA_MOVEMENTS: CameraMovement[] = [
  { id: "static", label: "Static", promptSuffix: "static locked-off camera" },
  { id: "handheld", label: "Handheld", promptSuffix: "handheld camera with natural shake" },
  { id: "zoom-out", label: "Zoom Out", promptSuffix: "smooth zoom out" },
  { id: "zoom-in", label: "Zoom in", promptSuffix: "smooth zoom in" },
  { id: "camera-follows", label: "Camera follows", promptSuffix: "camera follows the subject" },
  { id: "pan-left", label: "Pan left", promptSuffix: "camera pans left" },
  { id: "pan-right", label: "Pan right", promptSuffix: "camera pans right" },
  { id: "tilt-up", label: "Tilt up", promptSuffix: "camera tilts up" },
  { id: "tilt-down", label: "Tilt down", promptSuffix: "camera tilts down" },
  { id: "orbit-around", label: "Orbit around", promptSuffix: "camera orbits around the subject" },
  { id: "dolly-in", label: "Dolly in", promptSuffix: "dolly in toward the subject" },
  { id: "dolly-out", label: "Dolly out", promptSuffix: "dolly out away from the subject" },
  { id: "jib-up", label: "Jib up", promptSuffix: "jib crane moves up" },
  { id: "jib-down", label: "Jib down", promptSuffix: "jib crane moves down" },
  { id: "drone-shot", label: "Drone shot", promptSuffix: "aerial drone shot" },
  { id: "dolly-left", label: "Dolly left", promptSuffix: "dolly moves left, tracking laterally" },
  { id: "dolly-right", label: "Dolly right", promptSuffix: "dolly moves right, tracking laterally" },
  { id: "360-roll", label: "360 roll", promptSuffix: "camera performs a 360 degree roll" },
];

export const SPEED_RAMPS = [
  "auto",
  "linear",
  "slow-motion",
  "hero ramp up",
  "custom",
] as const;
export type SpeedRamp = (typeof SPEED_RAMPS)[number];
