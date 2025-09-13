import React from 'react';
import { motion } from 'motion/react';

interface EyeProps {
  className?: string;
  isBlinking: boolean;
}

const Eye: React.FC<EyeProps> = ({ className = '', isBlinking }) => {

  // Path для открытого глаза (полный круглый глаз)
  const openEyePath = "M0 70.5C0 31.5 31.5 0 70.5 0H70.5C109.5 0 141 31.5 141 70.5V191.5C141 230.5 109.5 262 70.5 262H70.5C31.5 262 0 230.5 0 191.5V70.5Z";
  
  // Path для закрытого глаза (по центру, высота 46, ширина 141, rx=20)
  const closedEyePath = "M0 128C0 117 9 108 20 108H121C132 108 141 117 141 128V134C141 145 132 154 121 154H20C9 154 0 145 0 134V128Z";

  return (
    <div className={`eye ${className}`}>
      <motion.svg 
        width="141" 
        height="262" 
        viewBox="0 0 141 262" 
        className="w-16 h-28"
      >
        <motion.path
          d={isBlinking ? closedEyePath : openEyePath}
          fill="#B7FF9F"
          animate={{
            d: isBlinking ? closedEyePath : openEyePath,
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          style={{
            transformOrigin: 'center',
          }}
        />
      </motion.svg>
    </div>
  );
};

export default Eye;
