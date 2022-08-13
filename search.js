search=function(alpha,beta,depth,role){
    FoundPv=false;
    var val=ev(role);
    if(val>=10000000) return 10000000-DEPTH+depth;
    if(val<=-10000000) return -10000000+DEPTH-depth;
    if(depth<=0) return val;
    var val=-search(-beta,-beta+1,depth-3,3-role);
    if(val>=beta) return beta;
    var mvs=gen(role);
    if(mvs.length==0) return 0;
    for(var i=0;i<mvs.length;i++){
        var mv=[mvs[i][0],mvs[i][1]];
        chessBox[mv[0]][mv[1]]=role;
        if(FoundPv){
            var val=-search(-alpha-1,-alpha,depth-1,3-role);
            if((val>alpha)&&val<beta) var val=-search(-beta,-alpha,depth-1,3-role);
        }
        else{
            var val=-search(-beta,-alpha,depth-1,3-role);
        }
        chessBox[mv[0]][mv[1]]=0;
        if(val>=beta) return beta;
        if(val>alpha){
            alpha=val;
            FoundPv=true;
            if(DEPTH==depth) MOVE=mv;
        }
    }
    return alpha;
}
deep=function(){
    for(DEPTH=1;DEPTH<=7;DEPTH++){
        var val=search(-1000000000000,1000000000000,DEPTH,steps.length%2+1);
        console.log(DEPTH+"层|"+val+"分|"+name(MOVE))
    }
    return MOVE;
}