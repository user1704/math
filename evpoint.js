evpoint = function(p, role) {
    five=0;four=0;three=0;
    var x=p[0];var y=p[1];
    var line0=[role];
    for(var i=1;i<5;i++){
        if(y+i>=15) break;
        line0.push(chessBox[x][y+i])
    }
    for(var i=1;i<5;i++){
        if(y-i<0) break;
        line0.unshift(chessBox[x][y-i])
    }
    var line1=[role];
    for(var i=1;i<5;i++){
        if(x+i>=15||y+i>=15) break;
        line1.push(chessBox[x+i][y+i])
    }
    for(var i=1;i<5;i++){
        if(x-i<0||y-i<0) break;
        line1.unshift(chessBox[x-i][y-i])
    }
    var line2=[role];
    for(var i=1;i<5;i++){
        if(x+i>=15) break;
        line2.push(chessBox[x+i][y])
    }
    for(var i=1;i<5;i++){
        if(x-i<0) break;
        line2.unshift(chessBox[x-i][y])
    }
    var line3=[role];
    for(var i=1;i<5;i++){
        if(x-i<0||y+i>=15) break;
        line3.push(chessBox[x-i][y+i])
    }
    for(var i=1;i<5;i++){
        if(x+i>=15||y-i<0) break;
        line3.unshift(chessBox[x+i][y-i])
    }
    var val=evline(line0,role)+evline(line1,role)+evline(line2,role)+evline(line3,role);
    if(role==1&&five==0){
        if(four>=2||three>=2) return -6000000000;
    }
    return val;
  }