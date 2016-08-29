import { exec } from 'child_process';
import winston from 'winston';
import temp from 'temp';

function createTempDir(prefix) {
  return new Promise((reject, resolve) => {
    temp.mkdir(prefix, (err, dir) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(dir);
    });
  });
}

function cloneRepository(url, path) {
  return new Promise((reject, resolve) => {
    exec(`git clone ${url}`, { cwd: path }, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

export default class Ansible {
  constructor(repo) {
    this.repo = repo;
    this.dir = '';
  }

  run(tags) {
    return new Promise((reject, resolve) => {
      winston.debug('Creating temporary directory');
      createTempDir('ansible-playbooks')
        .then((dir) => {
          this.dir = dir;
          winston.debug('Cloning repository');
          return cloneRepository(this.repo, this.dir);
        })
        .then(() => {
          const cmd = [
            'ansible-playbook',
            '-b',
            'all.yml',
            '--tags', tags,
            '2>&1', // Redirect stderr to stdout
          ].join(' ');
          winston.debug(`Running cmd '${cmd}'`);
          exec(cmd, { cwd: this.dir }, (err, stdout) => {
            if (err) {
              reject([err, stdout]);
              return;
            }

            resolve(stdout);
          });
        });
    });
  }
}
