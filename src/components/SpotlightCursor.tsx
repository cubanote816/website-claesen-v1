import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function SpotlightCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false); // Hidden by default until we confirm it's desktop

    useEffect(() => {
        // 1. Detect Touch Device or Mobile
        const isTouchDevice =
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            window.matchMedia("(pointer: coarse)").matches ||
            window.innerWidth < 1024; // Also disable on tablets/small laptops if desired, or strictly mobile < 768

        if (isTouchDevice) {
            return; // Do not initialize listeners, stay hidden
        }

        setIsVisible(true);

        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <>
            {/* Main Cursor Dot */}
            <motion.div
                className="fixed top-0 left-0 w-4 h-4 bg-lux-gold rounded-full pointer-events-none z-[9999] mix-blend-difference"
                animate={{
                    x: mousePosition.x - 8,
                    y: mousePosition.y - 8,
                    scale: isHovering ? 2.5 : 1,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            />

            {/* Spotlight Glow */}
            <motion.div
                className="fixed top-0 left-0 w-96 h-96 bg-lux-gold/10 rounded-full pointer-events-none z-[9998] blur-3xl opacity-50"
                animate={{
                    x: mousePosition.x - 192,
                    y: mousePosition.y - 192,
                }}
                transition={{ type: 'spring', stiffness: 100, damping: 30 }}
            />
        </>
    );
}
