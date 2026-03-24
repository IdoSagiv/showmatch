'use client';

import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/socket';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: TypedSocket | null = null;

export function getSocket(): TypedSocket {
  if (!socket) {
    // Derive the socket URL from the current browser hostname so the app works
    // over any network (LAN, Tailscale, localhost) without reconfiguration.
    // NEXT_PUBLIC_SOCKET_URL overrides this if set explicitly.
    const url = process.env.NEXT_PUBLIC_SOCKET_URL
      ?? (typeof window !== 'undefined'
        ? `http://${window.location.hostname}:3001`
        : 'http://localhost:3001');
    socket = io(url, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    }) as TypedSocket;
  }
  return socket;
}

export function connectSocket(): TypedSocket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}
