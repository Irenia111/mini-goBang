// 黑子对应角色为1 白子对应角色为2
let character = 1
let myChar = 1
// 记录已访问过的点
let visited = new Set()
//声明棋盘记录以及步数
let chessBoardRecord = []
let chessStep = 0
//声明是否结束游戏
let over = false

//声明游戏状态
// 初始状态是人机对战 1玩家对弈 2人机对战
let status = 2

// 清除定时器
let timer = null

//获取canvas
let chess = document.getElementById("chess") 
let context = chess.getContext("2d")
let winsRecord = []


// 绘制棋盘
window.onload = function () {
    initBoard(context, 15, "#aaa", 2)
document.getElementById('mode').innerHTML = status === 2 ? "人机对战" : "玩家对战"
document.getElementById('character').innerHTML = myChar === 1 ? "黑棋 ⚫️" : "白棋 ⚪"
    
}
// 棋子的绘制在格纹之后绘制的，会在出现在图层上方
// oneStep(context, 2, 4, 1)

// 赢棋数组
let wins = []
// 这个数组没有建好，之后的都是白搭 (*￣︶￣)
for (let i=0; i<15; i++) {
	wins[i] = []
	for(let j=0; j<15; j++){
		wins[i][j] = []
	}
}
// 赢法数量统计
let winsCount = 0
// 计算赢法 感觉是熟悉的动态规划的味道
initWins(15)

// 初始化对战双方的赢法数组
let charWins = []
//统计记法数组  
for (let k = 0; k < 3; k++) {
    charWins[k] = []
    for(let i = 0; i < winsCount; i++){
        charWins[k][i]=0
    }
}


// 棋盘绑定监听事件
chess.onclick = function (e) {
    // 人机对战模式，未到自己落子，那么点击事件失效
    if (status === 2 && character !== myChar) return
    // 如果当前棋局结束，那么不能再下
    if (over) {
        window.alert('当前一局已结束，请重新开始')
        return
    }

    let x = e.offsetX 
    let y = e.offsetY
    let i = Math.floor(x/30)
    let j = Math.floor(y/30)

    // 访问过的点不能再下子
    if (visited.has(i + '_' + j)) return
    
    oneStep(context, i, j, character)
    
    // 检查是否获胜
    if ( checkWin(i, j, character) ) {
        over = true
        // 因为canvas绘制是异步，所以通过定时器设置异步，保证在落子之后提示哪方胜利
        let str = `${character === 2 ? '白棋 ⚪' : '黑棋⚫️'}胜利`
        if (status === 2) str = "你赢了！(*￣︶￣)"
        /* 单纯的传参操作是不行的 (*￣︶￣)
        timer = setTimeout( (str) => {
            // 因为异步拿到的character是交换之后的，所以提示信息是相反的
            // window.alert(`${character === 1 ? '白棋' : '黑棋'}胜利`)
            window.alert(str)
        }, 300)
        */
       function _alert (s) {
            window.alert(s)
       }
       timer = setTimeout( () => {
        // 传入一个函数，会把参数带进去
        _alert(str)
    }, 300)
    }

    // 交替落子
    if (!over) {
        character = 3 - character
        if(status === 1) document.getElementById('character').innerHTML = character === 1 ? "黑棋 ⚫️" : "白棋 ⚪"
        if (status === 2) { 
            computerMove(character) 
            character = 3 - character
        }
    }
}

// 绘制棋盘
function initBoard (item, num, color, lineWidth) {
    item.strokeStyle = color
    //1px宽度颜色变浅, 所以改为2px
    item.lineWidth = lineWidth
    for (let i = 0; i < num; i++) {
        // 每行间隔 30px
        // 画出横线
        item.moveTo(20, 20 + i * 30)
        item.lineTo(440, 20 + i * 30)
        item.stroke()
        // 画出竖线
        item.moveTo(20 + i * 30, 20)
        item.lineTo(20 + i * 30, 440)
        item.stroke()
    }
}

// 绘制棋子
function oneStep (item, i, j, character) {
    // 记录每步棋
    visited.add(i + '_' + j)
    const color = [["#0a0a0a", "#636766", 0],["#D1D1D1","#F9F9F9", 2]]
    let x = 20 + i * 30
    let y = 20 + j * 30
    item.beginPath() 
    item.arc(x, y, 12, 0, 2*Math.PI)
    item.closePath()
    // 渐变效果
    let gradient = context.createRadialGradient(x + 2, y - 2, 14, x, y, color[character - 1][2]);
    // 最终的填充效果是在圆心为(x, y)内径根据角色调节，圆心为(x + 2, y -2)外径为15的一个圆环上产生渐变
    gradient.addColorStop(0, color[character - 1][0])
    gradient.addColorStop(1, color[character - 1][1])
    item.fillStyle = gradient
    item.fill()
    // 记录下棋步数
    chessStep++
}

