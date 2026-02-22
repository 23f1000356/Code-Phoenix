export const fadeOverlay = (color: string, duration: number) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.backgroundColor = color;
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9999';
    overlay.style.transition = `opacity ${duration}ms ease-in-out`;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
    });

    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), duration);
    }, duration);
};

export const flickerLights = (intensity: number, times = 3) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.backgroundColor = 'black';
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9998';
    document.body.appendChild(overlay);

    let count = 0;
    const flicker = () => {
        overlay.style.opacity = count % 2 === 0 ? intensity.toString() : '0';
        count++;
        if (count < times * 2) {
            setTimeout(flicker, 100 + Math.random() * 100);
        } else {
            overlay.remove();
        }
    };
    flicker();
};

export const spawnDustParticles = (container: HTMLElement | null = document.body) => {
    if (!container) return () => {};
    
    const count = 30; // Max 40
    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 3 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.boxShadow = '0 0 4px rgba(255,255,255,0.6)';
        
        // Random drift animation
        const duration = 10 + Math.random() * 20;
        particle.style.animation = `dustDrift ${duration}s linear infinite`;
        particle.style.opacity = (Math.random() * 0.5 + 0.2).toString();
        
        container.appendChild(particle);
        particles.push(particle);
    }

    if (!document.getElementById('dust-keyframes')) {
        const style = document.createElement('style');
        style.id = 'dust-keyframes';
        style.innerHTML = `
            @keyframes dustDrift {
                0% { transform: translate(0, 0); opacity: 0; }
                10% { opacity: 0.6; }
                90% { opacity: 0.6; }
                100% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    return () => {
        particles.forEach(p => p.remove());
    };
};

export const subtleScreenShake = () => {
    document.body.style.animation = 'subtleShake 0.4s ease-in-out';
    if (!document.getElementById('shake-keyframes')) {
        const style = document.createElement('style');
        style.id = 'shake-keyframes';
        style.innerHTML = `
            @keyframes subtleShake {
                0%, 100% { transform: translate(0, 0) rotate(0); }
                20% { transform: translate(-2px, 1px) rotate(-0.5deg); }
                40% { transform: translate(2px, -1px) rotate(0.5deg); }
                60% { transform: translate(-1px, 2px) rotate(-0.5deg); }
                80% { transform: translate(1px, -2px) rotate(0.5deg); }
            }
        `;
        document.head.appendChild(style);
    }
    setTimeout(() => {
        document.body.style.animation = '';
    }, 400);
};

// We will keep track of Audio instances to stop them
const ambientSounds: Record<string, HTMLAudioElement> = {};

export const playAmbientSound = (name: string, volume: number = 0.3) => {
    // Only simulate ambient sound as the user specifically requested background music via an audio controller
    // If we have actual ambient files, we would load them here. 
    // We'll return a dummy function for now, or just use AudioContext oscillators if needed
    console.log(`[Ambient] Play ${name}`);
    return () => stopAmbientSound(name);
};

export const stopAmbientSound = (name: string) => {
    console.log(`[Ambient] Stop ${name}`);
};

export const addVignette = () => {
    let el = document.getElementById('cinematic-vignette');
    if (!el) {
        el = document.createElement('div');
        el.id = 'cinematic-vignette';
        el.style.position = 'fixed';
        el.style.inset = '0';
        el.style.pointerEvents = 'none';
        el.style.background = 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.8) 100%)';
        el.style.zIndex = '9997';
        el.style.transition = 'opacity 2s ease-in-out';
        el.style.opacity = '0';
        document.body.appendChild(el);
    }
    requestAnimationFrame(() => {
        if (el) el.style.opacity = '1';
    });
};

export const removeVignette = () => {
    const el = document.getElementById('cinematic-vignette');
    if (el) {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 2000);
    }
};
