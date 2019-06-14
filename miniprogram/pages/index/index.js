const app = getApp()
// miniprogram/pages/todoList/todoList.js
Page({

  /**
   * Page initial data
   */
  data: {
    _id: '',
    openid: '',
    list: [],
    inputValue: '',
    active: '计数器',
    buttonAnimate: '',
    translateY: ['0', '0', '0', '0']
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        this.setData({
          openid: res.result.openid
        })
        app.globalData.openid = res.result.openid
        this.onQuery()
      },
      fail: err => {
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  onQuery: function () {
    const db = wx.cloud.database()
    db.collection('counters').where({
      _openid: this.data.openid
    }).get({
      success: res => {
        if (res.data.length) {
          const counters = res.data[0]
          this.setData({
            _id: counters._id,
            list: counters.lists
          })
          if (counters.lists && counters.lists.length === 0) {
            this.addNewCounter()
          }
        } else {
          this.addDefaultCounter()
        }
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
      }
    })
  },

  addNewCounterToList: function () {
    const defaultCounter = {
      name: this.data.inputValue || '计数器',
      count: 0,
      countShow: '0000',
      countNext: '1111',
    }
    const counters = this.data.list.concat(defaultCounter)

    this.setData({
      list: counters
    })
    return counters
  },

  addDefaultCounter: function () {
    this.addNewCounterToList()
    const db = wx.cloud.database()
    db.collection('counters').add({
      data: {
        lists: this.data.list
      },
      success: res => {
        this.onQuery()
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
      }
    })
  },

  addNewCounter: function () {
    this.addNewCounterToList()
    this.updateCounter()
  },

  updateCounter: function () {
    const db = wx.cloud.database()
    db.collection('counters').doc(this.data._id).update({
      data: {
        lists: this.data.list
      },
      success: res => {
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
      }
    })
  },

  plusCount: function (e) {
    this.plusCountAnimateEnd()
    const { currentTarget } = e;
    if (currentTarget && currentTarget.dataset) {
      const { name } = currentTarget.dataset
      const list = this.data.list.map(item => {
        if (item.name === name) {
          item.count += 1;
          item.countShow = item.count.toString().padStart(4, "0");
          item.countNext = this.getCountNextNum(item.countShow)
        }
        return item
      })

      this.setData({
        list,
      })

      this.updateCounter()
    }
  },

  plusCountAnimate() {
    wx.vibrateShort();
    var animation = wx.createAnimation({
      duration: 100,
      timingFunction: 'linear'
    });
    // animation.translateY(3)
    animation.rotate3d(60, 0, 0, 30).translateY(5).step()
    this.setData({
      buttonAnimate: animation.export()
    })
  },

  plusCountAnimateEnd() {
    var animation = wx.createAnimation({
      duration: 100,
      timingFunction: 'linear'
    });
    animation.translateY(0)
    animation.rotate3d(50, 0 ,0 , 0).step()
    this.setData({
      buttonAnimate: animation.export()
    })
  },

  showBig: function(e) {
    this.setData({
      active: e.currentTarget.dataset.name
    })
  },

  imgTouchStart: function(e) {
    const {changedTouches } = e
    if (changedTouches && changedTouches.length) {
      this.moveY = changedTouches[0].pageY
    }
  },

  imgTouchEnd: function(e) {
    this.moveY = undefined
    this.setData({
      translateY: ['0', '0', '0', '0'],
    })
  },

  touchmove: function(e) {
    if (!this.moveY) {
      return
    }
    const {changedTouches } = e
    if (changedTouches && changedTouches.length) {
      const {pageX, pageY} = changedTouches[0]
      if (pageY < this.moveY) {
        const { currentTarget } = e;
        if (currentTarget && currentTarget.dataset) {
          const { name, countshow } = currentTarget.dataset
          const moveDistance = this.moveY - pageY;

          if (moveDistance >= 25) {
            this.moveToNextCount(name, pageY)
          } else {
            let index = countshow.indexOf('9');
            if (index === -1) {
              index = 3
            } else {
              index = index - 1
            }
            const translateY = this.data.translateY
            translateY[index] = (parseInt(translateY[index]) - (moveDistance / 10)) + 'px';
            this.setData({
              translateY,
            })
          }
        }
      }
    }
  },

  moveToNextCount: function(name, pageY) {
    const list = this.data.list.map(item => {
      if (item.name === name) {
        const count = item.countShow;
        let index = count.indexOf('9');
        if (index === -1) {
          index = 3
        } else {
          index = index - 1
        }

        if (index === -1) {
          item.countShow = '0000';
          item.count = 0;
          item.countNext = '1111'
        } else {
          const newCount = count.split('');
          newCount[index] = parseInt(newCount[index]) + 1;
  
          item.countShow = newCount.join('');
          item.count = parseInt(item.countShow);
          item.countNext = this.getCountNextNum(item.countShow)
        }
      }
      return item
    })
    this.moveY = pageY
    this.setData({
      list,
      pageY: 0,
      translateY: ['0', '0', '0', '0']
    })

    wx.vibrateShort();
    this.updateCounter()
  },

  cleanAndPlus: function(e) {
    const list = this.data.list.map(item => {
      if (item.name === name) {
        item.count += 1;
        item.countShow = item.count.toString().padStart(4, "0");
        item.countNext = this.getCountNextNum(item.countShow)
      }
      return item
    })

    this.setData({
      list,
    })

    this.updateCounter()
  },

  bindKeyInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  bindButtonTap: function () {
    const { openid, inputValue } = this.data
    if (openid && inputValue) {
      const db = wx.cloud.database()
      db.collection('todoLists').add({
        data: {
          description: inputValue,
          done: false
        },
        success: res => {
          this.onQuery()
          console.log('[数据库] [新增记录] 成功，记录 _id: ', res)
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '新增记录失败'
          })
          console.error('[数据库] [新增记录] 失败：', err)
        }
      })
    }
  },

  getCountNextNum: function(num) {
    const nums = num.split('')
    return nums.map(item => {
      if (item === '9') {
        return '0'
      }
      return parseInt(item) + 1
    }).join('')
  },
})