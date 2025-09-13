import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';


const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

interface ZItem {
  id: number;
  x: number;
  y: number;
  scale: number;
  color: string;
  fontSize: number;
}

const SleepZ: React.FC = () => {
  const [zItems, setZItems] = useState<ZItem[]>([]);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const newZ: ZItem = {
        id: nextId,
        x: getRandom(-40, 40),
        y: getRandom(-120, -180),
        scale: getRandom(1, 1.5),
        color: '#B7FF9F',
        fontSize: getRandom(24, 48)
      };
      
      setZItems(prev => [...prev, newZ]);
      setNextId(prev => prev + 1);
    }, 800); // Новый Z каждые 800ms

    return () => clearInterval(interval);
  }, [nextId]);

  const removeZ = (id: number) => {
    setZItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="relative w-32 h-48 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {zItems.map((z) => (
          <motion.div
            key={z.id}
            initial={{ opacity: 0, y: 0, x: 0, scale: 0.7 }}
            animate={{ 
              opacity: 1, 
              y: z.y, 
              x: z.x, 
              scale: z.scale 
            }}
            exit={{ 
              opacity: 0, 
              y: -300, // Улетают далеко вверх
              x: z.x + getRandom(-20, 20),
              scale: 0.1 
            }}
            transition={{ 
              duration: 3, 
              ease: 'easeInOut' 
            }}
            onAnimationComplete={() => {
              // Удаляем Z после завершения анимации
              removeZ(z.id);
            }}
            style={{ 
              position: 'absolute', 
              left: '50%', 
              top: 0, 
              fontSize: `${z.fontSize}px`, 
              color: z.color, 
              fontWeight: 700, 
              textShadow: '0 2px 8px #0008' 
            }}
          >
            Z
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default SleepZ;
