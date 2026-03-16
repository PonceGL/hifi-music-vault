declare module 'ffmetadata' {
    export function setFfmpegPath(path: string): void;
    export function read(file: string, callback: (err: Error | null, data: any) => void): void;
    export function write(file: string, data: any, options: any, callback: (err: Error | null) => void): void;
}
