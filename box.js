boxparse=function(box){
    if(typeof box!="object"){
        return box
    }
    if(box.num!=undefined){
        return box.num
    }
    if(box[0]=="Add"){
        var t=["Add"]
        var number=0
        for(var i=1;i<box.length;i++){
            if(typeof box[i]=="number"){
                number+=box[i]
            }
            else if(box[i].num!=undefined){
                number+=Number(box[i].num)
            }
            else{
                t.push(boxparse(box[i]))
            }
        }
        return ce.box(t.concat(number)).simplify().json
    }
    if(box[0]=="Subtract"){
        var t=["Subtract"]
        var number=0
        for(var i=1;i<box.length;i++){
            if(typeof box[i]=="number"){
                i==1?number+=box[i]:number-=box[i]
            }
            else if(box[i].num!=undefined){
                i==1?number+=Number(box[i].num):number-=Number(box[i].num)
            }
            else{
                t.push(boxparse(box[i]))
            }
        }
        return ce.box(["Add",t,number]).simplify().json
    }
    if(box[0]=="Multiply"){
        var t=["Multiply"]
        var number=1
        for(var i=1;i<box.length;i++){
            if(typeof box[i]=="number"){
                number*=box[i]
            }
            else if(box[i].num!=undefined){
                number*=Number(box[i].num)
            }
            else{
                t.push(boxparse(box[i]))
            }
        }
        return ce.box(t.concat(number)).simplify().json
    }
    if(box[0]=="Divide"){
        var t=["Divide"]
        for(var i=1;i<box.length;i++){
            t.push(boxparse(box[i]))
        }
        return ce.box(t).simplify().json
    }
    if(box[0]=="Rational"){
        var t=["Rational"]
        for(var i=1;i<box.length;i++){
            t.push(boxparse(box[i]))
        }
        return ce.box(t).simplify().json
    }
    if(box[0]=="Delimiter"){
        return boxparse(box[1])
    }
}