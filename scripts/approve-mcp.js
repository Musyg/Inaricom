const fs = require('fs');
const path = 'C:/Users/gimu8/.claude.json';
const key = 'C:/Users/gimu8/Desktop/Inaricom';
const servers = ['filesystem','chrome-devtools','playwright','woocommerce-mcp'];

const j = JSON.parse(fs.readFileSync(path, 'utf8'));
if (!j.projects[key]) {
  console.error('Project key not found:', key);
  process.exit(1);
}
j.projects[key].enabledMcpjsonServers = servers;
j.projects[key].enableAllProjectMcpServers = true;
fs.writeFileSync(path, JSON.stringify(j, null, 2), 'utf8');

const j2 = JSON.parse(fs.readFileSync(path, 'utf8'));
console.log('enabledMcpjsonServers:', j2.projects[key].enabledMcpjsonServers.join(', '));
console.log('enableAllProjectMcpServers:', j2.projects[key].enableAllProjectMcpServers);
