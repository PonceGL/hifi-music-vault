import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

// jsdom does not expose TextDecoder/TextEncoder as globals; polyfill from Node.
Object.assign(global, { TextDecoder, TextEncoder });
