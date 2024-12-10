import React, { createContext, useEffect, useRef, useState } from 'react';

interface WebSocketContextType {
    sendMessage: (message: any) => void;
    alerts: any[];
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [alerts, setAlerts] = useState<any[]>([]);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Connect to the WebSocket server
        const socket = new WebSocket('ws://your-server-url:3000');
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('WebSocket connection established');
            // Example: Send admin ID when connected
            socket.send(JSON.stringify({ type: 'registerAdmin', adminId: '123' }));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'newAlert') {
                setAlerts((prev) => [...prev, data]);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed');
        };

        // Cleanup on unmount
        return () => {
            socket.close();
        };
    }, []);

    const sendMessage = (message: any) => {
        if (socketRef.current) {
            socketRef.current.send(JSON.stringify(message));
        }
    };

    return (
        <WebSocketContext.Provider value={{ sendMessage, alerts }}>
            {children}
        </WebSocketContext.Provider>
    );
};
