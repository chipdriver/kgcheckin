/**
 * 用户信息管理工具
 * 提供登录脚本共享的用户信息更新与保存逻辑
 */

import { printGreen, printYellow } from './colorOut.js'
import { hasSecretWriteToken, setRepoSecret } from './githubSecrets.js'
import { maskIdentifier } from './safeLog.js'

/**
 * 将登录用户信息更新或追加到 userinfo 数组中
 * @param {Array} userinfo - 用户信息数组
 * @param {{ userid: string, token: string }} loginUser - 新登录的用户
 * @param {boolean} append - 是否追加模式（已存在则更新，否则添加）
 */
function upsertUser(userinfo, loginUser, append) {
  if (append) {
    for (const user of userinfo) {
      if (user.userid == loginUser.userid) {
        printYellow(`userid: ${maskIdentifier(user.userid)} 此账号已存在, 仅更新登录信息`)
        user.token = loginUser.token
        return
      }
    }
  }
  userinfo.push({ userid: loginUser.userid, token: loginUser.token })
}

/**
 * 保存 userinfo 到 GitHub Secret，写入失败时报告错误
 * @param {Array} userinfo - 用户信息数组
 */
function saveUserinfo(userinfo) {
  if (!userinfo.length) {
    throw new Error('没有可保存的登录信息')
  }
  if (!hasSecretWriteToken()) {
    throw new Error('未配置写入仓库 Secret 的令牌')
  }
  try {
    setRepoSecret('USERINFO', JSON.stringify(userinfo))
  } catch {
    throw new Error('写入 Secret USERINFO 失败，请检查 PAT 是否有效及其仓库权限')
  }
  printGreen('secret <USERINFO> 更改成功')
}

export { upsertUser, saveUserinfo }
