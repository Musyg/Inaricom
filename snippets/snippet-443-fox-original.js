/**
 * Fox Animation - Inaricom
 * VERSION: v27 - Style Cloudflare Mobile
 * CHANGELOG v27:
 *   - Renard mobile BEAUCOUP plus grand (style Cloudflare)
 *   - Scale calculé pour occuper 90% de la hauteur container
 *   - Container mobile 420px de hauteur
 *   - Centrage horizontal parfait
 */

(function() {
    'use strict';

    // ============================================
    // CRÉATION DU CANVAS — PLEIN ÉCRAN FIXED
    // ============================================
    const container = document.createElement('div');
    container.id = 'fox-canvas-container';
    const canvas = document.createElement('canvas');
    canvas.id = 'fox-canvas';
    
    // POSITION FIXED — DERRIÈRE TOUT LE CONTENU
    container.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        pointer-events: none;
        background: #0a0a0b;
    `;
    
    canvas.style.cssText = `
        width: 100%;
        height: 100%;
        display: block;
    `;
    
    container.appendChild(canvas);
    
    // ============================================
    // INJECTION DANS LE BODY (pas dans le hero)
    // ============================================
    function injectCanvas() {
        // Seulement sur la homepage
        if (!document.body.classList.contains('home') && !document.body.classList.contains('page-template-front-page')) {
            console.log('🦊 Pas la homepage, canvas non injecté');
            return false;
        }
        
        const hero = document.querySelector('.hero-section') || document.querySelector('.inari-hero');
        if (hero) {
            hero.style.position = 'relative';
            
            // Détecter mobile
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
    // =============================================
    // MOBILE : Canvas EN FOND derrière le contenu
    // =============================================
    hero.style.overflow = 'hidden';
    hero.style.position = 'relative';
    container.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        z-index: 1;
        pointer-events: none;
        opacity: 0.35;
        background: transparent;
    `;
    hero.insertBefore(container, hero.firstChild);
    console.log('🦊 Canvas injecté EN FOND (mobile)');
} else {
                // DESKTOP : Canvas en arrière-plan (INCHANGÉ)
                hero.style.overflow = 'hidden';
                container.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                    pointer-events: none;
                `;
                hero.insertBefore(container, hero.firstChild);
                console.log('🦊 Canvas injecté en arrière-plan (desktop)');
            }
            return true;
        }
        return false;
    }
    
    const ctx = canvas.getContext('2d');

    // ============================================
    // COULEURS PAR THÈME (INCHANGÉ)
    // ============================================
    const THEME_COLORS = {
        rouge: {
            primary: { r: 227, g: 30, b: 36 },
            dark: { r: 160, g: 9, b: 9 }
        },
        or: {
            primary: { r: 255, g: 215, b: 0 },
            dark: { r: 184, g: 134, b: 11 }
        },
        bleu: {
            primary: { r: 0, g: 212, b: 255 },
            dark: { r: 0, g: 168, b: 204 }
        },
        vert: {
            primary: { r: 16, g: 185, b: 129 },
            dark: { r: 5, g: 150, b: 105 }
        }
    };

    let currentTheme = 'rouge';
    let targetColors = { ...THEME_COLORS.rouge };
    let activeColors = { 
        primary: { ...THEME_COLORS.rouge.primary },
        dark: { ...THEME_COLORS.rouge.dark }
    };
    let colorTransitionProgress = 1;

    // ============================================
    // CONFIGURATION (INCHANGÉ)
    // ============================================
    const CONFIG = {
        jsonUrl: 'https://raw.githubusercontent.com/Musyg/Inaricom/main/assets/data/fox-paths.json',
        minSegmentLength: 450,
        stitchThreshold: 25,
        beamSpeed: 400,
        trailPercent: 0.02,
        lineWidth: 2,
        glowBlur: 5,
        
        revealOpacityWhite: 0.50,
        revealOpacityRed: 0.80,
        revealGlow: 5,
        
        finalOpacityWhite: 0.9,
        finalOpacityRed: 1,
        finalGlow: 12,
        finalLineMultiplier: 2,
        materializeDuration: 1,
        
        // Position du renard (côté droit de l'écran) — DESKTOP ONLY
        foxOffsetX: 0.72,
        foxScale: 0.85,
        
        sparkCount: 3,
        sparkSpeed: 80,
        sparkLife: 0.4,
        sparkSize: 5,
        sparkGlow: 5,
        
        colorTransitionDuration: 0.5,
        
        // Couleur de fond
        bgColor: '#0a0a0b',
        
        colors: {
            '#ffffff': { r: 255, g: 255, b: 255 },
            '#fff': { r: 255, g: 255, b: 255 }
        }
    };

    let segments = [];
    let beams = [];
    let sparks = [];
    let lastTime = 0;
    let originalWidth, originalHeight;
    let scale = 1;
    let offsetX = 0, offsetY = 0;
    let animationComplete = false;
    let animationRunning = false;

    // ============================================
    // GESTION DU THÈME (INCHANGÉ)
    // ============================================
    function detectCurrentTheme() {
        const theme = document.documentElement.getAttribute('data-theme') || 'rouge';
        return theme;
    }

    function updateTheme(newTheme) {
    if (newTheme === currentTheme && colorTransitionProgress >= 1) return;
    
    if (THEME_COLORS[newTheme]) {
        currentTheme = newTheme;
        targetColors = THEME_COLORS[newTheme];
        colorTransitionProgress = 0;
        console.log(`🦊 Thème renard → ${newTheme}`);
        
        // === NOUVEAU : Redessiner si animation terminée ===
        if (animationComplete) {
            // Appliquer immédiatement les nouvelles couleurs
            activeColors.primary = { ...targetColors.primary };
            activeColors.dark = { ...targetColors.dark };
            
            // Mettre à jour les couleurs de tous les beams
            beams.forEach(beam => {
                if (beam.isRed) {
                    beam.color = activeColors.primary;
                }
            });
            
            // Redessiner l'état final
            drawFinalState();
            console.log(`🦊 Renard redessiné en ${newTheme}`);
        }
    }
}

    function lerpColor(from, to, t) {
        return {
            r: Math.round(from.r + (to.r - from.r) * t),
            g: Math.round(from.g + (to.g - from.g) * t),
            b: Math.round(from.b + (to.b - from.b) * t)
        };
    }

    function updateColorTransition(deltaTime) {
        if (colorTransitionProgress >= 1) return;
        
        colorTransitionProgress += deltaTime / CONFIG.colorTransitionDuration;
        colorTransitionProgress = Math.min(1, colorTransitionProgress);
        
        const t = 1 - Math.pow(1 - colorTransitionProgress, 3);
        
        activeColors.primary = lerpColor(activeColors.primary, targetColors.primary, t * 0.1);
        activeColors.dark = lerpColor(activeColors.dark, targetColors.dark, t * 0.1);
        
        if (colorTransitionProgress >= 1) {
            activeColors.primary = { ...targetColors.primary };
            activeColors.dark = { ...targetColors.dark };
        }
        
        beams.forEach(beam => {
            if (beam.isRed) {
                beam.color = activeColors.primary;
            }
        });
    }

    function setupThemeObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    const newTheme = detectCurrentTheme();
                    updateTheme(newTheme);
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        updateTheme(detectCurrentTheme());
    }

    // ============================================
    // FONCTIONS UTILITAIRES (INCHANGÉ)
    // ============================================
    function stitchSegments(segs, threshold) {
        const byColor = {};
        segs.forEach(seg => {
            if (!byColor[seg.color]) byColor[seg.color] = [];
            byColor[seg.color].push(seg);
        });
        const result = [];
        for (const color in byColor) {
            let colorSegs = byColor[color].map(s => ({
                points: [...s.points], color: s.color, parentId: s.parentId, merged: false
            }));
            let changed = true, iterations = 0;
            while (changed && iterations < 100) {
                changed = false; iterations++;
                for (let i = 0; i < colorSegs.length; i++) {
                    if (colorSegs[i].merged) continue;
                    const segA = colorSegs[i];
                    const startA = segA.points[0], endA = segA.points[segA.points.length - 1];
                    for (let j = i + 1; j < colorSegs.length; j++) {
                        if (colorSegs[j].merged) continue;
                        const segB = colorSegs[j];
                        const startB = segB.points[0], endB = segB.points[segB.points.length - 1];
                        const d1 = Math.hypot(endA.x - startB.x, endA.y - startB.y);
                        const d2 = Math.hypot(endA.x - endB.x, endA.y - endB.y);
                        const d3 = Math.hypot(startA.x - startB.x, startA.y - startB.y);
                        const d4 = Math.hypot(startA.x - endB.x, startA.y - endB.y);
                        const minDist = Math.min(d1, d2, d3, d4);
                        if (minDist < threshold) {
                            let newPoints;
                            if (minDist === d1) newPoints = [...segA.points, ...segB.points];
                            else if (minDist === d2) newPoints = [...segA.points, ...segB.points.slice().reverse()];
                            else if (minDist === d3) newPoints = [...segA.points.slice().reverse(), ...segB.points];
                            else newPoints = [...segB.points, ...segA.points];
                            colorSegs[i] = { points: newPoints, color: segA.color, parentId: segA.parentId, merged: false };
                            colorSegs[j].merged = true;
                            changed = true; break;
                        }
                    }
                    if (changed) break;
                }
            }
            colorSegs.filter(s => !s.merged).forEach(s => result.push({ points: s.points, color: s.color, parentId: s.parentId }));
        }
        return result;
    }

    // ============================================
    // RESIZE CANVAS — MODIFIÉ POUR MOBILE CLOUDFLARE
    // ============================================
    function resizeCanvas() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
    // MOBILE : RENARD EN FOND — PROPORTIONS PRÉSERVÉES
    const containerWidth = container.offsetWidth || window.innerWidth;
    const containerHeight = container.offsetHeight || window.innerHeight;
    
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    // Scale qui PRÉSERVE les proportions
    const scaleX = containerWidth / originalWidth;
    const scaleY = containerHeight / originalHeight;
    scale = Math.min(scaleX, scaleY) * 1.5;  // 65% pour pas trop grand
    
    const foxWidth = originalWidth * scale;
    const foxHeight = originalHeight * scale;
    
    // Centré
    offsetX = (canvas.width - foxWidth) / 2;
    offsetY = (canvas.height - foxHeight) / 0.95;
    
    console.log(`🦊 Mobile fond: scale=${scale.toFixed(2)}, ${foxWidth.toFixed(0)}x${foxHeight.toFixed(0)}px`);
} else {
            // =============================================
            // DESKTOP : Comportement original (INCHANGÉ)
            // =============================================
            const screenW = window.innerWidth;
            const screenH = window.innerHeight;
            
            canvas.width = screenW;
            canvas.height = screenH;
            
            const scaleX = screenW / originalWidth;
            const scaleY = screenH / originalHeight;
            scale = Math.min(scaleX, scaleY) * CONFIG.foxScale;
            
            const foxWidth = originalWidth * scale;
            const foxHeight = originalHeight * scale;
            
            offsetX = screenW * CONFIG.foxOffsetX - foxWidth * 0.5;
            offsetY = (screenH - foxHeight) / 2 - (screenH * 0.10);
        }
        
        if (animationComplete) {
            drawFinalState();
        }
    }

    // ============================================
    // SPARKS (INCHANGÉ)
    // ============================================
    function createSpark(x, y, color) {
        for (let i = 0; i < CONFIG.sparkCount; i++) {
            const angle = (Math.PI * 2 * i) / CONFIG.sparkCount + Math.random() * 0.5;
            const speed = CONFIG.sparkSpeed * (0.5 + Math.random() * 0.5);
            sparks.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: CONFIG.sparkLife,
                maxLife: CONFIG.sparkLife,
                color: color
            });
        }
    }

    function getActiveColor(segmentColor) {
        if (CONFIG.colors[segmentColor]) {
            return CONFIG.colors[segmentColor];
        }
        if (segmentColor === '#e31e24' || segmentColor === '#E31E24') {
            return activeColors.primary;
        }
        if (segmentColor === '#a00909') {
            return activeColors.dark;
        }
        return activeColors.primary;
    }

    // ============================================
    // CLASSE PULSEBEAM (INCHANGÉ)
    // ============================================
    class PulseBeam {
        constructor(segment, id) {
            this.segment = segment;
            this.id = id;
            this.originalColor = segment.color;
            this.color = getActiveColor(segment.color);
            this.speed = CONFIG.beamSpeed / segment.length;
            this.progress = 0;
            this.trail = [];
            this.maxTrail = Math.max(5, Math.floor(segment.points.length * CONFIG.trailPercent));
            this.isRed = segment.color === '#e31e24' || segment.color === '#E31E24' || segment.color === '#a00909';
            this.sparkTriggered = false;
            
            this.revealedProgress = 0;
            
            this.beamFinished = false;
            this.materializePhase = false;
            this.materializeProgress = 0;
            this.fullyMaterialized = false;
        }
        
        update(deltaTime) {
            if (this.isRed) {
                this.color = getActiveColor(this.originalColor);
            }
            
            if (this.fullyMaterialized) return;
            
            if (this.materializePhase) {
                this.materializeProgress += deltaTime / CONFIG.materializeDuration;
                if (this.materializeProgress >= 1) {
                    this.materializeProgress = 1;
                    this.fullyMaterialized = true;
                }
                return;
            }
            
            if (!this.beamFinished) {
                this.progress += this.speed * deltaTime;
                
                const pos = this.getPosition(Math.min(1, this.progress));
                this.trail.push({ 
                    x: pos.x * scale + offsetX, 
                    y: pos.y * scale + offsetY 
                });
                while (this.trail.length > this.maxTrail) this.trail.shift();
                
                this.revealedProgress = Math.max(0, Math.min(1, this.progress - CONFIG.trailPercent));
                
                if (this.progress >= 1) {
                    if (!this.sparkTriggered && this.trail.length > 0) {
                        const endPos = this.trail[this.trail.length - 1];
                        createSpark(endPos.x, endPos.y, this.color);
                        this.sparkTriggered = true;
                    }
                    
                    for (let i = 0; i < 3 && this.trail.length > 0; i++) {
                        this.trail.shift();
                        this.revealedProgress = Math.min(1, this.revealedProgress + (CONFIG.trailPercent / this.maxTrail));
                    }
                    
                    if (this.trail.length === 0) {
                        this.revealedProgress = 1;
                        this.beamFinished = true;
                        this.materializePhase = true;
                        this.materializeProgress = 0;
                    }
                }
            }
        }
        
        getPosition(t) {
            t = Math.max(0, Math.min(1, t));
            const idx = Math.floor(t * (this.segment.points.length - 1));
            const localT = (t * (this.segment.points.length - 1)) - idx;
            const p1 = this.segment.points[Math.min(idx, this.segment.points.length - 1)];
            const p2 = this.segment.points[Math.min(idx + 1, this.segment.points.length - 1)];
            return { x: p1.x + (p2.x - p1.x) * localT, y: p1.y + (p2.y - p1.y) * localT };
        }
        
        getMaterializeFactor() {
            if (!this.materializePhase && !this.fullyMaterialized) return 0;
            const t = Math.min(1, this.materializeProgress);
            return 1 - Math.pow(1 - t, 3);
        }
        
        drawRevealedLine(ctx) {
            if (this.revealedProgress <= 0) return;
            
            const { r, g, b } = this.color;
            const baseLineWidth = CONFIG.lineWidth * Math.max(0.5, scale);
            const materializeFactor = this.getMaterializeFactor();
            
            const startOpacity = this.isRed ? CONFIG.revealOpacityRed : CONFIG.revealOpacityWhite;
            const endOpacity = this.isRed ? CONFIG.finalOpacityRed : CONFIG.finalOpacityWhite;
            const opacity = startOpacity + (endOpacity - startOpacity) * materializeFactor;
            
            const glow = CONFIG.revealGlow + (CONFIG.finalGlow - CONFIG.revealGlow) * materializeFactor;
            const lineMultiplier = 1 + (CONFIG.finalLineMultiplier - 1) * materializeFactor;
            const scaledLineWidth = baseLineWidth * 0.8 * lineMultiplier;
            
            const points = this.segment.points;
            const endIdx = Math.floor(this.revealedProgress * (points.length - 1));
            
            if (endIdx < 1) return;
            
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${0.5 + 0.3 * materializeFactor})`;
            ctx.shadowBlur = glow * scale;
            
            ctx.beginPath();
            ctx.moveTo(points[0].x * scale + offsetX, points[0].y * scale + offsetY);
            
            for (let i = 1; i <= endIdx; i++) {
                ctx.lineTo(points[i].x * scale + offsetX, points[i].y * scale + offsetY);
            }
            
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.lineWidth = scaledLineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
            
            ctx.shadowBlur = 0;
        }
        
        drawBeam(ctx) {
            if (this.trail.length < 2 || this.beamFinished) return;
            const { r, g, b } = this.color;
            const scaledLineWidth = CONFIG.lineWidth * Math.max(0.5, scale);
            
            for (let i = 1; i < this.trail.length; i++) {
                const alpha = Math.pow(i / this.trail.length, 2);
                ctx.beginPath();
                ctx.moveTo(this.trail[i-1].x, this.trail[i-1].y);
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.9})`;
                ctx.lineWidth = scaledLineWidth;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
            
            if (this.progress < 1 && this.trail.length > 0) {
                const head = this.trail[this.trail.length - 1];
                ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
                ctx.shadowBlur = CONFIG.glowBlur * scale;
                ctx.beginPath();
                ctx.arc(head.x, head.y, scaledLineWidth + 1, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }

    // ============================================
    // UPDATE AND DRAW SPARKS (INCHANGÉ)
    // ============================================
    function updateAndDrawSparks(ctx, deltaTime) {
        for (let i = sparks.length - 1; i >= 0; i--) {
            const spark = sparks[i];
            
            spark.x += spark.vx * deltaTime;
            spark.y += spark.vy * deltaTime;
            spark.vx *= 0.92;
            spark.vy *= 0.92;
            spark.life -= deltaTime;
            
            const lifeRatio = spark.life / spark.maxLife;
            const opacity = lifeRatio * lifeRatio;
            
            if (opacity > 0.01) {
                const { r, g, b } = spark.color;
                const size = CONFIG.sparkSize * scale * (0.5 + lifeRatio * 0.5);
                
                ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                ctx.shadowBlur = CONFIG.sparkGlow * scale * lifeRatio;
                
                ctx.beginPath();
                ctx.arc(spark.x, spark.y, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                ctx.fill();
            }
            
            if (spark.life <= 0) {
                sparks.splice(i, 1);
            }
        }
        
        ctx.shadowBlur = 0;
    }

    function calculatePathLength(points) {
        let length = 0;
        for (let i = 1; i < points.length; i++) {
            length += Math.hypot(points[i].x - points[i-1].x, points[i].y - points[i-1].y);
        }
        return length;
    }

    // ============================================
    // FOND NOIR DANS LE CANVAS (INCHANGÉ)
    // ============================================
    function drawFinalState() {
        ctx.fillStyle = CONFIG.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (const beam of beams) {
            beam.drawRevealedLine(ctx);
        }
    }

    // ============================================
    // CHARGEMENT & ANIMATION (INCHANGÉ)
    // ============================================
    async function loadPaths() {
        try {
            injectCanvas();
            
            const response = await fetch(CONFIG.jsonUrl);
            const data = await response.json();
            
            originalWidth = Array.isArray(data.canvas) ? data.canvas[0] : data.canvas.width;
            originalHeight = Array.isArray(data.canvas) ? data.canvas[1] : data.canvas.height;
            
            resizeCanvas();
            
            // Throttle resize (évite les calculs excessifs)
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(resizeCanvas, 150);
            });
            
            setupThemeObserver();
            
            for (const path of data.paths) {
                const color = path.color || path.fill || '#ffffff';
                if (path.subpaths && Array.isArray(path.subpaths)) {
                    for (const subpath of path.subpaths) {
                        const validPoints = subpath.filter(p => p && p[0] !== null);
                        if (validPoints.length < 2) continue;
                        const points = validPoints.map(p => ({ x: p[0], y: p[1] }));
                        segments.push({ points, color, parentId: path.id });
                    }
                }
            }
            
            segments = stitchSegments(segments, CONFIG.stitchThreshold);
            segments.forEach(seg => { seg.length = calculatePathLength(seg.points); });
            segments = segments.filter(seg => seg.length >= CONFIG.minSegmentLength);
            segments.forEach((seg, i) => { beams.push(new PulseBeam(seg, i)); });
            
            animationRunning = true;
            requestAnimationFrame(animate);
        } catch (error) {
            console.error('Fox Animation Error:', error);
        }
    }

    function animate(timestamp) {
        const deltaTime = lastTime ? (timestamp - lastTime) / 1000 : 0.016;
        lastTime = timestamp;
        
        updateColorTransition(deltaTime);
        
        const allFullyMaterialized = beams.every(beam => beam.fullyMaterialized);
        
        if (allFullyMaterialized && colorTransitionProgress >= 1) {
            animationComplete = true;
        }
        
        // FOND NOIR EXPLICITE
        ctx.fillStyle = CONFIG.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (const beam of beams) {
            beam.update(deltaTime);
        }
        
        for (const beam of beams) {
            beam.drawRevealedLine(ctx);
        }
        
        ctx.globalCompositeOperation = 'lighter';
        
        for (const beam of beams) {
            beam.drawBeam(ctx);
        }
        
        updateAndDrawSparks(ctx, deltaTime);
        
        ctx.globalCompositeOperation = 'source-over';
        
        // STOP si animation terminée (économise CPU)
        if (animationComplete && sparks.length === 0) {
            console.log('🦊 Animation terminée, boucle stoppée');
            return;
        }
        
        requestAnimationFrame(animate);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadPaths);
    } else {
        loadPaths();
    }

})();
