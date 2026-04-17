/**
 * Fox Animation - Inaricom
 * Background parallax avec faisceaux lumineux
 * Charge le JSON depuis GitHub
 */

(function() {
    'use strict';

    // Créer le container canvas
    const container = document.createElement('div');
    container.id = 'fox-canvas-container';
    const canvas = document.createElement('canvas');
    canvas.id = 'fox-canvas';
    container.appendChild(canvas);
    document.body.insertBefore(container, document.body.firstChild);

    const ctx = canvas.getContext('2d');

    const CONFIG = {
        jsonUrl: 'https://raw.githubusercontent.com/Musyg/Inaricom/main/assets/data/fox-paths.json',
        minSegmentLength: 80,
        stitchThreshold: 25,
        beamSpeed: 150,
        pauseDuration: 7,
        trailPercent: 0.04,
        lineWidth: 2,
        glowBlur: 10,
        colors: {
            '#ffffff': { r: 255, g: 255, b: 255 },
            '#fff': { r: 255, g: 255, b: 255 },
            '#e31e24': { r: 227, g: 30, b: 36 },
            '#a00909': { r: 160, g: 9, b: 9 }
        }
    };

    let segments = [];
    let beams = [];
    let lastTime = 0;

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

    class PulseBeam {
        constructor(segment, id) {
            this.segment = segment;
            this.id = id;
            this.color = CONFIG.colors[segment.color] || CONFIG.colors['#fff'];
            this.speed = CONFIG.beamSpeed / segment.length;
            this.progress = 0;
            this.state = 'running';
            this.pauseTimer = 0;
            this.trail = [];
            this.maxTrail = Math.max(5, Math.floor(segment.points.length * CONFIG.trailPercent));
        }
        reset() {
            this.progress = 0;
            this.state = 'running';
            this.pauseTimer = 0;
            this.trail = [];
        }
        update(deltaTime) {
            if (this.state === 'running') {
                this.progress += this.speed * deltaTime;
                const pos = this.getPosition(this.progress);
                this.trail.push({ x: pos.x, y: pos.y });
                while (this.trail.length > this.maxTrail) this.trail.shift();
                if (this.progress >= 1) {
                    this.progress = 1;
                    this.state = 'paused';
                    this.pauseTimer = 0;
                }
            } else if (this.state === 'paused') {
                this.pauseTimer += deltaTime;
                if (this.trail.length > 0 && this.pauseTimer < CONFIG.pauseDuration * 0.3) {
                    const fadeSpeed = this.maxTrail / (CONFIG.pauseDuration * 0.3);
                    const pointsToRemove = Math.ceil(fadeSpeed * deltaTime);
                    for (let i = 0; i < pointsToRemove && this.trail.length > 0; i++) this.trail.shift();
                }
                if (this.pauseTimer >= CONFIG.pauseDuration) this.reset();
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
        draw(ctx) {
            if (this.trail.length < 2) return;
            const { r, g, b } = this.color;
            for (let i = 1; i < this.trail.length; i++) {
                const alpha = Math.pow(i / this.trail.length, 2);
                ctx.beginPath();
                ctx.moveTo(this.trail[i-1].x, this.trail[i-1].y);
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.8})`;
                ctx.lineWidth = CONFIG.lineWidth;
                ctx.stroke();
            }
            if (this.state === 'running' && this.trail.length > 0) {
                const head = this.trail[this.trail.length - 1];
                ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
                ctx.shadowBlur = CONFIG.glowBlur;
                ctx.beginPath();
                ctx.arc(head.x, head.y, CONFIG.lineWidth + 1, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }

    function calculatePathLength(points) {
        let length = 0;
        for (let i = 1; i < points.length; i++) {
            length += Math.hypot(points[i].x - points[i-1].x, points[i].y - points[i-1].y);
        }
        return length;
    }

    async function loadPaths() {
        try {
            const response = await fetch(CONFIG.jsonUrl);
            const data = await response.json();
            
            const canvasW = Array.isArray(data.canvas) ? data.canvas[0] : data.canvas.width;
            const canvasH = Array.isArray(data.canvas) ? data.canvas[1] : data.canvas.height;
            canvas.width = canvasW;
            canvas.height = canvasH;
            
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
            
            requestAnimationFrame(animate);
        } catch (error) {
            console.error('Fox Animation Error:', error);
        }
    }

    function animate(currentTime) {
        const deltaTime = lastTime ? (currentTime - lastTime) / 1000 : 0.016;
        lastTime = currentTime;
        
        ctx.fillStyle = 'rgba(10, 10, 11, 0.25)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.globalCompositeOperation = 'lighter';
        for (const beam of beams) {
            beam.update(deltaTime);
            beam.draw(ctx);
        }
        ctx.globalCompositeOperation = 'source-over';
        
        requestAnimationFrame(animate);
    }

    // Démarrer
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadPaths);
    } else {
        loadPaths();
    }

})();
