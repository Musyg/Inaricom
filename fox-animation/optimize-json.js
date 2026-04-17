const fs = require('fs');

const data = JSON.parse(fs.readFileSync('C:/Users/gimu8/Desktop/fox-animation/fox-paths-full-from-svg.v2.json', 'utf8'));

// Structure minimale
const optimized = {
    canvas: [3840, 2160],
    paths: []
};

let totalPoints = 0;
for (const path of data.paths) {
    if (path.subpaths) {
        const newPath = {
            id: path.id,
            color: path.color || path.fill || '#fff',
            subpaths: []
        };
        
        for (const subpath of path.subpaths) {
            // Garder 1 point sur 2
            const filtered = subpath.filter((_, idx) => idx % 2 === 0);
            const points = filtered.map(point => {
                if (point && point[0] !== null) {
                    totalPoints++;
                    // Arrondir à l'entier
                    return [Math.round(point[0]), Math.round(point[1])];
                }
                return point;
            }).filter(p => p && p[0] !== null);
            
            if (points.length >= 2) {
                newPath.subpaths.push(points);
            }
        }
        
        if (newPath.subpaths.length > 0) {
            optimized.paths.push(newPath);
        }
    }
}

const output = JSON.stringify(optimized);
fs.writeFileSync('C:/Users/gimu8/Desktop/fox-animation/fox-paths-optimized.json', output);

const stats = fs.statSync('C:/Users/gimu8/Desktop/fox-animation/fox-paths-optimized.json');
console.log(`Total points: ${totalPoints}`);
console.log(`Taille: ${(stats.size / 1024).toFixed(1)} KB`);
