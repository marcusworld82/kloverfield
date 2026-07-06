"use client";

// Remotion composition rendered by the Player (live preview) and by the
// server-side export job. Video clips with a src show the media; clips
// without one render a branded placeholder block.

import {
  AbsoluteFill,
  Sequence,
  Img,
  useVideoConfig,
} from "remotion";
import type { TimelineClip, TrackId } from "@/store/timeline-store";

export interface CompositionProps {
  tracks: Record<TrackId, TimelineClip[]>;
  [key: string]: unknown;
}

export function KloverfieldComposition({ tracks }: CompositionProps) {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A0A" }}>
      {tracks.video.map((clip) => (
        <Sequence key={clip.id} from={clip.start} durationInFrames={clip.duration}>
          <AbsoluteFill
            style={{
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#111111",
            }}
          >
            {clip.src ? (
              <Img
                src={clip.src}
                style={{ width, height, objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  color: "#B3B3B3",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 36,
                  textAlign: "center",
                  padding: 40,
                  border: "2px solid #C8102E",
                  borderRadius: 24,
                }}
              >
                {clip.label}
              </div>
            )}
          </AbsoluteFill>
        </Sequence>
      ))}

      {tracks.text.map((clip) => (
        <Sequence key={clip.id} from={clip.start} durationInFrames={clip.duration}>
          <AbsoluteFill
            style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 80 }}
          >
            <div
              style={{
                color: "#FFFFFF",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: 48,
                textShadow: "0 2px 12px rgba(0,0,0,0.8)",
              }}
            >
              {clip.label}
            </div>
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
