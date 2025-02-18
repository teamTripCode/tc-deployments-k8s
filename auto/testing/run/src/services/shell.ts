import { spawn } from 'child_process';
import os from 'os';

// Función para ejecutar comandos en la terminal, compatible con Windows y Linux
export const runCommand = (command: string): Promise<{ stdout: string; stderr: string; exitCode: number }> => {
  return new Promise((resolve, reject) => {
    const isWindows = os.platform() === 'win32';

    // Determinar el shell según el sistema operativo
    const shell = isWindows ? 'cmd.exe' : '/bin/bash';
    const shellArgs = isWindows ? ['/c', command] : ['-c', command];

    const process = spawn(shell, shellArgs, { shell: true });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (exitCode) => {
      if (exitCode === 0) {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode });
      } else {
        reject({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode });
      }
    });

    process.on('error', (err) => {
      reject({ stdout: '', stderr: err.message, exitCode: -1 });
    });
  });
};
