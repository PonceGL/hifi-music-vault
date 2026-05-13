import type { Meta } from "@storybook/nextjs";
import { TrackCardSkeleton } from "./track-card-skeleton";

const meta = {
  title: "Shared/TrackCardSkeleton",
  component: TrackCardSkeleton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TrackCardSkeleton>;

export default meta;

export const Default = {
  render: () => (
    <div className="w-40 bg-surface-primary">
      <TrackCardSkeleton />
    </div>
  ),
};

export const StaggeredGrid = {
  render: () => (
    <div className="grid grid-cols-4 gap-3 bg-surface-primary p-4" style={{ width: 720 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <TrackCardSkeleton key={i} style={{ animationDelay: `${i * 50}ms` }} />
      ))}
    </div>
  ),
};
