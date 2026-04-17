const fs = require('fs');

// Fonction pour parser un path SVG et extraire les points
function parseSvgPath(d) {
    const points = [];
    const commands = d.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g) || [];
    
    let x = 0, y = 0;
    
    for (const cmd of commands) {
        const type = cmd[0];
        const args = cmd.slice(1).trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
        
        switch(type) {
            case 'M':
                x = args[0]; y = args[1];
                points.push([x, y]);
                // M peut être suivi de coordonnées implicites L
                for (let i = 2; i < args.length; i += 2) {
                    x = args[i]; y = args[i+1];
                    points.push([x, y]);
                }
                break;
            case 'm':
                x += args[0]; y += args[1];
                points.push([x, y]);
                for (let i = 2; i < args.length; i += 2) {
                    x += args[i]; y += args[i+1];
                    points.push([x, y]);
                }
                break;
            case 'L':
                for (let i = 0; i < args.length; i += 2) {
                    x = args[i]; y = args[i+1];
                    points.push([x, y]);
                }
                break;
            case 'l':
                for (let i = 0; i < args.length; i += 2) {
                    x += args[i]; y += args[i+1];
                    points.push([x, y]);
                }
                break;
            case 'H':
                x = args[0];
                points.push([x, y]);
                break;
            case 'h':
                x += args[0];
                points.push([x, y]);
                break;
            case 'V':
                y = args[0];
                points.push([x, y]);
                break;
            case 'v':
                y += args[0];
                points.push([x, y]);
                break;
            case 'C': // Cubic bezier - sample points
                for (let i = 0; i < args.length; i += 6) {
                    const x1 = args[i], y1 = args[i+1];
                    const x2 = args[i+2], y2 = args[i+3];
                    const ex = args[i+4], ey = args[i+5];
                    // Sample the bezier
                    for (let t = 0.25; t <= 1; t += 0.25) {
                        const px = Math.pow(1-t,3)*x + 3*Math.pow(1-t,2)*t*x1 + 3*(1-t)*t*t*x2 + t*t*t*ex;
                        const py = Math.pow(1-t,3)*y + 3*Math.pow(1-t,2)*t*y1 + 3*(1-t)*t*t*y2 + t*t*t*ey;
                        points.push([px, py]);
                    }
                    x = ex; y = ey;
                }
                break;
            case 'c':
                for (let i = 0; i < args.length; i += 6) {
                    const x1 = x + args[i], y1 = y + args[i+1];
                    const x2 = x + args[i+2], y2 = y + args[i+3];
                    const ex = x + args[i+4], ey = y + args[i+5];
                    for (let t = 0.25; t <= 1; t += 0.25) {
                        const px = Math.pow(1-t,3)*x + 3*Math.pow(1-t,2)*t*x1 + 3*(1-t)*t*t*x2 + t*t*t*ex;
                        const py = Math.pow(1-t,3)*y + 3*Math.pow(1-t,2)*t*y1 + 3*(1-t)*t*t*y2 + t*t*t*ey;
                        points.push([px, py]);
                    }
                    x = ex; y = ey;
                }
                break;
            case 'Z':
            case 'z':
                // Close path - ignore for now
                break;
        }
    }
    
    return points;
}

// Lire le SVG
const svg = fs.readFileSync('C:/Users/gimu8/Desktop/Fox.svg', 'utf8');
console.log('SVG lu, taille:', svg.length);

// Trouver les dimensions du viewBox
const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
let width = 3840, height = 2160;
if (viewBoxMatch) {
    const parts = viewBoxMatch[1].split(/\s+/);
    width = parseFloat(parts[2]) || 3840;
    height = parseFloat(parts[3]) || 2160;
}
console.log('Canvas:', width, 'x', height);

// Extraire les paths
const pathMatches = svg.matchAll(/<path[^>]*>/g);
const paths = [];

for (const m of pathMatches) {
    const pathTag = m[0];
    
    const idMatch = pathTag.match(/id="([^"]+)"/);
    const strokeMatch = pathTag.match(/stroke="([^"]+)"/);
    const dMatch = pathTag.match(/d="([^"]+)"/);
    
    if (idMatch && strokeMatch && dMatch) {
        const id = idMatch[1];
        const stroke = strokeMatch[1];
        const d = dMatch[1];
        
        console.log('Path:', id, stroke, 'd length:', d.length);
        
        const points = parseSvgPath(d);
        console.log('  Points extraits:', points.length);
        
        paths.push({
            id: id,
            stroke: stroke,
            fill: 'none',
            points: points
        });
    }
}

// Créer le JSON
const data = {
    source_svg: 'Fox.svg',
    canvas: [width, height],
    sample_step_px: 2.0,
    paths: paths
};

fs.writeFileSync('C:/Users/gimu8/Desktop/fox-animation/fox-paths-regenerated.json', JSON.stringify(data, null, 2));
console.log('');
console.log('JSON régénéré: fox-paths-regenerated.json');
console.log('Total paths:', paths.length);
