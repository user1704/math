evline = function(line, role) {
    var count = 0; // 连子数
    var block = 0; // 封闭数
    var empty = 0;  //空位数
    var dempty = 0;  
    var val = 0;  //分数
  
    for(var i=0;i<line.length;i++) {
      if(line[i] == role) { // 发现第一个己方棋子
        count=1;
        block=0;
        len=1;
        lenadd=0;
        //判断左边界
        if(i==0) block=1;
        else if(line[i-1] != EMPTY) block = 1;
  
        //计算己方棋子数
        for(i=i+1;i<line.length;i++) {
          if(line[i] == role) {count++;len+=lenadd+1;lenadd=0;}
          else if(line[i]==EMPTY) lenadd++;
          else break;
          if(len+lenadd==5) break;
        }
        if(count==5&&i+1<line.length&&line[i+1]==role) role==1?val-=SIX:val+=SIX;
        //判断右边界
        if(i==line.length || line[i] != EMPTY) block++;
        val += score(count, block, len);
      }
    }
  
    return val;
  }