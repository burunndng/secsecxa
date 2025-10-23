import React, { useRef, useEffect, useState, useCallback } from 'react';

// Interfaces for game objects
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
}

interface Target {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulseOffset: number;
}

const SpunkEmulator: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mousePosition = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const particlesRef = useRef<Particle[]>([]);
    const targetsRef = useRef<Target[]>([]);
    const [score, setScore] = useState(0);
    // FIX: The ref for animationFrameId can be undefined initially.
    const animationFrameId = useRef<number | undefined>();

    const resetTarget = useCallback((target: Target) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        target.radius = Math.random() * 15 + 10; // Varying sizes
        target.x = target.radius + Math.random() * (canvas.width - target.radius * 2);
        target.y = target.radius + Math.random() * (canvas.height - target.radius * 2);
        target.vx = (Math.random() - 0.5) * 3 + 0.5; // Varying speeds
        target.vy = (Math.random() - 0.5) * 3 + 0.5;
        target.pulseOffset = Math.random() * 1000;
    }, []);
    
    // Game loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        
        // Initialize targets only once
        if (targetsRef.current.length === 0) {
            for (let i = 0; i < 8; i++) { // Create 8 targets
                const newTarget: Target = { id: i, x:0,y:0,vx:0,vy:0,radius:0,pulseOffset:0 };
                targetsRef.current.push(newTarget);
                resetTarget(newTarget);
            }
        }

        const gameLoop = () => {
            ctx.fillStyle = 'rgba(13, 2, 33, 0.25)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            let hitOccurredInShot = false;

            // Update and draw targets
            targetsRef.current.forEach(target => {
                target.x += target.vx;
                target.y += target.vy;

                if (target.x - target.radius < 0 || target.x + target.radius > canvas.width) target.vx *= -1;
                if (target.y - target.radius < 0 || target.y + target.radius > canvas.height) target.vy *= -1;

                ctx.beginPath();
                const pulseSize = target.radius + Math.sin((Date.now() + target.pulseOffset) * 0.005) * 3;
                ctx.arc(target.x, target.y, pulseSize, 0, Math.PI * 2);
                const gradient = ctx.createRadialGradient(target.x, target.y, 0, target.x, target.y, pulseSize);
                gradient.addColorStop(0, 'rgba(0, 245, 255, 1)');
                gradient.addColorStop(0.7, 'rgba(255, 51, 102, 0.8)');
                gradient.addColorStop(1, 'rgba(255, 51, 102, 0)');
                ctx.fillStyle = gradient;
                ctx.fill();
            });

            // Update, draw, and check collision for particles
            for (let i = particlesRef.current.length - 1; i >= 0; i--) {
                const p = particlesRef.current[i];
                p.vy += 0.1; // Gravity
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 1;

                if (p.life <= 0) {
                    particlesRef.current.splice(i, 1);
                    continue;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
                ctx.fillStyle = `rgba(240, 240, 240, ${p.life / 60})`;
                ctx.fill();
                
                // Collision detection
                for (let j = targetsRef.current.length - 1; j >= 0; j--) {
                    const target = targetsRef.current[j];
                    const dx = p.x - target.x;
                    const dy = p.y - target.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < target.radius) {
                        hitOccurredInShot = true;
                        setScore(prev => prev + 50); // Add points for hit
                        particlesRef.current.splice(i, 1); // Remove particle
                        resetTarget(target); // Respawn target
                        break; // Particle is gone, no need to check other targets
                    }
                }
            }
            
            // Draw weapon
            ctx.font = '80px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.save();
            ctx.translate(mousePosition.current.x - 20, mousePosition.current.y + 20);
            ctx.rotate(Math.PI / 4);
            ctx.fillText('🍆', 0, 0);
            ctx.restore();

            animationFrameId.current = requestAnimationFrame(gameLoop);
        };

        gameLoop();

        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [resetTarget]);
    
    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        mousePosition.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const handleShoot = (event: React.MouseEvent<HTMLCanvasElement>) => {
        setScore(prev => prev - 5); // Deduct points for firing
        const rect = event.currentTarget.getBoundingClientRect();
        const shootX = event.clientX - rect.left;
        const shootY = event.clientY - rect.top;

        const emitterAngle = Math.PI / 4;
        const emitterOffsetX = 50 * Math.cos(emitterAngle);
        const emitterOffsetY = 50 * Math.sin(emitterAngle);
        const emitterX = shootX - 20 + emitterOffsetX;
        const emitterY = shootY + 20 - emitterOffsetY;

        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 0.5 - Math.PI * 0.75;
            const speed = Math.random() * 5 + 2;
            particlesRef.current.push({
                x: emitterX,
                y: emitterY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 60,
                size: Math.random() * 2 + 1,
            });
        }
    };

    return (
        <div className="flex flex-col gap-4 items-center text-center">
            <h2 className="text-2xl font-bold text-cyber-accent">Spunk Emulator v3.0: The Gauntlet</h2>
            <p className="text-cyber-text-secondary max-w-2xl">Hit the moving orbs. Don't miss.</p>
            <div className="w-full h-[60vh] bg-cyber-secondary-dark border-2 border-cyber-accent rounded-lg shadow-cyber-glow cursor-crosshair relative">
                <div className="absolute top-2 left-3 text-cyber-accent font-display text-2xl z-10 pointer-events-none">
                    SCORE: {score}
                </div>
                <canvas
                    ref={canvasRef}
                    onMouseMove={handleMouseMove}
                    onMouseDown={handleShoot}
                    className="w-full h-full"
                />
            </div>
        </div>
    );
};

export default SpunkEmulator;