// 计算赢法 感觉是熟悉的动态规划的味道
function initWins (num) {
    // 横向
    for (let i = 0; i < num; i++) {
        // 因为五个相连就会赢，所以第二层循环截止到第10个
        for (let j = 0; j < num - 4; j++) {
            for (let k = 0; k < 5; k++) {
                // 填满五颗，即可得到一种赢法
                wins[i][j + k][winsCount] = true
                }
            // 完成一种赢法
            winsCount++
        }
    }

    // 纵向
    for (let i = 0; i < num; i++) {
        // 因为五个相连就会赢，所以第二层循环截止到第10个
        for (let j = 0; j < num - 4; j++) {
            for (let k = 0; k < 5; k++) {
                // 填满五颗，即可得到一种赢法
                wins[j + k][i][winsCount] = true
            }
            // 完成一种赢法
            winsCount++
        }
    }
    // x = y 向
    // 两层循环都是 截止 11 个
    for (let i = 0; i < num - 4; i++) {
        for (let j = 0; j < num - 4; j++) {
            for (let k = 0; k < 5; k++) {
                // 填满五颗，即可得到一种赢法
                wins[i + k][j + k][winsCount] = true
            }
            // 完成一种赢法
            winsCount++
        }
    }
    // x = -y 向
    for (let i = 0; i < num - 4; i++) {
        // 第二层要反向
        for (let j = num - 1; j > 3; j--) {
            for (let k = 0; k < 5; k++) {
                // 填满五颗，即可得到一种赢法
                wins[i + k][j - k][winsCount] = true
            }
            // 完成一种赢法
            winsCount++
        }
    }
// console.log(winsCount)
}

function checkWin (i, j, character) {
    let flag = false
    //记录走过的棋子
    chessBoardRecord.push([i,j])
    let arr = []
    for (let k = 0; k < winsCount; k++) {
        // 如果当前是会赢的状态
        if (wins[i][j][k]) {
            arr.push(k)
             //某种赢的某子true
             // 一方离胜利更近，另一方则失去胜利可能
             charWins[character][k]++
             charWins[3 - character][k] = 6
             if (charWins[character][k] === 5) flag = true
        }
    }
    // 这里需要有一个flag，采用直接return 的方式会跳过
    winsRecord.push(arr)
    return flag
}

function computerMove (character) {
    // console.log('hi')
    // 玩家每步的得分
    let plScore = []
    // ai每步的得分
    let aiScore = []

    //落子的价值
    let max = 0 
    //落子的坐标
    let u = 0, v = 0 

    // 初始化两个得分矩阵
    for (let i = 0; i < 15; i++) {
        plScore[i] = []
        aiScore[i] = []
        for (let j = 0; j < 15; j++) {
            plScore[i][j] = 0
            aiScore[i][j] = 0
        }
    }

    // 为每种赢法打分
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            // 计算的是没有下过棋的点
            if (!visited.has(i + '_' + j)) {
                for (let k = 0; k < winsCount; k++) {
                    // 如果这点有赢的可能
                    if (wins[i][j][k]) {
                        // 当前赢法已取得的棋子数量
                        let pl = charWins[3 - character][k]
                        let ai = charWins[character][k]
                        // 根据不同棋子数量 按不同权重为玩家和ai计分

                        if (pl === 1) plScore[i][j] += 200
                        else if (pl === 2) plScore[i][j] += 400
                        else if (pl === 3) plScore[i][j] += 2000
                        else if (pl === 4) plScore[i][j] += 10000

                        if (ai === 1) plScore[i][j] += 220
                        else if (ai === 2) aiScore[i][j] += 420
                        else if (ai === 3) aiScore[i][j] += 2200
                        else if (ai === 4) aiScore[i][j] += 20000
                    }
                }

                //下面判断计算机落子的最佳处
                //人在某步的权值更高的时候
                if (plScore[i][j] > max ) {
                    max = plScore[i][j]
                    u = i 
                    v = j 
                } else if (plScore[i][j] = max){
                    //如果权值是最大了
                    if (aiScore[i][j] > aiScore[u][v]){
                        //而ai 在 i,j点的权值比在u,v点的更大时
                        u = i 
                        v = j
                    }
                }
                if (aiScore[i][j] > max ){
                    //电脑在某步的权值更高的时候
                    max = aiScore[i][j]
                    u = i 
                    v = j
                } else if (aiScore[i][j] = max){
                    //如果电脑权值是最大了
                    //但玩家在此处落子更有用
                    if(plScore[i][j] > plScore[u][v]){
                        u = i 
                        v = j 
                    }
                }
            }
        }
    }
    // 得到最佳落子点, 落子
    oneStep(context, u, v, character)

    // 检查是否获胜
    if ( checkWin(u, v, character) ) {
        over = true
        // 因为canvas绘制是异步，所以通过定时器设置异步，保证在落子之后提示哪方胜利
        timer = setTimeout( () => {
            // 因为异步拿到的character是交换之后的，所以提示信息是相反的
            window.alert('你输了(⊙︿⊙)')
        }, 300)
    }
}


