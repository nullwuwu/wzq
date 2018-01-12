<template>
  <div>
    <h1>Vue 五子棋</h1>
    <div class="chess" v-if="gameStatus">
      <div v-for="(l, k) in boardWidth" :key="l" class='row'>
        <span v-for="(i, x) in boardWidth" :key="i">
          <i @click='chess(k, x)' v-if="boardStatus.length > 0" :class="{'b': boardStatus[k][x] === 1, 'w': boardStatus[k][x] === 2}"></i>
        </span>
      </div>
    </div>
    <div v-if="checkReady">
      <button @click="goPlay(1)">player1 ready</button>
      <button @click="goPlay(2)">player2 ready</button>
    </div>
    <div v-if="!checkReady && !gameStatus">
      你已经准备
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client'
const socket = io('http://172.16.23.37:3300/')
export default {
  name:'HelloWorld',
  data () {
    return {
      gameStatus: null, // 1黑棋 2白棋
      boardStatus: [], // 棋盘状态
      boardWidth: 10, // 正方形棋盘长宽
      currentPlayer: 0,
      checkReady: true,
      canChess: false
    }
  },
  watch: {
    boardStatus: {
      handler: function() {
      },
      deep: true
    }
  },
  created () {
    socket.on('gameStatus', function (data) {
      console.log(data)
    })
    socket.on('gameStart', (data) => {
      this.gameStatus = data
    })
    socket.on('chessSuccess', (data) => {
      if (this.currentPlayer !== data.player) {
        this.canChess = true
      }
      this.$set(this.boardStatus[data.local[0]], data.local[1], data.player)
      console.log(this.isWin(data.local[0], data.local[1], data.player))
    })
    this.init()
  },
  methods: {
    init () {
      const res = []
      for (let i = 0; i < this.boardWidth; i++) {
        const r = []
        for (let j = 0; j < this.boardWidth; j++) {
          r.push(0)
        }
        res.push(r)
      }
      this.boardStatus = res
    },
    chess (k, x) {
      // 当前位置已下
      if (this.boardStatus[k][x] !== 0) { return }
      // 等待对方下
      if (!this.canChess) {return}
      socket.emit('chess', {
        player: this.currentPlayer,
        local: [k, x]
      })
      this.canChess = false
    },
    goPlay (p) {
      this.checkReady = false
      this.currentPlayer = p
      // 黑棋先下
      if (p === 1) {
        this.canChess = true
      }
      socket.emit('ready', p)
    },
    isWin(k, x, p) {
      // 计数器
      let count = 0
      // 水平方向
      let i = x
      while(i > -1 && this.boardStatus[k][i] === p) {
        i--
        count++
      }
      i = x + 1
      while(i < this.boardStatus.length - 1 && this.boardStatus[k][i] === p) {
        i++
        count++
      }
      if (count >= 5) {
        return true
      }
      // 垂直方向
      let j = k
      while(j > -1 && this.boardStatus[j][x] === p) {
        j--
        count++
      }
      j = k + 1
      while(j < this.boardStatus.length - 1 && this.boardStatus[j][x] === p) {
        j++
        count++
      }
      if (count >= 5) {
        return true
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .row {    
      justify-content:center;
      display: flex;
    }
    [v-cloak] {
      display: none;
    }
    #app {
      text-align: center;
    }
    h1 {
      font-size: 20px;
      text-align: center;
    }
    .chess {
      margin-bottom: 30px;
      font-size: 0;
    }
    
    /* 坐标 */
    i {
      position: relative;
      display: inline-block;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      text-align: left;
    }
    /* 白棋 */
    i.w,
    i.w::before,
    i.w::after {
      background-color: #f00;
      border-color: #f00;
    }
    
    /* 黑棋 */
    i.b,
    i.b::before,
    i.b::after {
      background-color: #333;
    }
    /* - 横线 */
    i::before,
    i::after {
      content: ' ';
      position: absolute;
      top: 20px;
      width: 40px;
      height: 0;
      border-top: 1px solid #333;
    }
    /* | 竖线 */
    i::after {
      top: 0;
      right: 20px;
      width: 0;
      height: 40px;
      border-top: 0 none;
      border-right: 1px solid #333;
    }
    button {
      margin-right: 5px
    }
</style>
