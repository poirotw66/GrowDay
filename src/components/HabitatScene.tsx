
import React, { useEffect, useRef, useState } from 'react';
import { AreaConfig, PlacedPet } from '../types';
import { getDecorationById } from '../utils/worldData';
import { getPetEmoji } from '../utils/petData';
import { X } from 'lucide-react';

interface Props {
  area: AreaConfig;
  onRemoveItem: (id: string) => void;
  onRemovePet: (id: string) => void;
  editMode: boolean;
}

// --- Interactive Space Background Component ---
const SpaceParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let animationFrameId: number;

    // Mouse state
    const mouse = { x: -1000, y: -1000 }; // Start off-screen

    // Particle initialization
    const particleCount = 100;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      baseX: Math.random() * width,
      baseY: Math.random() * height,
      density: (Math.random() * 30) + 1,
      opacity: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.005
    }));

    const handleResize = () => {
      width = canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    window.addEventListener('resize', handleResize);
    // Attach listener to parent or window, here we use canvas specific interaction
    // Note: CSS pointer-events-none might block this if set on canvas, 
    // but we want interaction, so we allow events on canvas or track via window.
    // Since items are on top, we'll track via window for smoother parallax 
    // but calculate relative to canvas for the connection effect.
    window.addEventListener('mousemove', handleMouseMove);
    
    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Parallax center point
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Mouse offset from center (for parallax)
      // Clamped to avoid extreme shifts if mouse is far outside
      const mouseOffsetX = (mouse.x - centerX) * 0.05;
      const mouseOffsetY = (mouse.y - centerY) * 0.05;

      particles.forEach(p => {
        // 1. Twinkle Effect
        p.opacity += p.twinkleSpeed;
        if (p.opacity > 1 || p.opacity < 0.2) p.twinkleSpeed *= -1;

        // 2. Parallax Movement
        // Move particles opposite to mouse to create depth. 
        // Higher density = closer = moves more.
        const moveX = mouseOffsetX * (p.density / 30) * -1; 
        const moveY = mouseOffsetY * (p.density / 30) * -1;
        
        const drawX = (p.baseX + moveX + width * 2) % width;
        const drawY = (p.baseY + moveY + height * 2) % height;

        // Draw Star
        ctx.beginPath();
        ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, p.opacity))})`;
        ctx.fill();

        // 3. Constellation Effect (Connect to mouse)
        const dx = mouse.x - drawX;
        const dy = mouse.y - drawY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const connectDistance = 120;

        if (distance < connectDistance) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / connectDistance})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(drawX, drawY);
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

const WanderingPet: React.FC<{ pet: PlacedPet }> = ({ pet }) => {
  const emoji = getPetEmoji(pet.petId, pet.stage);
  
  // Use useState initializer to generate random values only on mount
  // This is the correct pattern for one-time random initialization
  const [animationValues] = useState(() => ({
    duration: 10 + Math.random() * 10,
    delay: Math.random() * 5
  }));
  const { duration, delay } = animationValues;

  return (
    <div 
        className="absolute bottom-[10%] transition-all"
        style={{ 
            left: `${pet.x}%`,
            animation: `wander ${duration}s ease-in-out infinite ${delay}s alternate`
        }}
    >
        <div className="text-6xl animate-bounce-slow transform origin-bottom cursor-pointer hover:scale-110 transition-transform">
            {emoji}
        </div>
        <style>{`
            @keyframes wander {
                0% { transform: translateX(0) scaleX(1); }
                45% { transform: translateX(50px) scaleX(1); }
                50% { transform: translateX(50px) scaleX(-1); }
                95% { transform: translateX(-50px) scaleX(-1); }
                100% { transform: translateX(-50px) scaleX(1); }
            }
            .animate-bounce-slow {
                animation: bounce 3s infinite;
            }
        `}</style>
    </div>
  );
};

const HabitatScene: React.FC<Props> = ({ area, onRemoveItem, onRemovePet, editMode }) => {
  return (
    <div className={`relative w-full h-[500px] lg:h-[600px] rounded-[2.5rem] overflow-hidden shadow-inner border-4 border-slate-200 ${area.backgroundClass} transition-colors duration-500`}>
       
       {/* Background Decoration Elements */}
       {area.id === 'space' && <SpaceParticles />}

       {/* Placed Furniture */}
       {area.placedItems.map(item => {
           const def = getDecorationById(item.itemId);
           if (!def) return null;
           
           return (
               <div 
                  key={item.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 hover:z-50"
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
               >
                   <div className="text-5xl md:text-7xl drop-shadow-lg transition-transform hover:scale-110 cursor-pointer relative group">
                       {def.emoji}
                       
                       {/* Delete Button (Only in edit mode) */}
                       {editMode && (
                           <button 
                                onClick={() => onRemoveItem(item.id)}
                                className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full p-1 shadow-md scale-0 group-hover:scale-100 transition-transform"
                           >
                               <X size={12} />
                           </button>
                       )}
                   </div>
               </div>
           );
       })}

       {/* Wandering Pets */}
       {area.placedPets.map(pet => (
           <div key={pet.id} className="relative group">
                <WanderingPet pet={pet} />
                {editMode && (
                    <button 
                        onClick={() => onRemovePet(pet.id)}
                        // Click logic handled below via overlay for now
                    />
                )}
           </div>
       ))}

        {/* Since removing wandering pets via a moving button is hard, let's list them in edit mode if needed, 
            or just make the pet clickable to remove when editMode is true. */}
        {area.placedPets.map(pet => (
             editMode ? (
                 <div 
                    key={`remove-${pet.id}`}
                    onClick={() => onRemovePet(pet.id)}
                    className="absolute bottom-4 left-4 bg-red-100 text-red-500 px-3 py-1 rounded-full text-xs font-bold cursor-pointer hover:bg-red-200 z-50 border border-red-300"
                    style={{ left: `${pet.x}%`, bottom: '15%' }} // Static approximation
                 >
                    移除 {getPetEmoji(pet.petId, pet.stage)}
                 </div>
             ) : null
        ))}

       {/* Floor / Ground visual anchor */}
       <div className="absolute bottom-0 w-full h-1/4 bg-black/5 backdrop-blur-[1px] rounded-b-[2rem] pointer-events-none"></div>
    </div>
  );
};

export default HabitatScene;
