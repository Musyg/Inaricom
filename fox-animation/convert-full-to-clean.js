// Convertir fox-paths-full-from-svg.json en format propre avec subpaths séparés
const fs = require('fs');

const input = JSON.parse(fs.readFileSync('fox-paths-full-from-svg.json', 'utf8'));

const output = {
    source_svg: input.source_svg,
    canvas: input.canvas,
    paths: []
};

let pathIndex = 0;

for (const path of input.paths) {
    const color = path.stroke || path.color || '#ffffff';
    
    for (let subIdx = 0; subIdx < path.subpaths.length; subIdx++) {
        const subpath = path.subpaths[subIdx];
        
        if (subpath.length < 2) continue; // Ignorer les subpaths trop courts
        
        output.paths.push({
            id: `${path.id}_sub${subIdx}`,
            color: color,
            points: subpath // Garder tous les points !
        });
        
        pathIndex++;
    }
}

// Stats
console.log('Conversion terminée:');
console.log(`- ${output.paths.length} paths séparés`);
console.log(`- Total points: ${output.paths.reduce((a,p) => a + p.points.length, 0)}`);

output.paths.forEach((p, i) => {
    console.log(`  ${p.id}: ${p.points.length} pts, color: ${p.color}`);
});

fs.writeFileSync('fox-paths-dense.json', JSON.stringify(output, null, 2));
console.log('\nSauvegardé dans fox-paths-dense.json');