/*********** 完善功能 *************/

// 悔棋
let withDraw = document.getElementById('withdraw')

withDraw.onclick = function (e) {
    if (chessStep >= 1 && over === false) {
		withdrawFun()
		if ( status === 2 ) withdrawFun()
	} else {
		alert('无法悔棋了~')
	}
}

function withdrawFun () {
    let record = chessBoardRecord.pop()
	let recordX = record[0] * 30 + 20
    let recordY = record[1] * 30 + 20
    
    // 画一个方块把之前的圆覆盖住
    context.clearRect(recordX - 18, recordY - 18, 30, 30)
	context.beginPath()
    context.closePath()
    //横线
	context.moveTo(record[0] === 0 ? recordX : recordX - 18, recordY)
	context.lineTo(record[0] === 14 ? recordX : recordX + 18, recordY)
	//竖线
	context.moveTo(recordX, record[1] === 0 ? recordY : recordY - 18)
	context.lineTo(recordX,record[1] === 14 ? recordY : recordY + 18)
    context.stroke()

    visited.delete(record[0] + '_' + record[1])
    chessStep--
    // 悔棋的话，说明角色已经切换，现在切换回来
    character = 3 - character
    

    // 赢法数组也需要将记录销毁
    let withdrawWinsRecord = winsRecord.pop()
    //console.log(withdrawWinsRecord)
    for (let i = 0; i < withdrawWinsRecord.length; i++) {
        charWins[character][withdrawWinsRecord[i]]--
        charWins[3 - character][withdrawWinsRecord[i]] -= 6
    }
}

//模式切换
let changeMode=document.getElementById('changeMode');
changeMode.onclick = function () {
	if ( chessStep === 0 ) {
        status = 3 - status
        document.getElementById('mode').innerHTML = status === 2 ? '人机对战':'玩家对战'
	}else{
		alert('请重新开局后再选择模式')
	}
}

//重新开局
let restart = document.getElementById('restart');
restart.onclick = function () {
//location.reload()
// 变量初始化
    character = 1
    myChar = 1
    // 清除记录
    visited.clear()
    chessBoardRecord = []
    chessStep = 0
    over = false
    status = 2

    //清除定时器
    if(timer) clearTimeout(timer)
    timer = null

    // 初始化对战双方的赢法数组
    charWins = []
    //统计记法数组  
    for (let k = 0; k < 3; k++) {
        charWins[k] = []
        for (let i = 0; i < winsCount; i++) {
            charWins[k][i]=0
        }
    }
    winsRecord = []

// 重新绘制棋盘
	context.clearRect(0, 0, 460, 460)
	context.beginPath()
    context.closePath()
    initBoard(context, 15, "#aaa", 2)
    
// 更新title
    document.getElementById('mode').innerHTML = status === 2 ? "人机对战" : "玩家对战"
    document.getElementById('character').innerHTML = character === 1 ? "黑棋 ⚫️" : "白棋 ⚪"	
}
//电脑先下
let aiFirst = document.getElementById('aiFirst');
aiFirst.onclick=function(){
	if (status === 2 && chessStep <= 0) {
        character = 2
        myChar = character
		oneStep(context, 7, 7, 3 - character)
        checkWin(7, 7, 3 - character)
        document.getElementById('character').innerHTML = myChar === 1 ? "黑棋 ⚫️" : "白棋 ⚪"	
	}else{
		alert('请重新开局再点击')
	}
}
