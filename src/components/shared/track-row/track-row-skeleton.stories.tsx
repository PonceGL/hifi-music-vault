import type { Meta } from "@storybook/nextjs";
import { TrackRowSkeleton } from "./track-row-skeleton";

const meta = {
  title: "Shared/TrackRowSkeleton",
  component: TrackRowSkeleton,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TrackRowSkeleton>;

export default meta;

export const Default = {
  render: () => (
    <div className="bg-surface-primary">
      <TrackRowSkeleton />
    </div>
  ),
};

export const StaggeredList = {
  render: () => (
    <div className="bg-surface-primary divide-y divide-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <TrackRowSkeleton key={i} style={{ animationDelay: `${i * 50}ms` }} />
      ))}
    </div>
  ),
};
