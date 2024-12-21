const { platform } = require('os');
const { spawn } = require('child_process');

if (platform() === 'win32') {
  spawn('yarn', ['setup:node'], { stdio: 'inherit' });
} else {
  spawn('yarn', ['setup:sh'], { stdio: 'inherit' });
}
