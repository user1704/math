score = function(count, block, len) {
    if(count==5) {five++;return FIVE};
    if(count==4){
        if(len==5) {four++;return BLOCKED_FOUR}
        else if(block==1) {four++;return BLOCKED_FOUR}
        else if(block==0) {four++;return FOUR};
    }
    if(count==3){
        if(len==5) return BLOCKED_THREE;
        else if(block==1) return BLOCKED_THREE;
        else if(block==0) {three++;return THREE};
    }
    if(count==2){
        if(len==5) return BLOCKED_TWO;
        else if(block==1) return BLOCKED_TWO;
        else if(block==0) return TWO;
    }
    if(count==1){
        if(block==1) return BLOCKED_ONE;
        else if(block==0) return ONE;
    }
    return 0
  }