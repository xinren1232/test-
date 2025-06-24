import fs from 'fs'; fs.writeFileSync('src/router/index.js.bak', fs.readFileSync('src/router/index.js')); console.log('备份路由文件成功');
