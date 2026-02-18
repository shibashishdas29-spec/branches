import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function runAnalysis(videoPath, location, simulationMode) {
  const analyzerPath = path.join(__dirname, '..', '..', 'backend-python', 'analyzer.py');

  return new Promise((resolve, reject) => {
    const py = spawn('python3', [analyzerPath, '--video', videoPath, '--location', location, '--mode', simulationMode]);

    let stdout = '';
    let stderr = '';

    py.stdout.on('data', (d) => { stdout += d.toString(); });
    py.stderr.on('data', (d) => { stderr += d.toString(); });

    py.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Analyzer failed (${code}): ${stderr || stdout}`));
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error(`Invalid analyzer response: ${stdout}`));
      }
    });
  });
}
