import fs from 'fs';
import { exec } from 'child_process';
import winston from 'winston';
import temp from 'temp';

function createTempDir(prefix) {
  return new Promise((resolve, reject) => {
    temp.mkdir(prefix, (err, dir) => {
      winston.debug(err, dir);
      if (err) {
        reject(err);
        return;
      }

      resolve(dir);
    });
  });
}

function cloneRepository(url, path) {
  return new Promise((resolve, reject) => {
    exec(`git clone --depth 1 ${url} playbooks`, { cwd: path }, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

function saveLog(folder, output) {
  const fileName = `${(Math.random() + 1).toString(36).substring(2)}.log`;
  return new Promise((resolve, reject) => {
    fs.writeFile(`${folder}/${fileName}`, output, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(fileName);
    });
  });
}

function redactOutput(output) {
  return output.replace(/u'([A-Z0-9_]+)': u'([^']*)'/g, 'u\'$1\': u\'xxx\'');
}

export default class Ansible {
  constructor({ logFolder, repo, playbook, user, vaultPassFile }) {
    this.logFolder = logFolder;
    this.repo = repo;
    this.playbook = playbook;
    this.user = user;
    this.vaultPassFile = vaultPassFile;
    this.dir = '';
  }

  run(flag) {
    winston.debug(`Running ansible with tag \`${flag}\``);
    return createTempDir('ansible-playbooks')
      .then((dir) => {
        winston.debug(`Created temporary directory at ${dir}`);
        this.dir = dir;
        return cloneRepository(this.repo, this.dir);
      })
      .then(() => {
        winston.debug('Cloned repository');

        const cmd = [
          'ansible-playbook',
          '-u', this.user,
          this.playbook,
          '--vault-password-file', this.vaultPassFile,
          '--tags', 'deploy',
          `-e ${flag}=true`,
          '2>&1', // Redirect stderr to stdout
        ].join(' ');
        winston.debug(`Running cmd \`${cmd}\``);

        return new Promise((resolve, reject) => {
          exec(cmd, { cwd: `${this.dir}/playbooks` }, (err, stdout) => {
            const output = redactOutput(stdout);

            if (err) {
              // TODO: Improve code clarity, why do we call it again at the
              //       end?
              saveLog(this.logFolder, output).then((logFile) => {
                reject({ err, logFile });
              }, (logErr) => {
                reject({ err: logErr });
              });
              return;
            }

            resolve(output);
          });
        });
      })
      .then(output => saveLog(this.logFolder, output));
  }
}
