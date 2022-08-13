hasNeighbor = function(point, distance) {
    var startX = point[0]-distance;
    var endX = point[0]+distance;
    var startY = point[1]-distance;
    var endY = point[1]+distance;
    for(var i=startX;i<=endX;i++) {
      if(i<0||i>=15) continue;
      for(var j=startY;j<=endY;j++) {
        if(j<0||j>=15) continue;
        if(i==point[0] && j==point[1]) continue;
        if(chessBox[i][j] !=EMPTY) {
            return true;
        }
      }
    }
    return false;
  }