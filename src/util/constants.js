/*
 * @Author: CoyoteWaltz <coyote_waltz@163.com>
 * @Date: 2020-07-21 22:57:18
 * @LastEditTime: 2020-07-27 23:08:18
 * @LastEditors: CoyoteWaltz <coyote_waltz@163.com>
 * @Description:
 */

const BLACKLIST = [
  '.git',
  'node_modules',
  '.idea',
  '.vscode',
  '__pycache__',
  '.github',
  '.vs',
  '.ipynb_checkpoints',
  '',
];

const MAX_PROBE_DEPTH = 3;

module.exports = { BLACKLIST, MAX_PROBE_DEPTH };
