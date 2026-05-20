const mockWatcherInstance = {
  on: jest.fn(),
  close: jest.fn().mockResolvedValue(undefined),
};

jest.mock("chokidar", () => ({
  __esModule: true,
  default: { watch: jest.fn(() => mockWatcherInstance) },
}));

import chokidar from "chokidar";
import { libraryWatcher } from "@/server/fs/watcher";

const mockChokidarWatch = chokidar.watch as jest.Mock;

const LIBRARY_PATH = "/library";
const ALT_PATH = "/library-alt";
const AUDIO_FILE = "/library/Artist/Album/01 - Track.flac";
const AUDIO_FILE_2 = "/library/Artist/Album/02 - Track.flac";

function getRegisteredHandler(event: "add" | "unlink"): (path: string) => void {
  const call = mockWatcherInstance.on.mock.calls.find(
    ([e]: [string]) => e === event,
  );
  if (!call) throw new Error(`No handler registered for "${event}"`);
  return call[1] as (path: string) => void;
}

beforeEach(async () => {
  await libraryWatcher.close();
  jest.clearAllMocks();
  mockWatcherInstance.close.mockResolvedValue(undefined);
});

describe("LibraryWatcher — watch (MFM-444)", () => {
  it("starts a chokidar watcher for the given path", async () => {
    await libraryWatcher.watch(LIBRARY_PATH);

    expect(mockChokidarWatch).toHaveBeenCalledWith(
      LIBRARY_PATH,
      expect.objectContaining({ ignoreInitial: true }),
    );
  });

  it("is a no-op when called with the same path twice", async () => {
    await libraryWatcher.watch(LIBRARY_PATH);
    await libraryWatcher.watch(LIBRARY_PATH);

    expect(mockChokidarWatch).toHaveBeenCalledTimes(1);
  });

  it("registers handlers for add and unlink events", async () => {
    await libraryWatcher.watch(LIBRARY_PATH);

    const events = mockWatcherInstance.on.mock.calls.map(
      ([e]: [string]) => e,
    ) as string[];
    expect(events).toContain("add");
    expect(events).toContain("unlink");
  });
});

describe("LibraryWatcher — updatePath (MFM-445)", () => {
  it("closes old watcher and opens a new one at the new path", async () => {
    await libraryWatcher.watch(LIBRARY_PATH);
    await libraryWatcher.updatePath(ALT_PATH);

    expect(mockWatcherInstance.close).toHaveBeenCalledTimes(1);
    expect(mockChokidarWatch).toHaveBeenLastCalledWith(
      ALT_PATH,
      expect.anything(),
    );
  });

  it("does not close when updating to the same path", async () => {
    await libraryWatcher.watch(LIBRARY_PATH);
    await libraryWatcher.updatePath(LIBRARY_PATH);

    expect(mockWatcherInstance.close).not.toHaveBeenCalled();
    expect(mockChokidarWatch).toHaveBeenCalledTimes(1);
  });
});

describe("LibraryWatcher — subscribe / unsubscribe (MFM-444)", () => {
  it("calls subscribed listener when a debounced event fires", async () => {
    await libraryWatcher.watch(LIBRARY_PATH);
    jest.useFakeTimers();

    const listener = jest.fn();
    libraryWatcher.subscribe(listener);

    const addHandler = getRegisteredHandler("add");
    addHandler(AUDIO_FILE);
    jest.advanceTimersByTime(1000);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      type: "file-added",
      path: AUDIO_FILE,
    });

    jest.useRealTimers();
  });

  it("stops receiving events after unsubscribing", async () => {
    await libraryWatcher.watch(LIBRARY_PATH);
    jest.useFakeTimers();

    const listener = jest.fn();
    const unsubscribe = libraryWatcher.subscribe(listener);
    unsubscribe();

    const addHandler = getRegisteredHandler("add");
    addHandler(AUDIO_FILE);
    jest.advanceTimersByTime(1000);

    expect(listener).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it("supports multiple simultaneous listeners", async () => {
    await libraryWatcher.watch(LIBRARY_PATH);
    jest.useFakeTimers();

    const listenerA = jest.fn();
    const listenerB = jest.fn();
    libraryWatcher.subscribe(listenerA);
    libraryWatcher.subscribe(listenerB);

    const addHandler = getRegisteredHandler("add");
    addHandler(AUDIO_FILE);
    jest.advanceTimersByTime(1000);

    expect(listenerA).toHaveBeenCalledTimes(1);
    expect(listenerB).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });
});

describe("LibraryWatcher — debounce (MFM-444)", () => {
  it("emits only once when the same path fires multiple times within 1s", async () => {
    await libraryWatcher.watch(LIBRARY_PATH);
    jest.useFakeTimers();

    const listener = jest.fn();
    libraryWatcher.subscribe(listener);
    const addHandler = getRegisteredHandler("add");

    addHandler(AUDIO_FILE);
    jest.advanceTimersByTime(400);
    addHandler(AUDIO_FILE);
    jest.advanceTimersByTime(400);
    addHandler(AUDIO_FILE);

    expect(listener).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);
    expect(listener).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it("does not suppress events for different paths", async () => {
    await libraryWatcher.watch(LIBRARY_PATH);
    jest.useFakeTimers();

    const listener = jest.fn();
    libraryWatcher.subscribe(listener);
    const addHandler = getRegisteredHandler("add");

    addHandler(AUDIO_FILE);
    addHandler(AUDIO_FILE_2);
    jest.advanceTimersByTime(1000);

    expect(listener).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  it("emits file-removed for unlink events", async () => {
    await libraryWatcher.watch(LIBRARY_PATH);
    jest.useFakeTimers();

    const listener = jest.fn();
    libraryWatcher.subscribe(listener);
    const unlinkHandler = getRegisteredHandler("unlink");

    unlinkHandler(AUDIO_FILE);
    jest.advanceTimersByTime(1000);

    expect(listener).toHaveBeenCalledWith({
      type: "file-removed",
      path: AUDIO_FILE,
    });

    jest.useRealTimers();
  });
});

describe("LibraryWatcher — close (MFM-444)", () => {
  it("closes the underlying chokidar watcher", async () => {
    await libraryWatcher.watch(LIBRARY_PATH);
    await libraryWatcher.close();

    expect(mockWatcherInstance.close).toHaveBeenCalledTimes(1);
  });

  it("cancels pending debounce timers on close", async () => {
    await libraryWatcher.watch(LIBRARY_PATH);
    jest.useFakeTimers();

    const listener = jest.fn();
    libraryWatcher.subscribe(listener);
    const addHandler = getRegisteredHandler("add");
    addHandler(AUDIO_FILE);

    await libraryWatcher.close();
    jest.advanceTimersByTime(1000);

    expect(listener).not.toHaveBeenCalled();

    jest.useRealTimers();
  });
});
