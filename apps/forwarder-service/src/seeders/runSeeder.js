/**
 * Run Forwarder Seeder
 * Script to run the forwarder seeder
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting forwarder seeder...');

// Run the fixed forwarder seeder
const seederProcess = spawn('node', [path.join(__dirname, 'forwarderSeederFixed.js')], {
  stdio: 'inherit',
});

seederProcess.on('close', (code) => {
  if (code === 0) {
    console.log('Forwarder seeder completed successfully');
  } else {
    console.error(`Forwarder seeder exited with code ${code}`);
  }
});
