/*
 * @Author: CoyoteWaltz <coyote_waltz@163.com>
 * @Date: 2020-07-13 23:28:43
 * @LastEditTime: 2020-08-09 23:45:10
 * @LastEditors: CoyoteWaltz <coyote_waltz@163.com>
 * @Description: store root path, command, history and endpoints
 * @TODO: 1. 更新 endpoints 和 prefixes 的方法 删除之前的 prefix 以及 对应的 endpoints以及插入新的
 *        2. 用下标做真的好吗？
 *        3. 构造时读取文件检查文件格式 不符合就 reset
 */

const path = require('path');
const fs = require('fs');

// const { getMatchers } = require('./util/endpoint.js');
const { toJSON, noop } = require('../util/chores.js');
const { getCfgPath, probe } = require('../probe.js');
const logger = require('../util/log.js');
const { getCommandTips } = require('../util/constants.js');

class Store {
  // cfgPath = './fire.json'; // TODO del

  constructor() {
    let config;
    this.initDepth = 3;
    this.cfgPath = getCfgPath();
    try {
      config = JSON.parse(fs.readFileSync(this.cfgPath));
    } catch (e) {
      logger.err(e);
      config = {};
    }
    this.initConfig(config);
  }

  initConfig(config = {}) {
    this._root = config.root || '';
    this._command = config.command || '';
    this._endpoints = config.endpoints || [];
    this._prefixes = config.prefixes || [];
    this.usualList = config.usualList || [];
    this.currentDepth = config.currentDepth || this.initDepth;
  }

  save(cb) {
    cb = cb || noop;
    // TODO JSON.stringify
    fs.writeFile(this.cfgPath, toJSON(this.toJSON()), (err) => {
      if (err) {
        logger.err(err);
        logger.err('Failed to save config!').exit();
      }
      cb();
    });
  }
  toJSON() {
    return {
      command: this._command || '',
      root: this._root || '',
      currentDepth: this.currentDepth,
      endpoints: this._endpoints || [],
      // TODO
      usualList: this.usualList || [],
      prefixes: this._prefixes || [],
    };
  }
  get root() {
    return this._root;
  }
  set root(value) {
    if (!path.isAbsolute(value)) {
      logger.err('Path must be absolute!').exit();
    }
    if (!fs.existsSync(value)) {
      logger.err('Path does not exist!').exit();
    }
    if (!fs.statSync(value).isDirectory()) {
      logger.err('Path is not a directory!').exit();
    }
    this._root = value;
    this.initEndpoints();
    this.usualList = [];
    this.save(() => {
      logger.info(`Config root path: ${this._root}`);
    });
  }
  get command() {
    return this._command;
  }
  set command(value) {
    this._command = value;
    this.save(() => {
      logger.info(`Store command: ${this._command}`);
      logger.notice(getCommandTips(this._command));
    });
  }
  get endpoints() {
    return this._endpoints;
  }
  // TODO
  set endpoints(value) {
    if (Array.isArray(value)) {
      this._endpoints = value;
    } else {
      logger.err('endpoints store not Array!').info(value);
    }
  }
  get prefixes() {
    return this._prefixes;
  }
  // TODO
  set prefixes(value) {
    this._prefixes = value;
  }
  // 更新根目录 每次更新都 probe 更新
  // 不考虑异步吧
  initEndpoints(depth = this.initDepth) {
    console.log('----root: ', this._root === '');
    this._prefixes = [];
    const { endpoints, probeDepth } = probe(this._root, depth, this._prefixes);
    this._endpoints = endpoints;
    this.currentDepth = probeDepth;
  }
  setDepth(value = 0) {
    if (value <= 0) {
      return;
    }
    this.currentDepth = value;
    this.initEndpoints(value);
  }
  check() {
    // TODO
    if (!this._command || typeof this._command !== 'string') {
      this._command = '';
      logger
        .err('No command! Run "cydir config-command <command>" to set one!')
        .exit();
    }
    if (!this._root || typeof this._root !== 'string') {
      this._root = '';
      logger
        .err('No root path! Run "cydir config-root-path <path>" to set one!')
        .exit();
    }
    return true;
  }
  reset() {
    logger
      .notice('Reset all config.')
      .question('', 'sure?')
      .then(() => {
        logger.info('reset');
        this.initConfig();
        this.save(() => {
          logger.info('Config reset!');
        });
      })
      .catch(noop);
  }
}

const store = new Store();

module.exports = store;
