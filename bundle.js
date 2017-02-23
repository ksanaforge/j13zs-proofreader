(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"C:\\ksana2015\\j13zs-proofreader\\index.js":[function(require,module,exports){
var React=require("react");
var ReactDOM=require("react-dom");
if(window.location.origin.indexOf("//127.0.0.1")>-1) {
	require("ksana2015-webruntime/livereload")(); 
}
var ksanagap=require("ksana2015-webruntime/ksanagap");
ksanagap.boot("j13zs-proofreader",function(){
	var Main=React.createElement(require("./src/main"));
	ksana.mainComponent=ReactDOM.render(Main,document.getElementById("main"));
});
},{"./src/main":"C:\\ksana2015\\j13zs-proofreader\\src\\main.js","ksana2015-webruntime/ksanagap":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\ksanagap.js","ksana2015-webruntime/livereload":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\livereload.js","react":"react","react-dom":"react-dom"}],"C:\\ksana2015\\j13zs-proofreader\\src\\controls.js":[function(require,module,exports){
const React=require("react");

const E=React.createElement;
const PT=React.PropTypes;
const markupButtons=React.createClass({displayName: "markupButtons",
	contextTypes:{
    action:PT.func,
    getter:PT.func,
    listen:PT.func
	}	
	,render:function(){
		return E("span",{},
			E("button",{onClick:this.props.togglePreview},"preview")
		)	
	}
});
var loadSaveButtons=React.createClass({displayName: "loadSaveButtons",
	contextTypes:{
    	action:PT.func,
    	getter:PT.func,
    	listen:PT.func,
    	unlistenAll:PT.func
	}
	,getInitialState:function(){
		var fn=localStorage.getItem("j13zs_workingfn")||"1-1.txt";
		var starttime=new Date();
		return {fn,starttime};
	}
	,componentDidMount:function(){
		setTimeout(this.loadfile,1000);
		this.context.listen("savefile",this.savefile,this);		
		this.timer=setInterval(this.updatetimer,10000);
	}
	,componentWillUnmount:function(){
		this.context.unlistenAll(this);
		clearInterval(this.timer);
	}
	,loadfile:function(){
		var action=this.context.action;
		var fn=this.state.fn;
		this.setState({starttime:new Date(),elapse:0});
		this.context.getter("file",this.state.fn,function(data){
			action("loaded",{data,fn});
			localStorage.setItem("j13zs_workingfn",fn);
		});
	}
	,loadnextfile:function(){
		var fn=this.state.fn.replace(/\d+/,function(m){
			return parseInt(m)+1;
		});
		this.setState({fn},function(){
			this.loadfile();
		}.bind(this));
	}
	,savefile:function(){
		if (!this.props.dirty)return;
		
		var action=this.context.action;
		var content=this.context.getter("getcontent");
		this.context.getter("save",{fn:this.state.fn,content},function(err){
			action("saved");
			this.setState({starttime:new Date(),elapse:0});
		}.bind(this));
	}
	,onInput:function(e){
		this.setState({fn:e.target.value});
	}
	,onKeyPress:function(e){
		if (e.key=="Enter"){
			this.loadfile();
		}
	}
	,updatetimer:function(){
		this.setState({elapse: 1+Math.floor((new Date()-this.state.starttime)/1000) });
	}
	,render:function(){
		if (this.props.preview)return E("span");
		return E("div",{},
			E("button",{onClick:this.loadfile,disabled:this.props.dirty},"load"),
			E("input",{size:7,onKeyPress:this.onKeyPress,
					value:this.state.fn,onChange:this.onInput,disabled:this.props.dirty}),
			E("button",{onClick:this.savefile,disabled:!this.props.dirty},"save"),
			E("span",{style:styles.elapse},this.state.elapse,"secs")
		)	
	}
});

var Controls=React.createClass({displayName: "Controls",
	contextTypes:{
		action:PT.func,
		getter:PT.func,
    listen:PT.func,
    unlistenAll:PT.func
	}
	,getInitialState:function(){
		return {note:""};
	}
	,componentDidMount:function(){
		this.context.listen("footnote",this.footnote,this);		
	}
	,componentWillUnmount:function(){
		this.context.unlistenAll(this);
	}
	,footnote:function(note){
		this.setState({note});
	}
	,nextpage:function(){
		this.context.action("nextpage");
	}
	,prevpage:function(){
		this.context.action("prevpage");
	}
	,gounicode:function(){
		var str=this.props.charAtCursor;
		var c=str.charCodeAt(0);
		var s=str.substr(0,1);
  	if (c>0xd800 && c<0xdfff) {
  		s=str.substr(0,2);
  	}
		window.open("http://kangxi.adcs.org.tw/kangxizidian/#"+s);
	}
	,getUnicode:function(str){
		var c=str.charCodeAt(0);
  	if (c>0xd800 && c<0xdfff) {
  		const c2=str.charCodeAt(1);
  		c=0x10000+ (c & 0x3ff) * 1024 + (c2&0x3ff);
  	}
  	return c.toString(16).toUpperCase();	
	}	
	,render:function(){
		return E("div",{style:styles.container},
			E("div",{},E("span",{style:styles.note},this.props.helpmessage)),	
			E(loadSaveButtons,this.props),E(markupButtons,{togglePreview:this.props.togglePreview}),
			E("span",{onClick:this.gounicode,style:styles.unicode},this.getUnicode(this.props.charAtCursor)),
			E("button",{onClick:this.prevpage},"Prev"),			
			E("button",{onClick:this.nextpage},"Next"),			
			E("div",{},E("span",{style:styles.note},this.state.note))
		);
	}
})
var styles={
	container:{right:16,width:110,zIndex:100,
			background:"silver",position:"absolute",opacity:0.8},
	note:{fontSize:"50%"},
	unicode:{fontSize:"60%",cursor:"pointer"},
	warnings:{fontSize:"50%"},
	elapse:{fontSize:"50%"}
}
/*
  HOT KEY for next error

*/
module.exports=Controls;

},{"react":"react"}],"C:\\ksana2015\\j13zs-proofreader\\src\\main.js":[function(require,module,exports){
const React=require("react");
const ReactDOM=require("react-dom");
const CodeMirror=require("ksana-codemirror").Component;
const E=React.createElement;
const PT=React.PropTypes;
const styles={image:{height:"100%"}};
const Controls=require("./controls");
const Preview=require("./preview");
const rule=require("./rule");
const {setRule,fileio,PDFViewer}=require("ksana2015-proofreader");
const {listen,unlistenAll,action,getter,registerGetter,unregisterGetter}=require("ksana2015-proofreader").model;

const Maincomponent = React.createClass({displayName: "Maincomponent",
	getInitialState:function() {
	//	var m=new Magnifier();
		setRule(rule);
		return {data:"",pageid:rule.initpage,dirty:false,warningcount:0
		,pdffn:"",page:0,preview:null,charAtCursor:""};
	}
	,prevline:-1
  ,childContextTypes: {
    listen: PT.func
    ,unlistenAll: PT.func
    ,action: PT.func
    ,getter: PT.func
    ,registerGetter:PT.func
    ,unregisterGetter:PT.func
  }
  ,getChildContext:function(){
    return {action,listen,unlistenAll,getter,registerGetter,unregisterGetter};
  }
	,componentWillMount:function(){
		fileio.init();
		listen("loaded",this.loaded,this);
		listen("saved",this.saved,this);
    listen("nextpage",this.nextpage,this);
    listen("prevpage",this.prevpage,this);
		listen("nextwarning",this.nextwarning,this);
		listen("pinpoint",this.pinpoint,this);
		registerGetter("getcontent",this.getcontent);
		registerGetter("setcontent",this.setcontent);
		registerGetter("getpagetext",this.getPageText);
	}
  ,setPreviewPage:function(pageid){
    const preview=this.getPageText(pageid,this.state.data);
    var m=rule.getPDFPage(pageid,this.state.fn);
    this.updatepdfpage(pageid,m);
    this.setState({preview});
  }
  ,nextpage:function(){
    const pageid=rule.getNextPage(this.state.pageid);
    if (this.state.preview) return this.setPreviewPage(pageid);
    this.prepareCM(this.getPageStartIndex(pageid));
  }
  ,prevpage:function(){
    const pageid=rule.getPrevPage(this.state.pageid);
    if (this.state.preview) return this.setPreviewPage(pageid);
    this.prepareCM(this.getPageStartIndex(pageid));
  }
	,getPageStartIndex:function(pageid){
		const start="~"+pageid||this.state.pageid;
		var index=this.getcontent().indexOf(start);
		return index;
	}
  ,getPageText:function(pageid,content){
    content=content||this.getcontent();
    const start="~"+(pageid||this.state.pageid);
    var from=content.indexOf(start);
    from+=start.length+1;
    var to=content.indexOf("~",from+1);
    if (to==-1) to=content.length; 
    return content.substring(from,to);
  }
	,componentWillUnmount:function(){
		unregisterGetter("getcontent");
		unregisterGetter("setcontent");
		unregisterGetter("getpagetext");
		unlistenAll(this);
	}
	,pinpoint:function(index){
		const pageid=this.state.pageid;
		this.setState({preview:null},()=>{
			this.prepareCM(this.getPageStartIndex(pageid)+index);
		});
	}
	,goto:function(index){
		if (!index)return;
		var pos=this.cm.posFromIndex(index);
		this.cm.scrollIntoView(pos,400);
		setTimeout(()=>{
			this.cm.doc.setCursor(pos);
			this.cm.focus();
			this.cm.doc.markText(pos,{line:pos.line,ch:pos.ch+1},
			{className:"pinpoint",clearOnEnter:true});
		},500);
	}
	,prepareCM:function(index){
		this.cm=this.refs.cm.getCodeMirror();//codemirror instance
		rule.setHotkeys(this.cm);
		this.doc=this.cm.getDoc();

		rule.setDoc(this.doc);
		rule.markAllLine();
		this.goto(index);
	}
	,componentDidMount:function(){
		this.prepareCM();
	}
	,getcontent:function(){
		return this.refs.cm.getCodeMirror().getValue();
	}
	,setcontent:function(content){
		this.refs.cm.getCodeMirror().setValue(content);
		if (!this.state.dirty) this.setState({dirty:true});
		rule.markAllLine();
	}
	,loaded:function(res){
		this.setState({data:res.data,fn:res.fn,dirty:false});
		rule.markAllLine();
		setTimeout(function(){
			this.onChange();//trigger validator
		}.bind(this),500);
	}
	,saved:function(){
		this.setState({dirty:false});
	}
	,nextwarning:function(){//jump to next warning
		var pos=this.cm.getCursor();
		var next=rule.nextWarning(pos.line);
		this.cm.scrollIntoView({line:next+5,ch:0});
		this.doc.setCursor({line:next,ch:0});
	}
  ,updatepdfpage:function(pageid,m){
    this.setState({pdffn:m.pdffn,page:m.page,pageid,left:m.left,top:m.top});
  }
  ,showUnicode:function(str){
  	this.setState({charAtCursor:str.substring(0,2)});
  }
	,onCursorActivity:function(cm) {
		clearTimeout(this.ca);
		this.ca=setTimeout(function(){

		var pos=cm.getCursor();
		var pageid=rule.getPageByLine(pos.line)[1];
		var index=cm.indexFromPos(pos);
		var text=cm.getValue();

		var str=text.substr(index-5,10);

		this.showUnicode(text.substr(index,2));

		if (pos.line!==this.prevline) {
			if (this.prevline>-1) rule.markLine(this.prevline);
			if (this.state.pageid!==pageid) {
				var m=rule.getPDFPage(pageid,this.state.fn);
				if(m) this.updatepdfpage(pageid,m);
				else this.setState({pageid});
			}
		}
		//var footnote=rule.getFootnote(str,pageid);
		//action("footnote",footnote);
		this.prevline=pos.line;

		}.bind(this),500);

	}
  ,updatePBMarker:function(obj){
    if (!obj)return;
    const breakline=(obj.removed.length==1 &&obj.removed[0]==""
      &&obj.text.length==2&&obj.text.join("")=="") ;
    const joinline=(obj.text.length==1 &&obj.text[0]==""
      &&obj.removed.length==2&&obj.removed.join("")=="") ;;
    if (breakline || joinline) {
      const pbline=rule.getPageByLine(obj.from.line)[0];
      rule.markLine(pbline,true);
    }
  }
	,onChange:function(cm,chobj){
		if (!this.state.dirty && this.doc.getValue()!==this.state.data) {//setcontent will trigger onchange
			this.setState({dirty:true});
		}
    this.updatePBMarker(chobj);
		clearTimeout(this.timer1);
		this.timer1=setTimeout(function(){
			var warningcount=rule.validateMark(this.doc.getValue());	
			this.setState({warningcount});
		}.bind(this),500);
	}
	,onBeforeChange:function(cm,co){
		rule.onBeforeChange(cm,co);
	}
	,togglePreview:function(){
    if (this.state.preview) {
      this.setState({preview:null},()=>
        this.prepareCM(this.getPageStartIndex(this.state.pageid)))
    } else {
      const preview=this.getPageText();
      const data=this.getcontent();//get content from editor and save in state
      this.setState({preview,data});
    }
	}	
	,TextViewer:function(){
		if (this.state.preview){
			return E(Preview,{data:this.state.preview});
		} else {
			return E(CodeMirror,{ref:"cm",value:this.state.data,
	      		onChange:this.onChange,theme:"ambiance",
	      		onBeforeChange:this.onBeforeChange,
  	    		onCursorActivity:this.onCursorActivity});
		}
	}
  ,render: function() {
  	return E("div",{},E(Controls,{dirty:this.state.dirty,
  		preview:!!this.state.preview,
  		warnings:this.state.warningcount+" warnings"
  		,charAtCursor:this.state.charAtCursor
  		,togglePreview:this.togglePreview
  		,helpmessage:rule.helpmessage}),
    	E("div",{style:{display:"flex",flexDirection:"row"}},
      	E("div",{style:{flex:45}},
    			E(PDFViewer,{ref:"pdf", style:styles.image,rwidth:0.45,
            left:this.state.left,top:this.state.top,
    				page:this.state.page,pdffn:this.state.pdffn,scale:2})
    			)
    		,E("div",{style:{flex:100}},this.TextViewer())
    	 )
    	)
  }
});

module.exports=Maincomponent;
},{"./controls":"C:\\ksana2015\\j13zs-proofreader\\src\\controls.js","./preview":"C:\\ksana2015\\j13zs-proofreader\\src\\preview.js","./rule":"C:\\ksana2015\\j13zs-proofreader\\src\\rule.js","ksana-codemirror":"ksana-codemirror","ksana2015-proofreader":"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\index.js","react":"react","react-dom":"react-dom"}],"C:\\ksana2015\\j13zs-proofreader\\src\\preview.js":[function(require,module,exports){
const React=require("react");
const ReactDOM=require("react-dom");
const E=React.createElement;
const PT=React.PropTypes;

const Preview=React.createClass({displayName: "Preview",
	getInitialState:function(){
		const parts=this.parseText(this.props.data);
		return {parts};
	}
	,contextTypes:{
		action:PT.func
	}
	,componentWillReceiveProps:function(nextProps){
		if (nextProps.data!==this.props.data) {
			const parts=this.parseText(nextProps.data);
			this.setState({parts});
		}
	}
	,isNonChar:function(code){
		if (code>=0x3000&&code<=0x303f) return true;//cjk puncuation
		if (code<0x7f) return true;
		if (code>=0xff00&&code<=0xff9f) return true;//full width
		return false;
	}
	,getTextFirstCh:function(str,count){
		var i=0;
		while (i<str.length && count){
			const code=str.charCodeAt(i);
			if (code>=0xd800&&code<=0xd900) i++;
			else if (str[i]=="&") {
				while (i<str.length) {
					if (str[i]==";") break;
					i++;
				}
			} else if (this.isNonChar(code)){
				count++;
			}
			i++;count--;
		}
		return str.substr(0,i);
	}
	,chcount:function(str){
		var i=0,c=0;
		while (i<str.length){
			const code=str.charCodeAt(i);
			if (code>=0xd800&&code<=0xd900) i++;
			else if (str[i]=="&") {
				while (i<str.length) {
					if (str[i]==";") break;
					i++;
				}
			} else if (this.isNonChar(code)){
				c--;
			}
			i++;c++;
		}
		return c;
	}
	,parseText:function(str){
		var lines=str.split("\n");
		var parts=[],part,offset=0,i,linestart=[],linecount=0;

		const removeTag=function(t){
			t=t.replace(/[─「」，、．；《》：。〈〉\n㊣]/g,"");
			t=t.replace(/\%\d+\.\d+/g,"");
			return t;
		}
		for (i=0;i<lines.length-1;i++) {
			linestart.push(linecount)
			linecount+=lines[i].length+1;
		}
		linestart.push(linecount);
		for (i=lines.length-1;i>=0;i--) {
			part=[];
			var  line=lines[i];

			var previdx=0,z;
			line.replace(/\{(.*?)\}/g,function(m,m1,idx){
				z=line.substring(previdx,idx);
				if (idx) part.push(["z",removeTag(z),linestart[i]+previdx]);
				if (m1=="■") {
					part.push(["shu","疏",linestart[i]+idx])
				} else {
					part.push(["big",removeTag(m1),linestart[i]+idx]);
				}
				previdx=idx+m.length;
			});
			z=line.substr(previdx).trim();
			if (previdx<line.length) {
				part.push(["z",removeTag(z),linestart[i]+previdx]);
			}
			part.push(["br"]);
			parts=parts.concat(part);
		}
		return parts;
	}
	,renderPart:function(part){
		var out=[];
		const type=part[0],text=part[1],start=part[2];
		var cls={"data-start":start};
		if (type==="big") {
			cls.className="warichu_big";
			out.push(E("span",cls,text));
		} else if (type==="br") {
			out.push(E("br"));
		} else if (type==="shu") {
			cls.className="warichu_shu";
			out.push(E("span",cls,"疏"));
		} else if (type==="z") {
			var w=Math.floor(this.chcount(text)/2);
			if (this.chcount(text)%2==1) w++;
			const right=this.getTextFirstCh(text,w);
			const left=text.substr(right.length);
			cls.className="warichu warichu"+w;
			out.push(E("span",cls,
				E("span",{className:"warichu-right"},right)
				,E("span",{className:"warichu-left"},left)
			));
		}
		return out;
	}
	,onmousemove:function(e){
		const ruler=ReactDOM.findDOMNode(this.refs.ruler);
	
		ruler.style.top=e.clientY+3;//make sure the underlay is clickable
	}
	,guessCharPos:function(cheight,x,y,w,h,side){
		const ccount=h/cheight;
		var c=Math.floor((y/h) * ccount);
		if (side) c+=ccount;
		return c;
	}
	,guestCharHeight:function(str,h){
		var count=this.chcount(str);
		if (count%2==1)count++;//z always has even number
		return (h/count);
	}
	,onclick:function(e){
		var nod=e.target;
		const side=nod.className.indexOf("left")>-1?1:0;
		const cheight=this.guestCharHeight(nod.innerText,nod.offsetHeight);

		if (!nod.dataset.start) nod=nod.parentElement;

		const ch=this.guessCharPos(cheight,e.clientX-nod.offsetLeft,
			e.clientY-nod.offsetTop,nod.offsetWidth,nod.offsetHeight,side);
		if (!nod.dataset.start)return;
		const start=parseInt(nod.dataset.start,10);
		const text=this.props.data.substr(start);
		const chpos=this.getTextFirstCh(text,ch+2).length;
		this.context.action("pinpoint",start+chpos);
	}
	,render:function(){
		return E("div",{className:"v"},
			E("div",{className:"ruler",ref:"ruler"}),
			E("div",{onMouseMove:this.onmousemove,onClick:this.onclick}
				,this.state.parts.map(this.renderPart)) 
		);
	}
});
module.exports=Preview;
},{"react":"react","react-dom":"react-dom"}],"C:\\ksana2015\\j13zs-proofreader\\src\\rule.js":[function(require,module,exports){
/* convert simple markup to tag */
var PBLINE=[];
var initpage="";
const fs=require("ksana2015-proofreader").socketfs;
var doc=null;
var footnote=null;
const {action}=require("ksana2015-proofreader").model;
const pdfs={
	"1":[1,103], //周易
	"2":[1,77,183], //尚書
	"3":[1,109,215,307,405,499,557,703], //毛詩
	"4":[1,89,195,259,321,413,523,611], //周禮
	"5":[1,99,211,261,377,493], //儀禮
	"6":[1,125,235,375,467,575,677,761,879,951], //禮記
	"7":[1,171,311,419,537,629,777,867], //左傳
	"8":[1,85,201,299], //公羊傳
	"9":[1,69], //穀梁傳
	"10":[1], //孝經
	"11":[1,95], //論語
	"12":[1,93], //爾雅
	"13":[1,107,209]  //孟子
};
const starts={"1a":15,"2a":5,"3a":7,"4a":7,"5a":5,"6a":3,"7a":7
             ,"8a":7,"9a":7,"10a":5,"11a":5,"12a":5,"13a":5};
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
		if (pg>=ranges[i]) {
			const pdfbase=prefix+String.fromCharCode(0x61+i);
			const pdffn="pdf/"+pdfbase+".pdf";
			const {left,top}=leftTopFromSide(side);
			const page=pg-ranges[i]+(starts[pdfbase]||1);
			console.log("fetching",pdffn,page)
			return {pdffn,page,left,top};
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
},{"ksana2015-proofreader":"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\index.js"}],"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\fileio.js":[function(require,module,exports){
var {store,action,getter,hasGetter,registerGetter,unregisterGetter}=require("./model");
var fs=require("./socketfs");

var fileio={
	init:function(){
		//store.listen("load",this.load,this);
		registerGetter("file",this.getfile);
		registerGetter("save",this.savefile);
	}
	,savefile:function({fn,content},cb){
		console.log("saving",fn);
		fs.writeFile(fn,content,function(err){
			cb(err);
		});
	}
	,getfile:function(fn,cb){
		console.log("loading",fn);
		const bom=new RegExp(String.fromCharCode(0xFEFF),"g");
		fs.readFile(fn,function(err,data){
			if (!err) cb(data.replace(bom,""));
		});
	}
}
module.exports=fileio;
},{"./model":"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\model.js","./socketfs":"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\socketfs.js"}],"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\index.js":[function(require,module,exports){
var setRule=require("./rule").setRule;
var PDFViewer=require("./pdfviewer");
var fileio=require("./fileio");
var socketfs=require("./socketfs");
var model=require("./model");
module.exports={setRule,PDFViewer,model,socketfs,fileio};
},{"./fileio":"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\fileio.js","./model":"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\model.js","./pdfviewer":"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\pdfviewer.js","./rule":"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\rule.js","./socketfs":"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\socketfs.js"}],"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\model.js":[function(require,module,exports){
/* action dispatcher */
var listeners=[];
var getters={};

var eventqueue=[];
var running=false;

var fireEvent=function(){
	if (eventqueue.length===0) {
		running=false;
		return;
	}
	running=true;

	var task=eventqueue.pop();
	var func=task[0], opts=task[1], cb=task[2], context=task[3];

	if (func.length>1){
		func.call(context,opts,function(err,res,res2){
			cb&&cb(err,res,res2);
			setTimeout(fireEvent,0);
		});
	} else { //sync func
		func.call(context,opts);
		setTimeout(fireEvent,0);
	}
}

var queueTask=function(func,opts,cb,context) {
	eventqueue.unshift([func,opts,cb,context]);
	if (!running) setTimeout(fireEvent,0);
}

var action=function(evt,opts,cb){
	for (var i=0;i<listeners.length;i+=1) {
		var listener=listeners[i];
		if (evt===listener[1] ) {
			if (listener[2]==undefined) {
				console.error("action has no callback",evt,listener);
			}
			queueTask( listener[2], opts,cb  , listener[0]);
		}
	}
}

var getter=function(name,opts,cb){ // sync getter
	if (getters[name]) {
		return getters[name](opts,cb);
	} else {
		console.error("getter '"+name +"' not found");
	}
}
var hasGetter=function(name) {
	return (!!getters[name]);
}
var registerGetter=function(name,cb,opts){
	opts=opts||{};
	if (!cb && name) delete getters[name];
	else {
		if (getters[name] && !opts.overwrite) {
			console.error("getter name "+name+" overwrite.");
		}
		getters[name]=cb;
	} 
}
var unregisterGetter=function(name) {
	registerGetter(name);
}

var	listen=function(event,cb,element){
	listeners.push([element,event,cb]);
}
var unlistenAll=function(element){
	if (!element) {
		console.error("unlistenAll should specify this")
	}
	listeners=listeners.filter(function(listener){
		return (listener[0]!==element) ;
	});
}

module.exports={ action, listen, unlistenAll, getter, registerGetter, unregisterGetter, hasGetter};
},{}],"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\node\\readdirmeta.js":[function(require,module,exports){
/**
	read all ktx files and return meta json
*/
var fs=require("fs");
var readdirmeta=function(dataroot,path,cb){

	var files=fs.readdirSync(dataroot+path);
	if (!files) {
		cb("cannot readdir");
		return ;
	}

	try {
		var out=files.map(function(file){
			var fullname=dataroot+path+'/'+file;
			var stat=fs.statSync(fullname);
			var f=fs.openSync(fullname,"r");
			var buffer = new Buffer(16*1024); //header should less than 16K

			fs.readSync(f,buffer,0,16*1024,0);
			var s=buffer.toString("utf8");
			var idx=s.indexOf("\n");
			try {
				var firstline=s.substr(0,idx).trim();
				if (firstline[0]==="[") {
					firstline=firstline.substr(1); //for ktx
					var last=firstline[firstline.length-1];
					if (last!=="}") firstline=firstline.substr(0,firstline.length-1);
				}
				var meta=JSON.parse(firstline);
			} catch (e) {
				meta={title:file.substr(0,file.lastIndexOf("."))};
			}
			fs.closeSync(f);
			meta.filename=path+'/'+file;
			meta.stat=stat;
			return meta;
		});
	} catch(e) {
			console.log(e);
	}
	setTimeout(function(){
		cb(0,out);
	},10);//wait for nw 
}
module.exports=readdirmeta;
},{"fs":false}],"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\pdfviewer.js":[function(require,module,exports){
var React=require("react");
var ReactDOM=require("react-dom");
var PDF = require("./react-pdf");
var E=React.createElement;
var styles={
	container:{
		float:"left",overflow:"hidden", 
	}
}
var PDFViewer = React.createClass({
  render: function() {
  	if (this.props.rwidth) {
      styles.container.width=(window.innerWidth*(this.props.rwidth||0.5))+"px";
      styles.container.height=window.innerHeight;
    }
    
    if (this.props.rheight) {
      styles.container.height=(window.innerHeight*(this.props.rheight||0.5))+"px";
      styles.container.width=window.innerWidth;
    }

  	if (!this.props.pdffn) return E("div",{style:{width:"100%"}},"");
  	return E("div",{style:styles.container},
    	E(PDF,{file:this.props.pdffn, scale:this.props.scale||1.4, 
        marginLeft:this.props.left,marginTop:this.props.top,
    	page:parseInt(this.props.page)})
    	);
  },
  _onPdfCompleted: function(page, pages){
    //this.setState({page: page, pages: pages});
  }
});
module.exports=PDFViewer;
},{"./react-pdf":"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\react-pdf.js","react":"react","react-dom":"react-dom"}],"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\react-pdf.js":[function(require,module,exports){
/*
from https://github.com/nnarhinen/react-pdf/blob/master/index.js
adding big canvas scroll inside div 
http://stackoverflow.com/questions/16128604/scrollable-canvas-inside-div

*/
var React = require('react');
var ReactDOM = require('react-dom');

var Pdf = React.createClass({
  displayName: 'React-PDF',
  propTypes: {
    file: React.PropTypes.string,
    content: React.PropTypes.string,
    page: React.PropTypes.number,
    scale: React.PropTypes.number,
    onDocumentComplete: React.PropTypes.func,
    onPageComplete: React.PropTypes.func
  },
  getInitialState: function() {
    this.marginLeft=this.props.marginLeft||0;
    this.marginTop=this.props.marginTop||0;
    return { scale:this.props.scale};
  },
  getDefaultProps: function() {
    return {page: 1, scale: 1.0};
  },
  componentDidMount: function() {
    this._loadPDFDocument(this.props);
  },
  _loadByteArray: function(byteArray) {
    PDFJS.getDocument(byteArray).then(this._onDocumentComplete);
  },
  _loadPDFDocument: function(props) {
    if(!!props.file){
      if (typeof props.file === 'string') return PDFJS.getDocument(props.file).then(this._onDocumentComplete);
      // Is a File object
      var reader = new FileReader(), self = this;
      reader.onloadend = function() {
        self._loadByteArray(new Uint8Array(reader.result));
      };
      reader.readAsArrayBuffer(props.file);
    }
    else if(!!props.content){
      var bytes = window.atob(props.content);
      var byteLength = bytes.length;
      var byteArray = new Uint8Array(new ArrayBuffer(byteLength));
      for(index = 0; index < byteLength; index++) {
        byteArray[index] = bytes.charCodeAt(index);
      }
      this._loadByteArray(byteArray);
    }
    else {
      console.error('React_Pdf works with a file(URL) or (base64)content. At least one needs to be provided!');
    }
  },
  componentWillReceiveProps: function(newProps) {
    if ((newProps.file && newProps.file !== this.props.file) || (newProps.content && newProps.content !== this.props.content)) {
      this._loadPDFDocument(newProps);
    }
    if (!!this.state.pdf && !!newProps.page && newProps.page !== this.props.page) {
      this.setState({page: null});
      this.state.pdf.getPage(newProps.page).then(this._onPageComplete);
    }
    if (newProps.marginLeft!==this.marginLeft || newProps.marginTop!==this.marginTop) {
      this.marginLeft=newProps.marginLeft||0;
      this.marginTop=newProps.marginTop||0;
      this.forceUpdate();
    }
  },
  render: function() {
    var self = this;

    if (!!this.state.page){
      setTimeout(function() {
        if(self.isMounted()){
          var canvas = ReactDOM.findDOMNode(self.refs.pdfCanvas),
            context = canvas.getContext('2d'),
            scale = self.state.scale,
            viewport = self.state.page.getViewport(scale);
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          canvas.style.marginLeft = self.marginLeft+ "px";
          canvas.style.marginTop = self.marginTop + "px";

          var renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          self.state.page.render(renderContext);
        }
      });
      return (React.createElement("canvas", {
        onMouseDown:this.onMouseDown,
        onMouseMove:this.onMouseMove,
        onMouseUp:this.onMouseUp,
        onWheel:this.onWheel,
        ref: "pdfCanvas"}));
    }
    return (this.props.loading || React.createElement("div", null, "Loading pdf...."));
  },
  lastX:0,
  lastY:0,
  toscale:0,
  marginLeft:0,
  marginTop:0,
  rescale:function(){
    //todo , ajdust margin left right when rescale
    var s=this.toscale/10;
    var scale=this.state.scale+s;
    if (scale<0.5 )scale=0.5;
    if (scale>3) scale=3;

    this.marginLeft+=(s*this.marginLeft);
    this.marginTop+=(s*this.marginTop);
    this.toscale=0;
    this.setState({scale});
  }
  ,onWheel:function(e){
    var m=-(e.deltaY/200);
    this.toscale+=m;
    clearTimeout(this.scaletimer);
    this.scaletimer=setTimeout(function(){
      this.rescale();
    }.bind(this),300);
  },
  onMouseMove:function(e){
    if (this.dragging) {
        var canvas = ReactDOM.findDOMNode(this.refs.pdfCanvas);
        var xdelta = e.clientX - this.lastX;
        var ydelta = e.clientY - this.lastY;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.marginLeft += xdelta;
        this.marginTop += ydelta;
        canvas.style.marginLeft = this.marginLeft + "px";
        canvas.style.marginTop = this.marginTop + "px";
    }
    e.preventDefault();
  },
  onMouseDown:function(e){
    this.dragging = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    e.preventDefault();
  }, 
  onMouseUp:function(){
     this.dragging = false;
  },
  _onDocumentComplete: function(pdf){
    if (!this.isMounted()) return;
    this.setState({ pdf: pdf });
    if(!!this.props.onDocumentComplete && typeof this.props.onDocumentComplete === 'function'){
      this.props.onDocumentComplete(pdf.numPages);
    }
    pdf.getPage(this.props.page).then(this._onPageComplete);
  },
  _onPageComplete: function(page){
    if (!this.isMounted()) return;
    this.setState({ page: page });
    if(!!this.props.onPageComplete && typeof this.props.onPageComplete === 'function'){
      this.props.onPageComplete(page.pageIndex + 1);
    }
  }
});

module.exports = Pdf;

},{"react":"react","react-dom":"react-dom"}],"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\rpc\\rpc.js":[function(require,module,exports){
/*
	this is for browser, a simple wrapper for socket.io rpc
	
	for each call to server, create a unique id
	when server return, get the slot by unique id, and invoke callbacks.
*/
(function(){

if (typeof io=="undefined") {
	module.exports=window.host={exec:function(){console.log("NO RPC")}}; 
	return;
}
function GUID () {
  var S4 = function ()    {    return Math.floor(        Math.random() * 0x10000  ).toString(16);  };
  return (   S4() + S4() + "-" + S4() + "-" +  S4() + "-" + S4() + "-" +S4() + S4() + S4()    );
}

var RPCs={}; //*  key: unique calling id  */

var socket = io.connect(window.location.host);

var returnfromserver=function(res) {
	var slot=RPCs[res.fid];
	
	if (!slot) {
		throw "invalid fid "+res.fid;
		return;
	}
	
	if (res.success) {
		if (slot.successCB)  slot.successCB(res.err,res.response);
	} else {
		if (slot.errorCB)  slot.errorCB(res.err,res.response);
	}
	delete RPCs[res.fid]; //drop the slot
}

var pchost={
	rpchost:true
	,exec: function(successCB, errorCB, service, action, params) {
		var fid=GUID();
		//create a slot to hold
		var slot={  fid:fid, successCB:successCB, errorCB:errorCB ,params:params, action:action, service:service};
		RPCs[fid]=slot;
		socket.emit('rpc',  { service: service, action:action, params: params , fid:fid });
	}
}

socket.on( 'rpc', returnfromserver );	 
window.host=pchost;
module.exports=pchost;

})();
},{}],"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\rpc\\rpc_fs.js":[function(require,module,exports){
var host=require("./rpc");

var makeinf=function(name) {
	return (
		function(opts,callback) {
			host.exec(callback,0,"fs",name,opts);
		});
}

var API={};
//TODO , create a cache object on client side to save network trafic on
//same getRaw
API.readFile=makeinf("readFile");
API.writeFile=makeinf("writeFile");
API.exists=makeinf("exists");
API.unlink=makeinf("unlink");
API.mkdir=makeinf("mkdir");
API.readdir=makeinf("readdir");


//API.closeAll=makeinf("closeAll");
//exports.version='0.0.13'; //this is a quick hack


module.exports=API;
},{"./rpc":"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\rpc\\rpc.js"}],"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\rpc\\rpc_util.js":[function(require,module,exports){
var host=require("./rpc");

var makeinf=function(name) {
	return (
		function(opts,callback) {
			host.exec(callback,0,"util",name,opts);
		});
}

var API={};
//TODO , create a cache object on client side to save network trafic on
//same getRaw
API.readdirmeta=makeinf("readdirmeta");

host.exec(function(err,data){
	//console.log('version',err,data)
	exports.version=data;
},0,"util","version",{});


module.exports=API;
},{"./rpc":"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\rpc\\rpc.js"}],"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\rule.js":[function(require,module,exports){
var {store,action,getter,hasGetter,registerGetter,unregisterGetter}=require("./model");

var rule={
	setRule:function(_rule){
		this.rule=_rule;
		if (_rule.init) _rule.init();
		unregisterGetter("automark");
		registerGetter("automark",_rule.automark);
	}
};
module.exports=rule;
},{"./model":"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\model.js"}],"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\socketfs.js":[function(require,module,exports){
var fs=(typeof process!=="undefined")?require("fs"):{}; // webpack.config.js node:{    fs:"empty" }
if (typeof fs.readFile=="undefined") {
	var rpcfs=require("./rpc/rpc_fs");	
	var rpcutil=require("./rpc/rpc_util");	
}
var dataroot="";
var setDataroot=function(_dataroot){
	dataroot=_dataroot;
}
var ready=function() {
	if (fs.readFile) return true;
	if (window.host.rpchost) return true;
	return false;
}
var readFile=function(fn,opts,cb) {

	if (fs.readFile) {
		if (typeof opts==="function") {
			cb=opts;
			opts="utf8";
		}
		fs.readFile("../"+dataroot+fn,opts,cb);
	} else {
		if (typeof opts==="function") {
			cb=opts;
			opts=null;
		}
		rpcfs.readFile({filename:dataroot+fn,opts:opts},cb);
	}
}
var writeFile=function(fn,data,opts,cb) {
	if (fs.writeFile) {
		if (typeof opts==="function") {
			cb=opts;
			opts="utf8";
		}
		fs.writeFile("../"+dataroot+fn,data,opts,cb);
	} else {
		if (typeof opts==="function") {
			cb=opts;
			opts=null;
		}
		rpcfs.writeFile({filename:dataroot+fn,opts:opts,data:data},cb);
	}
}
var exists=function(fn,cb){
	if (fs.exists) fs.exists(dataroot+fn,cb);
	else {
		rpcfs.exists({filename:dataroot+fn},cb);
	}
}

var unlink=function(fn,cb){
	if (fs.unlink) fs.unlink(dataroot+fn,cb);
	else {
		rpcfs.unlink({filename:dataroot+fn},cb);
	}
}
var mkdir=function(path,mode,cb) {
	if (fs.mkdir) fs.mkdir(dataroot+path,cb);
	else {
		if (typeof mode==="function") {
			cb=mode;
			mode=null;
		}
		rpcfs.mkdir({path:dataroot+path,mode:mode},cb);
	}
}
var readdir=function(path,cb) {
	if (fs.readdir) fs.readdir(dataroot+path,cb);
	else {
		rpcfs.readdir({path:dataroot+path},cb);
	}
}

var readdirmeta=function(path,cb) {//read all meta in given path
	if (fs.readdir) {
		require("./node/readdirmeta")(dataroot,path,cb);
	} else {
		rpcutil.readdirmeta({dataroot:dataroot,path:path},cb);
	}

}
module.exports={readFile:readFile,writeFile:writeFile,exists:exists,setDataroot,
	unlink:unlink,mkdir:mkdir,readdir:readdir,readdirmeta:readdirmeta,ready:ready};
},{"./node/readdirmeta":"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\node\\readdirmeta.js","./rpc/rpc_fs":"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\rpc\\rpc_fs.js","./rpc/rpc_util":"C:\\ksana2015\\node_modules\\ksana2015-proofreader\\rpc\\rpc_util.js","fs":false}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\downloader.js":[function(require,module,exports){

var userCancel=false;
var files=[];
var totalDownloadByte=0;
var targetPath="";
var tempPath="";
var nfile=0;
var baseurl="";
var result="";
var downloading=false;
var startDownload=function(dbid,_baseurl,_files) { //return download id
	var fs     = require("fs");
	var path   = require("path");

	
	files=_files.split("\uffff");
	if (downloading) return false; //only one session
	userCancel=false;
	totalDownloadByte=0;
	nextFile();
	downloading=true;
	baseurl=_baseurl;
	if (baseurl[baseurl.length-1]!='/')baseurl+='/';
	targetPath=ksanagap.rootPath+dbid+'/';
	tempPath=ksanagap.rootPath+".tmp/";
	result="";
	return true;
}

var nextFile=function() {
	setTimeout(function(){
		if (nfile==files.length) {
			nfile++;
			endDownload();
		} else {
			downloadFile(nfile++);	
		}
	},100);
}

var downloadFile=function(nfile) {
	var url=baseurl+files[nfile];
	var tmpfilename=tempPath+files[nfile];
	var mkdirp = require("./mkdirp");
	var fs     = require("fs");
	var http   = require("http");

	mkdirp.sync(path.dirname(tmpfilename));
	var writeStream = fs.createWriteStream(tmpfilename);
	var datalength=0;
	var request = http.get(url, function(response) {
		response.on('data',function(chunk){
			writeStream.write(chunk);
			totalDownloadByte+=chunk.length;
			if (userCancel) {
				writeStream.end();
				setTimeout(function(){nextFile();},100);
			}
		});
		response.on("end",function() {
			writeStream.end();
			setTimeout(function(){nextFile();},100);
		});
	});
}

var cancelDownload=function() {
	userCancel=true;
	endDownload();
}
var verify=function() {
	return true;
}
var endDownload=function() {
	nfile=files.length+1;//stop
	result="cancelled";
	downloading=false;
	if (userCancel) return;
	var fs     = require("fs");
	var mkdirp = require("./mkdirp");

	for (var i=0;i<files.length;i++) {
		var targetfilename=targetPath+files[i];
		var tmpfilename   =tempPath+files[i];
		mkdirp.sync(path.dirname(targetfilename));
		fs.renameSync(tmpfilename,targetfilename);
	}
	if (verify()) {
		result="success";
	} else {
		result="error";
	}
}

var downloadedByte=function() {
	return totalDownloadByte;
}
var doneDownload=function() {
	if (nfile>files.length) return result;
	else return "";
}
var downloadingFile=function() {
	return nfile-1;
}

var downloader={startDownload:startDownload, downloadedByte:downloadedByte,
	downloadingFile:downloadingFile, cancelDownload:cancelDownload,doneDownload:doneDownload};
module.exports=downloader;
},{"./mkdirp":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\mkdirp.js","fs":false,"http":false,"path":false}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\html5fs.js":[function(require,module,exports){
/* emulate filesystem on html5 browser */
var get_head=function(url,field,cb){
	var xhr = new XMLHttpRequest();
	xhr.open("HEAD", url, true);
	xhr.onreadystatechange = function() {
			if (this.readyState == this.DONE) {
				cb(xhr.getResponseHeader(field));
			} else {
				if (this.status!==200&&this.status!==206) {
					cb("");
				}
			}
	};
	xhr.send();
}
var get_date=function(url,cb) {
	get_head(url,"Last-Modified",function(value){
		cb(value);
	});
}
var get_size=function(url, cb) {
	get_head(url,"Content-Length",function(value){
		cb(parseInt(value));
	});
};
var checkUpdate=function(url,fn,cb) {
	if (!url) {
		cb(false);
		return;
	}
	get_date(url,function(d){
		API.fs.root.getFile(fn, {create: false, exclusive: false}, function(fileEntry) {
			fileEntry.getMetadata(function(metadata){
				var localDate=Date.parse(metadata.modificationTime);
				var urlDate=Date.parse(d);
				cb(urlDate>localDate);
			});
		},function(){
			cb(false);
		});
	});
}
var download=function(url,fn,cb,statuscb,context) {
	 var totalsize=0,batches=null,written=0;
	 var fileEntry=0, fileWriter=0;
	 var createBatches=function(size) {
		var bytes=1024*1024, out=[];
		var b=Math.floor(size / bytes);
		var last=size %bytes;
		for (var i=0;i<=b;i++) {
			out.push(i*bytes);
		}
		out.push(b*bytes+last);
		return out;
	 }
	 var finish=function() {
		 rm(fn,function(){
				fileEntry.moveTo(fileEntry.filesystem.root, fn,function(){
					setTimeout( cb.bind(context,false) , 0) ;
				},function(e){
					console.log("failed",e)
				});
		 },this);
	 };
		var tempfn="temp.kdb";
		var batch=function(b) {
		var abort=false;
		var xhr = new XMLHttpRequest();
		var requesturl=url+"?"+Math.random();
		xhr.open('get', requesturl, true);
		xhr.setRequestHeader('Range', 'bytes='+batches[b]+'-'+(batches[b+1]-1));
		xhr.responseType = 'blob';
		xhr.addEventListener('load', function() {
			var blob=this.response;
			fileEntry.createWriter(function(fileWriter) {
				fileWriter.seek(fileWriter.length);
				fileWriter.write(blob);
				written+=blob.size;
				fileWriter.onwriteend = function(e) {
					if (statuscb) {
						abort=statuscb.apply(context,[ fileWriter.length / totalsize,totalsize ]);
						if (abort) setTimeout( cb.bind(context,false) , 0) ;
				 	}
					b++;
					if (!abort) {
						if (b<batches.length-1) setTimeout(batch.bind(context,b),0);
						else                    finish();
				 	}
			 	};
			}, console.error);
		},false);
		xhr.send();
	}

	get_size(url,function(size){
		totalsize=size;
		if (!size) {
			if (cb) cb.apply(context,[false]);
		} else {//ready to download
			rm(tempfn,function(){
				 batches=createBatches(size);
				 if (statuscb) statuscb.apply(context,[ 0, totalsize ]);
				 API.fs.root.getFile(tempfn, {create: 1, exclusive: false}, function(_fileEntry) {
							fileEntry=_fileEntry;
						batch(0);
				 });
			},this);
		}
	});
}

var readFile=function(filename,cb,context) {
	API.fs.root.getFile(filename, {create: false, exclusive: false},function(fileEntry) {
		fileEntry.file(function(file){
			var reader = new FileReader();
			reader.onloadend = function(e) {
				if (cb) cb.call(cb,this.result);
			};
			reader.readAsText(file,"utf8");
		});
	}, console.error);
}

function createDir(rootDirEntry, folders,  cb) {
  // Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
  if (folders[0] == '.' || folders[0] == '') {
    folders = folders.slice(1);
  }
  rootDirEntry.getDirectory(folders[0], {create: true}, function(dirEntry) {
    // Recursively add the new subfolder (if we still have another to create).
    if (folders.length) {
      createDir(dirEntry, folders.slice(1),cb);
    } else {
			cb();
		}
  }, cb);
};


var writeFile=function(filename,buf,cb,context){
	var write=function(fileEntry){
		fileEntry.createWriter(function(fileWriter) {
			fileWriter.write(buf);
			fileWriter.onwriteend = function(e) {
				if (cb) cb.apply(cb,[buf.byteLength]);
			};
		}, console.error);
	}

	var getFile=function(filename){
		API.fs.root.getFile(filename, {exclusive:true}, function(fileEntry) {
			write(fileEntry);
		}, function(){
				API.fs.root.getFile(filename, {create:true,exclusive:true}, function(fileEntry) {
					write(fileEntry);
				});

		});
	}
	var slash=filename.lastIndexOf("/");
	if (slash>-1) {
		createDir(API.fs.root, filename.substr(0,slash).split("/"),function(){
			getFile(filename);
		});
	} else {
		getFile(filename);
	}
}

var readdir=function(cb,context) {
	var dirReader = API.fs.root.createReader();
	var out=[],that=this;
	dirReader.readEntries(function(entries) {
		if (entries.length) {
			for (var i = 0, entry; entry = entries[i]; ++i) {
				if (entry.isFile) {
					out.push([entry.name,entry.toURL ? entry.toURL() : entry.toURI()]);
				}
			}
		}
		API.files=out;
		if (cb) cb.apply(context,[out]);
	}, function(){
		if (cb) cb.apply(context,[null]);
	});
}
var getFileURL=function(filename) {
	if (!API.files ) return null;
	var file= API.files.filter(function(f){return f[0]==filename});
	if (file.length) return file[0][1];
}
var rm=function(filename,cb,context) {
	var url=getFileURL(filename);
	if (url) rmURL(url,cb,context);
	else if (cb) cb.apply(context,[false]);
}

var rmURL=function(filename,cb,context) {
	webkitResolveLocalFileSystemURL(filename, function(fileEntry) {
		fileEntry.remove(function() {
			if (cb) cb.apply(context,[true]);
		}, console.error);
	},  function(e){
		if (cb) cb.apply(context,[false]);//no such file
	});
}
function errorHandler(e) {
	console.error('Error: ' +e.name+ " "+e.message);
}
var initfs=function(grantedBytes,cb,context) {
	webkitRequestFileSystem(PERSISTENT, grantedBytes,  function(fs) {
		API.fs=fs;
		API.quota=grantedBytes;
		readdir(function(){
			API.initialized=true;
			cb.apply(context,[grantedBytes,fs]);
		},context);
	}, errorHandler);
}
var init=function(quota,cb,context) {
	navigator.webkitPersistentStorage.requestQuota(quota,
			function(grantedBytes) {
				initfs(grantedBytes,cb,context);
		}, errorHandler
	);
}
var queryQuota=function(cb,context) {
	var that=this;
	navigator.webkitPersistentStorage.queryUsageAndQuota(
	 function(usage,quota){
			initfs(quota,function(){
				cb.apply(context,[usage,quota]);
			},context);
	});
}
var API={
	init:init
	,readdir:readdir
	,checkUpdate:checkUpdate
	,rm:rm
	,rmURL:rmURL
	,getFileURL:getFileURL
	,writeFile:writeFile
	,readFile:readFile
	,download:download
	,get_head:get_head
	,get_date:get_date
	,get_size:get_size
	,getDownloadSize:get_size
	,queryQuota:queryQuota
}
module.exports=API;

},{}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\ksanagap.js":[function(require,module,exports){
var appname="installer";
if (typeof ksana=="undefined") {
	window.ksana={platform:"chrome"};
	if (typeof process!=="undefined" && 
		process.versions && process.versions["node-webkit"]) {
		window.ksana.platform="node-webkit";
	}
}
var switchApp=function(path) {
	var fs=require("fs");
	path="../"+path;
	appname=path;
	document.location.href= path+"/index.html"; 
	process.chdir(path);
}
var downloader={};
var rootPath="";

var deleteApp=function(app) {
	console.error("not allow on PC, do it in File Explorer/ Finder");
}
var username=function() {
	return "";
}
var useremail=function() {
	return ""
}
var runtime_version=function() {
	return "1.4";
}

//copy from liveupdate
var jsonp=function(url,dbid,callback,context) {
  var script=document.getElementById("jsonp2");
  if (script) {
    script.parentNode.removeChild(script);
  }
  window.jsonp_handler=function(data) {
    if (typeof data=="object") {
      data.dbid=dbid;
      callback.apply(context,[data]);    
    }  
  }
  window.jsonp_error_handler=function() {
    console.error("url unreachable",url);
    callback.apply(context,[null]);
  }
  script=document.createElement('script');
  script.setAttribute('id', "jsonp2");
  script.setAttribute('onerror', "jsonp_error_handler()");
  url=url+'?'+(new Date().getTime());
  script.setAttribute('src', url);
  document.getElementsByTagName('head')[0].appendChild(script); 
}


var loadKsanajs=function(){

	if (typeof process!="undefined" && !process.browser) {
		var ksanajs=require("fs").readFileSync("./ksana.js","utf8").trim();
		downloader=require("./downloader");
		ksana.js=JSON.parse(ksanajs.substring(14,ksanajs.length-1));
		rootPath=process.cwd();
		rootPath=require("path").resolve(rootPath,"..").replace(/\\/g,"/")+'/';
		ksana.ready=true;
	} else{
		var url=window.location.origin+window.location.pathname.replace("index.html","")+"ksana.js";
		jsonp(url,appname,function(data){
			ksana.js=data;
			ksana.ready=true;
		});
	}
}

loadKsanajs();

var boot=function(appId,cb) {
	if (typeof appId=="function") {
		cb=appId;
		appId="unknownapp";
	}
	if (!ksana.js && ksana.platform=="node-webkit") {
		loadKsanajs();
	}
	ksana.appId=appId;
	if (ksana.ready) {
		cb();
		return;
	}
	var timer=setInterval(function(){
			if (ksana.ready){
				clearInterval(timer);
				cb();
			}
		},100);
}


var ksanagap={
	platform:"node-webkit",
	startDownload:downloader.startDownload,
	downloadedByte:downloader.downloadedByte,
	downloadingFile:downloader.downloadingFile,
	cancelDownload:downloader.cancelDownload,
	doneDownload:downloader.doneDownload,
	switchApp:switchApp,
	rootPath:rootPath,
	deleteApp: deleteApp,
	username:username, //not support on PC
	useremail:username,
	runtime_version:runtime_version,
	boot:boot
}
module.exports=ksanagap;
},{"./downloader":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\downloader.js","fs":false,"path":false}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\livereload.js":[function(require,module,exports){
var started=false;
var timer=null;
var bundledate=null;
var get_date=require("./html5fs").get_date;
var checkIfBundleUpdated=function() {
	get_date("bundle.js",function(date){
		if (bundledate &&bundledate!=date){
			location.reload();
		}
		bundledate=date;
	});
}
var livereload=function() {
	if(window.location.origin.indexOf("//127.0.0.1")===-1) return;

	if (started) return;

	timer1=setInterval(function(){
		checkIfBundleUpdated();
	},2000);
	started=true;
}

module.exports=livereload;
},{"./html5fs":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\html5fs.js"}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\mkdirp.js":[function(require,module,exports){
function mkdirP (p, mode, f, made) {
     var path = nodeRequire('path');
     var fs = nodeRequire('fs');
	
    if (typeof mode === 'function' || mode === undefined) {
        f = mode;
        mode = 0x1FF & (~process.umask());
    }
    if (!made) made = null;

    var cb = f || function () {};
    if (typeof mode === 'string') mode = parseInt(mode, 8);
    p = path.resolve(p);

    fs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                mkdirP(path.dirname(p), mode, function (er, made) {
                    if (er) cb(er, made);
                    else mkdirP(p, mode, cb, made);
                });
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                fs.stat(p, function (er2, stat) {
                    // if the stat fails, then that's super weird.
                    // let the original error be the failure reason.
                    if (er2 || !stat.isDirectory()) cb(er, made)
                    else cb(null, made);
                });
                break;
        }
    });
}

mkdirP.sync = function sync (p, mode, made) {
    var path = nodeRequire('path');
    var fs = nodeRequire('fs');
    if (mode === undefined) {
        mode = 0x1FF & (~process.umask());
    }
    if (!made) made = null;

    if (typeof mode === 'string') mode = parseInt(mode, 8);
    p = path.resolve(p);

    try {
        fs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = sync(path.dirname(p), mode, made);
                sync(p, mode, made);
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                var stat;
                try {
                    stat = fs.statSync(p);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }

    return made;
};

module.exports = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;

},{}]},{},["C:\\ksana2015\\j13zs-proofreader\\index.js"])
//# sourceMappingURL=bundle.js.map
