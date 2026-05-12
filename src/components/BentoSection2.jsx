import { useRef, useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import './MagicBento.css';

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_GLOW_COLOR = '132, 0, 255';
const MOBILE_BREAKPOINT = 768;

const createParticleElement = (x, y, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const ParticleCard = ({
  children,
  className = '',
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = true,
}) => {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef([]);
  const particlesInitialized = useRef(false);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;
    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0, opacity: 0, duration: 0.3, ease: 'back.in(1.7)',
        onComplete: () => particle.parentNode?.removeChild(particle),
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;
    if (!particlesInitialized.current) initializeParticles();
    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;
        const clone = particle.cloneNode(true);
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);
        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
        gsap.to(clone, { x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100, rotation: Math.random() * 360, duration: 2 + Math.random() * 2, ease: 'none', repeat: -1, yoyo: true });
        gsap.to(clone, { opacity: 0.3, duration: 1.5, ease: 'power2.inOut', repeat: -1, yoyo: true });
      }, index * 100);
      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (!cardRef.current) return;
    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();
      if (enableTilt) gsap.to(element, { rotateX: 3, rotateY: 3, duration: 0.3, ease: 'power2.out', transformPerspective: 1000 });
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();
      if (enableTilt) gsap.to(element, { rotateX: 0, rotateY: 0, duration: 0.3, ease: 'power2.out' });
    };

    const handleMouseMove = e => {
      if (!enableTilt) return;
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      gsap.to(element, { rotateX, rotateY, duration: 0.1, ease: 'power2.out', transformPerspective: 1000 });
    };

    const handleClick = e => {
      if (!clickEffect) return;
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const maxDistance = Math.max(Math.hypot(x, y), Math.hypot(x - rect.width, y), Math.hypot(x, y - rect.height), Math.hypot(x - rect.width, y - rect.height));
      const ripple = document.createElement('div');
      ripple.style.cssText = `position:absolute;width:${maxDistance*2}px;height:${maxDistance*2}px;border-radius:50%;background:radial-gradient(circle,rgba(${glowColor},0.4) 0%,rgba(${glowColor},0.2) 30%,transparent 70%);left:${x-maxDistance}px;top:${y-maxDistance}px;pointer-events:none;z-index:1000;`;
      element.appendChild(ripple);
      gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() });
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('click', handleClick);
    return () => {
      isHoveredRef.current = false;
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('click', handleClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, enableTilt, clickEffect, glowColor]);

  return (
    <div
      ref={cardRef}
      className={`${className} particle-container`}
      style={{ ...style, position: 'relative', overflow: 'hidden' }}
    >
      {children}
    </div>
  );
};

/**
 * A second bento section with two equally sized cards that fill the screen height.
 * Place content you want to show below the first bento grid.
 */
const BentoSection2 = ({ glowColor = DEFAULT_GLOW_COLOR }) => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const cardBase = `magic-bento-card magic-bento-card--border-glow h-full`;
  const cardStyle = { backgroundColor: '#120F17', '--glow-color': glowColor, height: '100%' };

  return (
    <section className="bento-section bento-section-2-wrapper">
      {/* Left card — Skills / Stack */}
      <ParticleCard
        className={cardBase}
        style={cardStyle}
        glowColor={glowColor}
        enableTilt={!isMobile}
        clickEffect
      >
        <div className="magic-bento-card__header">
          <div className="magic-bento-card__label">Stack</div>
        </div>

        <div className="magic-bento-card__content bento-s2-content">
          <h2 className="magic-bento-card__title bento-s2-title">Technologies</h2>
          <p className="magic-bento-card__description">
            A curated set of modern tools I reach for when crafting production-ready experiences.
          </p>

          <div className="bento-s2-skill-grid">
            {[
              { id: 'nextjs', name: 'Next.js', slug: 'nextjs', note: 'App Router & RSC' },
              { id: 'ts', name: 'TypeScript', slug: 'ts', note: 'Static Typing' },
              { id: 'react', name: 'React', slug: 'react', note: 'Server + Client' },
              { id: 'tailwind', name: 'Tailwind CSS', slug: 'tailwind', note: 'Utility-first' },
              { id: 'mongodb', name: 'MongoDB', slug: 'mongodb', note: 'Atlas + Mongoose' },
              { id: 'git', name: 'Git', slug: 'git', note: 'Version Control' },
            ].map(skill => (
              <div key={skill.id} className="bento-s2-skill-item">
                <div className="bento-s2-skill-icon w-8 h-8 flex-shrink-0">
                  <img 
                    src={`https://skillicons.dev/icons?i=${skill.slug}`} 
                    alt={skill.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="bento-s2-skill-name">{skill.name}</div>
                  <div className="bento-s2-skill-note">{skill.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ParticleCard>

      {/* Right card — RAW Project Showcase Redesigned */}
      <ParticleCard
        className={cardBase}
        style={cardStyle}
        glowColor={glowColor}
        particleCount={0}
        enableTilt={!isMobile}
        clickEffect
      >
        <div className="relative z-10 flex flex-col h-full p-2">
          {/* Top Header: Name and Live Site */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-1">Featured Project</span>
              <h2 className="text-xl font-medium text-white tracking-tight">RAW</h2>
            </div>
            <a 
              href="https://raw-zeta-six.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              Live Site ↗
            </a>
          </div>

          {/* Image Section */}
          <div className="flex-1 min-h-[240px] rounded-2xl overflow-hidden border border-white/5 bg-black/20 group relative mb-6">
            <Image 
              src="/RAW.png" 
              alt="RAW Project" 
              fill
              className="object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-105 group-hover:scale-100" 
            />
            {/* Subtle overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Text Section */}
          <div className="mb-6">
            <p className="text-sm text-white/60 leading-relaxed font-light">
              A high-end e-commerce experience for cold-pressed juices. 
              Focuses on bridging the gap between premium aesthetics and high-performance functionality, 
              featuring custom HPP technology preservation and eco-friendly logistics.
            </p>
          </div>

          {/* Tech Stack Section */}
          <div className="mt-auto pt-4 border-t border-white/5 flex flex-wrap gap-2">
            {[
              { id: 'nextjs', name: 'Next.js', slug: 'nextjs' },
              { id: 'tailwind', name: 'Tailwind', slug: 'tailwind' },
              { id: 'framer', name: 'Framer', slug: 'framer' },
              { id: 'threejs', name: 'Three.js', slug: 'threejs' }
            ].map(tech => (
              <span key={tech.id} className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-medium bg-white/5 border border-white/10 rounded-full text-white/70">
                <img 
                  src={`https://skillicons.dev/icons?i=${tech.slug}`} 
                  alt={tech.name} 
                  className="w-3.5 h-3.5 object-contain" 
                />
                {tech.name}
              </span>
            ))}
          </div>
        </div>
      </ParticleCard>
    </section>
  );
};

export default BentoSection2;
