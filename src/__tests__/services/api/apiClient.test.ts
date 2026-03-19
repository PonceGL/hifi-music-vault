import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError, apiClient } from '@/services/api/client';

describe('apiClient', () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
    });

    it('builds GET requests with query params and merged headers', async () => {
        fetchMock.mockResolvedValue(
            new Response(JSON.stringify({ inventory: [] }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        );

        const response = await apiClient.get<{ inventory: unknown[] }>('/api/library', {
            params: { libraryPath: '/music', page: 2, active: true },
            headers: { Authorization: 'Bearer token' },
        });

        expect(response).toEqual({ inventory: [] });
        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:3001/api/library?libraryPath=%2Fmusic&page=2&active=true',
            {
                method: 'GET',
                params: { libraryPath: '/music', page: 2, active: true },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer token',
                },
            }
        );
    });

    it('sends POST requests with a serialized body', async () => {
        fetchMock.mockResolvedValue(
            new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        );

        const response = await apiClient.post<{ success: boolean }, { path: string }>(
            '/api/reveal',
            { path: '/tmp/file.mp3' }
        );

        expect(response).toEqual({ success: true });
        expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/reveal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path: '/tmp/file.mp3' }),
        });
    });

    it('sends PUT requests with custom options', async () => {
        fetchMock.mockResolvedValue(
            new Response(JSON.stringify({ updated: true }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        );

        const response = await apiClient.put<{ updated: boolean }, { enabled: boolean }>(
            '/api/config',
            { enabled: true },
            {
                headers: { 'X-Test': 'yes' },
                credentials: 'include',
            }
        );

        expect(response).toEqual({ updated: true });
        expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/config', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Test': 'yes',
            },
            credentials: 'include',
            body: JSON.stringify({ enabled: true }),
        });
    });

    it('omits the request body when POST, PUT, and DELETE are called without one', async () => {
        fetchMock
            .mockResolvedValueOnce(
                new Response(JSON.stringify({ created: true }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            )
            .mockResolvedValueOnce(
                new Response(JSON.stringify({ updated: true }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            )
            .mockResolvedValueOnce(
                new Response(JSON.stringify({ removed: true }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            );

        await apiClient.post('/api/playlists');
        await apiClient.put('/api/config');
        await apiClient.delete('/api/reveal');

        expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:3001/api/playlists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: undefined,
        });
        expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://localhost:3001/api/config', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: undefined,
        });
        expect(fetchMock).toHaveBeenNthCalledWith(3, 'http://localhost:3001/api/reveal', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: undefined,
        });
    });

    it('returns an empty object for 204 responses', async () => {
        fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

        const response = await apiClient.delete<Record<string, never>, { path: string }>(
            '/api/reveal',
            { path: '/tmp/file.mp3' }
        );

        expect(response).toEqual({});
        expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/reveal', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path: '/tmp/file.mp3' }),
        });
    });

    it('throws ApiError with parsed JSON error details when available', async () => {
        fetchMock.mockResolvedValue(
            new Response(JSON.stringify({ error: 'Request failed', detail: 'bad body' }), {
                status: 400,
                statusText: 'Bad Request',
                headers: { 'Content-Type': 'application/json' },
            })
        );

        await expect(apiClient.post('/api/scan', { inboxPath: '/inbox' })).rejects.toMatchObject({
            name: 'ApiError',
            message: 'Request failed',
            status: 400,
            data: { error: 'Request failed', detail: 'bad body' },
        });
    });

    it('falls back to the HTTP status text when error JSON cannot be parsed', async () => {
        fetchMock.mockResolvedValue(
            new Response('plain text failure', {
                status: 500,
                statusText: 'Internal Server Error',
            })
        );

        let thrown: unknown;

        try {
            await apiClient.get('/api/library');
        } catch (error) {
            thrown = error;
        }

        expect(thrown).toBeInstanceOf(ApiError);
        expect(thrown).toMatchObject({
            message: 'HTTP 500: Internal Server Error',
            status: 500,
            data: undefined,
        });
    });

    it('keeps the default HTTP error message when parsed JSON has no error field', async () => {
        fetchMock.mockResolvedValue(
            new Response(JSON.stringify({ detail: 'unprocessable' }), {
                status: 422,
                statusText: 'Unprocessable Entity',
                headers: { 'Content-Type': 'application/json' },
            })
        );

        await expect(apiClient.post('/api/scan', { inboxPath: '/inbox' })).rejects.toMatchObject({
            message: 'HTTP 422: Unprocessable Entity',
            status: 422,
            data: { detail: 'unprocessable' },
        });
    });
});
