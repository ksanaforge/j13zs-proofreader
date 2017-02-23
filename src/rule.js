/* convert simple markup to tag */
var PBLINE=[];
var initpage="";
const fs=require("ksana2015-proofreader").socketfs;
var doc=null;
var footnote=null;
const {action}=require("ksana2015-proofreader").model;
const pdfs={
	"1":[0,102],
	"2":[103]
};
const starts={"1a":15,"1b":1};
const leftTopFromSide=function(side){
	var left=-400,top=-50;
	if (side==1){
		left=-10;
	}else if (side==2) {
		top=-760;
	} else if (side==3) {
		left=-10;
		top=-760;
	}
	return {left,top}
}
var getPDFPage=function(pageid,fn) {
	if (!pageid || !pageid.match)return;
	var m=pageid.match(/(\d+)([abcd])/);
	if (!m)return ;
	const pg=parseInt(m[1],10);
	const side=m[2].charCodeAt(0)-0x61;
	const prefix=parseInt(fn,10);
	const ranges=pdfs[prefix];
	
	for (var i=ranges.length-1;i>=0;i--){
		if (pg>ranges[i]) {
			const pdfbase=prefix+String.fromCharCode(0x61+i);
			const pdffn="pdf/"+pdfbase+".pdf";
			const {left,top}=leftTopFromSide(side);
			return {pdffn,page:pg-ranges[i]-1+starts[pdfbase],left,top};
		}
	}

	
}
var init=function(){
	fs.setDataroot("j13zs-corpus/htll/")	;
}
var onTagClick=function(e) {
		var marker=e.target.marker;
		var pos=marker.find();
		doc.setCursor(pos.to);
		doc.cm.focus();
		marker.clear();
}
var createMarker=function(classname,tag) {
		var element=document.createElement("SPAN");
		element.className=classname;
		element.innerHTML=tag;
		element.onclick=onTagClick;
		return element;
}
const getpagesize=function(doc,i){
	const max=doc.lineCount();
	var j=i+1,minus=0;
	while (j<max) {
		var line=doc.getLine(j);
		if (line[0]=="~") break;
		if (line[0]=="^") minus++; //article tag
		j++;
	}
	return j-i-minus;
}
var markLine=function(i,rebuild) {
		if (i>doc.lineCount())return;
		var M=doc.findMarks({line:i,ch:0},{line:i,ch:65536});
		M.forEach(function(m){m.clear()});
		var line=doc.getLine(i);
		line.replace(/~(\d+[abcd])/g,function(m,pg,idx){
			const pagesize=getpagesize(doc,i);
			const pgerror=pagesize==11?"":"_error";
			var element=createMarker("pbmarker"+pgerror,pg);
			var marker=doc.markText({line:i,ch:idx},{line:i,ch:idx+m.length},
				{clearOnEnter:true,replacedWith:element});
			element.marker=marker;
		});
		//article tag
		line.replace(/\^(.+)/g,function(m,m1,idx){
			var element=createMarker("article",m1);
			var marker=doc.markText({line:i,ch:idx},{line:i,ch:idx+m.length},
				{clearOnEnter:true,replacedWith:element});
			element.marker=marker;
		});

		line.replace(/%(\d+)\.(\d+)/g,function(m,m1,m2,idx){
			var element=createMarker("corration",m1+"."+m2);
			var marker=doc.markText({line:i,ch:idx},{line:i,ch:idx+m.length},
				{clearOnEnter:true,replacedWith:element});
			element.marker=marker;
		});

		line.replace(/\{(.+?)\}/g,function(m,big,idx){
			big=big.replace(/%(\d+)\.(\d+)/g,"");
			var element=createMarker("big",big);
			//TODO do not mark inline corration
			var marker=doc.markText({line:i,ch:idx},{line:i,ch:idx+m.length},
				{clearOnEnter:true,replacedWith:element});
			element.marker=marker;
		});

		setTimeout(function(){
			if (rebuild) buildPBLINE();
		},100);//<pb id="1.2b"/>
	}

var markAllLine=function() {
	var M=doc.getAllMarks();
	M.forEach(function(m){m.clear()});
	for (var i=0;i<doc.lineCount();i++){
		markLine(i);
	}
	buildPBLINE();
}
var prevpageid=function(pageid){
	var m=pageid.match(/(\d+)/);
	if (!m) return pageid;
	return (parseInt(m[1])-1);
}
var buildPBLINE=function() {
		//var t=new Date();
		console.log("buildPBLINE")
		var marks=doc.getAllMarks();
		if (!marks.length)return;
		PBLINE=[];
		for (var i=0;i<marks.length;i++) {
			var m=marks[i];
			if (m.replacedWith.className.substr(0,8)=="pbmarker") {
				var pos=m.find();
				PBLINE.push([pos.from.line,m.replacedWith.innerHTML]);
			}
		}
		PBLINE.sort(function(a,b){
			return a[0]-b[0];
		});

		if (PBLINE[0][0]>0) { //append previous PB
			PBLINE.unshift([1,prevpageid(PBLINE[0][1])]);
		}
		//console.log("rebuild pbline",new Date()-t);
	}
var setDoc=function(_doc){
	doc=_doc;
}
var getPageByLine=function(line) {
	if (!PBLINE.length)return ["",0];
		for (var i=1;i<PBLINE.length;i++) {
			var pbline=PBLINE[i];
			if (pbline[0]>line) {
				return PBLINE[i-1];
			}
		}
		return PBLINE[PBLINE.length-1];//default
}

var getFootnote=function(str,pg){
	var m=str.match(/#(\d+)\.(\d+)/);
	if (m){
		return pg+"#" +footnote[m[1]+"."+m[2]];
	}
	return "";
}
var setHotkeys=function(cm){
	cm.setOption("extraKeys", {
  	"Ctrl-S": function(cm) {
  		action("savefile");
  	},
  	"Ctrl-M":function(cm){ //cannot captured in preview mode
  		action("nextpage");
  	}  	
  });
}
const onBeforeChange=function(){

}
const validateMark=function(){

}
const getNextPage=function(p){//1c=>1d, 1d=>2a 
  if (!p)return;
  const m=p.match(/(\d+)([abcd])/);
  if (!m) return ;
  if (m[2]=="d") {
    pageid=(parseInt(m[1],10)+1)+"a";
  } else {
    pageid=m[1]+String.fromCharCode(m[2].charCodeAt(0)+1);
  }
  return pageid;    
}
const getPrevPage=function(p){ //2b=>2a, 2a=>1d
  if (!p)return;
  const m=p.match(/(\d+)([abcd])/);
  if (!m) return ;
  if (m[2]=="a") {
    if (m[1]!="1") {
        pageid=(parseInt(m[1],10)-1)+"d";        
    } else {
      pageid=p;
    }
  } else {
    pageid=m[1]+String.fromCharCode(m[2].charCodeAt(0)-1);
  }
  return pageid;
}
var helpmessage="";
module.exports={markAllLine,markLine,initpage,setDoc,onBeforeChange,validateMark
,getPageByLine,init,getFootnote,setHotkeys,helpmessage,getPDFPage
,getNextPage,getPrevPage};