export type ValidationState = "idle" | "loading" | "valid" | "error";

export interface Feature {
  title: string;
  description: string;
}

export interface DirectoryConfig {
  label: string;
  description: string;
  prompt: string;
  placeholder: string;
}

export interface FolderConfig {
  title: string;
  backButton: string;
  submitButton: string;
  downloads: DirectoryConfig;
  library: DirectoryConfig;
}

export interface DirectoryConfigValidationMessages {
  sameFolderError: string;
  libraryInsideDownloadsError: string;
  downloadsInsideLibraryError: string;
  noWritePermissionError: string;
  validSuccess: string;
  notFoundError: string;
  notADirectoryError: string;
  chooseFolderButton: string;
}

export interface OnboardingStrings {
  welcome: {
    appName: string;
    tagline: string;
    startButton: string;
    features: Array<Feature>;
  };
  folderConfig: FolderConfig;
  validation: DirectoryConfigValidationMessages;
}
