const React=require("react");

const E=React.createElement;
const PT=React.PropTypes;
const markupButtons=React.createClass({
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
var loadSaveButtons=React.createClass({
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

var Controls=React.createClass({
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
