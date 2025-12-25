import dynamic from 'next/dynamic.js';
// import Gantt component with Server Side Rendering disabled
const Gantt = dynamic(() => import('../components/Gantt.tsx'), { ssr : false });

export default function Home() {
    return (
        <Gantt />
    );
}
