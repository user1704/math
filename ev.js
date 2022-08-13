ev = function(role) {
    var result = [];
    //横向
    for(var i=0;i<15;i++) {
      result.push(chessBox[i]);
    }
  
  
    //纵向
    for(var i=0;i<15;i++) {
      var col = [];
      for(var j=0;j<15;j++) {
        col.push(chessBox[j][i]);
      }
      result.push(col);
    }
  
  
    // \/ 方向
    for(var i=0;i<30;i++) {
      var line = [];
      for(var j=0;j<=i && j<15;j++) {
        if(i-j<15) line.push(chessBox[i-j][j]);
      }
      if(line.length) result.push(line);
    }
  
  
    // \\ 方向
    for(var i=-14;i<15;i++) {
      var line = [];
      for(var j=0;j<15;j++) {
        if(j+i>=0 && j+i<15) line.push(chessBox[j+i][j]);
      }
      if(line.length) result.push(line);
    }
    var val=0;
    for(var i=0;i<result.length;i++){
        val+=evline(result[i],1);
        val-=evline(result[i],2);
    }
    if(role==1){
        return val;
    }
    else{
        return -val;
    }
  }
  