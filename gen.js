MAX_NODE=24;
gen = function(role) {
    var result=[];
    var fives=[];
    var fours=[];
    for(var i=0;i<15;i++) {
      for(var j=0;j<15;j++) {
        if(chessBox[i][j] == EMPTY) {
          if(hasNeighbor([i, j], 2)) { //必须是有邻居的才行
            var bs=evpoint([i,j],BLACK);
            var ws=evpoint([i,j],WHITE);
            if(role!=1||bs>-6000000000){
                var s=bs+ws
                if((role==1&&bs>=1000000)||(role==2&&ws>=1000000)) return [[i,j]]
                else if((role==1&&ws>=1000000)||(role==2&&bs>=1000000)) fives.push([i,j])
                else if((role==1&&bs>=250000)||(role==2&&ws>=250000)) fours.push([i,j])
                result.push([i,j,s])
            }
          }
        }
      }
    }
    if(fives.length) return [fives[0]];
    if(fours.length) return [fours[0]];
    return result.sort((a,b)=>b[2]-a[2]).slice(0,MAX_NODE);
  }