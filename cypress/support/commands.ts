import { COOKIE } from "../constants/api";

interface FolderConfig {
  downloadsPath: string;
  libraryPath: string;
}

declare global {
  namespace Cypress {
    interface Chainable {
      setFolderConfigCookie(config: FolderConfig): Chainable<void>;
    }
  }
}

Cypress.Commands.add("setFolderConfigCookie", (config: FolderConfig) => {
  cy.setCookie(COOKIE.folderConfigured, encodeURIComponent(JSON.stringify(config)));
});
