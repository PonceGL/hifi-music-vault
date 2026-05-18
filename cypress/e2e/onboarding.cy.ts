import { API, COOKIE } from "../constants/api";
import { ONBOARDING } from "../constants/strings";

// ─── Test paths ───────────────────────────────────────────────────────────────

const DOWNLOADS_PATH = "/Users/test/Downloads/";
const LIBRARY_PATH = "/Users/test/Music/Library";

// ─── Stub helpers ─────────────────────────────────────────────────────────────

interface DialogBody {
  prompt?: string;
}

interface ValidateData {
  exists: boolean;
  isDirectory: boolean;
  isFile: boolean;
  hasPermissions: boolean;
  path: string;
}

const VALID_VALIDATE_DATA: ValidateData = {
  exists: true,
  isDirectory: true,
  isFile: false,
  hasPermissions: true,
  path: "",
};

function stubDialog(
  downloadsPath: string = DOWNLOADS_PATH,
  libraryPath: string = LIBRARY_PATH
): void {
  cy.intercept("POST", API.fs.dialog, (req) => {
    const body = req.body as DialogBody;
    const isLibrary = body.prompt?.includes(ONBOARDING.libraryPromptHint);
    req.reply({
      body: {
        success: true,
        data: { path: isLibrary ? libraryPath : downloadsPath },
      },
    });
  });
}

function stubValidate(overrides: Partial<ValidateData> = {}): void {
  cy.intercept("GET", API.fs.validate, {
    body: {
      success: true,
      data: { ...VALID_VALIDATE_DATA, ...overrides },
    },
  });
}

function stubConfig(): void {
  cy.intercept("GET", API.fs.config, {
    body: {
      success: true,
      data: { downloadsPath: DOWNLOADS_PATH, libraryPath: LIBRARY_PATH },
    },
  });
}

// ─── Navigation helper ────────────────────────────────────────────────────────

function navigateToFolderConfig(): void {
  cy.visit("/onboarding");
  cy.contains("button", ONBOARDING.startButton).click();
}

// ─── Spec ─────────────────────────────────────────────────────────────────────

describe("Onboarding flow", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe("Middleware — route protection", () => {
    it("redirects to /onboarding when no cookie is set", () => {
      cy.visit("/");
      cy.url().should("include", "/onboarding");
    });

    it("redirects configured user away from /onboarding to /", () => {
      stubConfig();
      cy.fixture("folder-config.json").then(
        (config: { downloadsPath: string; libraryPath: string }) => {
          cy.setFolderConfigCookie(config);
        }
      );
      cy.visit("/onboarding");
      cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
    });

    it("stays on /onboarding when cookie JSON is malformed", () => {
      cy.setCookie(COOKIE.folderConfigured, "not%%valid%%json");
      cy.visit("/onboarding");
      cy.url().should("include", "/onboarding");
    });

    it("stays on /onboarding when cookie paths are empty strings", () => {
      cy.setCookie(
        COOKIE.folderConfigured,
        encodeURIComponent(
          JSON.stringify({ downloadsPath: "", libraryPath: "" })
        )
      );
      cy.visit("/onboarding");
      cy.url().should("include", "/onboarding");
    });

    it("redirects any protected route to /onboarding when not configured", () => {
      cy.visit("/settings");
      cy.url().should("include", "/onboarding");
    });
  });

  describe("WelcomeScreen", () => {
    beforeEach(() => {
      cy.visit("/onboarding");
    });

    it("renders app name, tagline and start button", () => {
      cy.contains("h1", ONBOARDING.appName).should("exist");
      cy.contains(ONBOARDING.tagline).should("exist");
      cy.contains("button", ONBOARDING.startButton).should("not.be.disabled");
    });

    it("renders exactly 3 feature items", () => {
      cy.get('[aria-label="Funcionalidades"]').within(() => {
        cy.get("li").should("have.length", 3);
      });
    });

    it("advances to FolderConfigScreen when start button is clicked", () => {
      cy.contains("button", ONBOARDING.startButton).click();
      cy.contains("h1", ONBOARDING.configureTitle).should("exist");
      cy.url().should("include", "/onboarding");
    });

    it("navigates back to WelcomeScreen when back button is clicked", () => {
      cy.contains("button", ONBOARDING.startButton).click();
      cy.contains("button", ONBOARDING.backButton).click();
      cy.contains("h1", ONBOARDING.appName).should("exist");
    });
  });

  describe("FolderConfigScreen", () => {
    beforeEach(() => {
      navigateToFolderConfig();
    });

    it("has submit button disabled when no folders are selected");
    it("keeps field idle when folder picker dialog is canceled");

    describe("client-side path validation", () => {
      beforeEach(() => {
        stubValidate();
      });

      it("shows error when the same path is used for both folders");
      it("shows error when library path is a subfolder of downloads");
      it("shows error when downloads path is a subfolder of library");
    });

    describe("server-side path validation", () => {
      beforeEach(() => {
        cy.intercept("POST", API.fs.dialog, {
          body: { success: true, data: { path: DOWNLOADS_PATH } },
        });
      });

      it("shows error when path does not exist");
      it("shows error when path is not a directory");
      it("shows error when path has no write permissions");
    });
  });

  describe("Happy path — complete onboarding", () => {
    it("saves config to cookie and redirects to /");
  });
});
