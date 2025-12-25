/* eslint-disable @next/next/no-css-tags */
import React from 'react';
import '@/styles/globals.scss';

export const metadata = {
    title       : 'Bryntum Gantt - NEXT.js with App Router',
    description : 'This demo contains the NEXT.js Gantt chart wrapper and the demo is written in TypeScript'
};

export default function RootLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <link rel="stylesheet" href="themes/fontawesome/css/fontawesome.css" />
                <link rel="stylesheet" href="themes/fontawesome/css/solid.css" />
                <link rel="stylesheet" href="themes/gantt.css" />
                <link rel="stylesheet" href="themes/svalbard-light.css" data-bryntum-theme />
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
