'use client';

import { Canvas } from '@react-three/fiber';
import Particles from './Particles';

export default function ThreeCanvasWrapper() {
  return (
    <div className="fixed inset-0 -z-100 pointer-events-none invert-50 dark:invert-50">
      <Canvas>
        <Particles count={100} />
      </Canvas>
    </div>
  );
}
