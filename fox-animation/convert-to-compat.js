// Convertir fox-paths-full-from-svg.json vers format compat avec IDs path595/path596
const fs = require('fs');

const input = JSON.parse(fs.readFileSync('fox-paths-full-from-svg.json', 'utf8'));

const output = {
    source_svg: input.source_svg,
    canvas: input.canvas,
    paths: []
};

// Mapping des couleurs vers les IDs SVG originaux
const idMapping = {
    '#fff': 'path595',      // Blanc
    '#a00909': 'path596'    // Rouge
};

for (const path of input.paths) {
    const color = path.stroke || path.color || '#ffffff';
    const svgId = idMapping[color] || path.id;
    
    // Calculer points_flat (tous les subpaths concaténés avec séparateurs null)
    const points_flat = [];
    for (let i = 0; i < path.subpaths.length; i++) {
        if (i > 0) {
            points_flat.push(null); // Séparateur entre subpaths
        }
        for (const pt of path.subpaths[i]) {
            points_flat.push(pt);
        }
    }
    
    output.paths.push({
        id: svgId,
        color: color,
        subpaths: path.subpaths,      // Garder les subpaths séparés
        points_flat: points_flat,      // Version aplatie avec séparateurs null
        subpath_count: path.subpaths.length,
        total_points: path.subpaths.reduce((a, s) => a + s.length, 0)
    });
}

// Stats
console.log('Conversion terminée:');
output.paths.forEach(p => {
    console.log(`  ${p.id}: ${p.subpath_count} subpaths, ${p.total_points} points, color: ${p.color}`);
});

fs.writeFileSync('fox-paths-compat.json', JSON.stringify(output, null, 2));
console.log('\nSauvegardé dans fox-paths-compat.json');
