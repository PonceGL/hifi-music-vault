describe("Smoke", () => {
  it("app is reachable", () => {
    cy.visit("/");
    cy.url().should("include", "/");
  });
});
