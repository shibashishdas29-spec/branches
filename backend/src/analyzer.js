const path = require('path');
const { spawn } = require('child_process');

function runPythonAnalyzer(videoPath, metadata) {
  const scriptPath = path.join(__dirname, '..', '..', 'python-analyzer', 'analyze_video.py');

  return new Promise((resolve, reject) => {
    const py = spawn('python3', [scriptPath, videoPath, JSON.stringify(metadata)]);

    let stdout = '';
    let stderr = '';

    py.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    py.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    py.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(stderr || 'Python analyzer failed'));
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (error) {
        reject(new Error(`Analyzer output parse failed: ${error.message}`));
      }
    });
  });
}

module.exports = { runPythonAnalyzer };
