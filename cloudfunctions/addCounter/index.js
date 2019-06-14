const cloud = require('wx-server-sdk')
exports.main = (event, context) => {
  const { name, counter } = event
  const { OPENID } = cloud.getWXContext() // 这里获取到的 openId 和 appId 是可信的

  console.log(event.userInfo.openId, OPENID)

  return {
    OPENID,
    sum
  }
}