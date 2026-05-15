import { render, screen } from "@testing-library/react";
import { HealthBadge } from ".";
import { HEALTH_LABEL } from "@/lib/health";
import type { HealthStatus } from "@/types/track";

const STATUSES: HealthStatus[] = ["complete", "warning", "alert", "critical"];

describe("HealthBadge", () => {
  it("renders without crashing", () => {
    render(<HealthBadge status="complete" />);
  });

  it.each(STATUSES)("renders the correct label for status %s", (status) => {
    render(<HealthBadge status={status} />);
    expect(screen.getByText(HEALTH_LABEL[status])).toBeInTheDocument();
  });

  it.each(STATUSES)("has an accessible aria-label for status %s", (status) => {
    render(<HealthBadge status={status} />);
    expect(
      screen.getByRole("status", { name: `Salud: ${HEALTH_LABEL[status]}` }),
    ).toBeInTheDocument();
  });
});
