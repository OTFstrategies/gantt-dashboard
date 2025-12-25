import React from 'react';
import '@/styles/globals.scss';

export const metadata = {
    title       : 'Gantt Dashboard',
    description : 'Project management dashboard met Gantt chart'
};

export default function RootLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="nl">
            <head>
                <link rel="icon" href="favicon.png" type="image/png" />
            </head>
            <body>
                <div id="container">
                    {children}
                </div>
            </body>
        </html>
    );
}
