const
    { spawn } = require('child_process'),
    pkg       = '@bryntum/gantt-trial-lib',
    script    = `${pkg}/build.js`;
try {
    spawn('node', [require.resolve(script)], { cwd : process.cwd(), stdio : 'inherit' });
}
catch (error) {
    console.log(`${pkg} is not installed\n${error.message}`.red);
}
