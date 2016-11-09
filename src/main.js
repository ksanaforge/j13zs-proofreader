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

const Maincomponent = React.createClass({
	getInitialState:function() {
	//	var m=new Magnifier();
		setRule(rule);
		return {data:"",pageid:rule.initpage,dirty:false,warningcount:0
		,pdffn:"",page:0,preview:null};
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
  ,getNextPage:function(){
    const p=this.state.pageid;
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
  ,getPrevPage:function(){
    const p=this.state.pageid;
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
  ,setPreviewPage:function(pageid){
    const preview=this.getPageText(pageid,this.state.data);
    var m=rule.getPDFPage(pageid,this.state.fn);
    this.updatepdfpage(pageid,m);
    this.setState({preview});
  }
  ,nextpage:function(){
    const pageid=this.getNextPage();
    if (this.state.preview) return this.setPreviewPage(pageid);
    this.prepareCM(this.getPageStartIndex(pageid));
  }
  ,prevpage:function(){
    const pageid=this.getPrevPage();
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
	,onCursorActivity:function(cm) {
		var pos=cm.getCursor();
		var pageid=rule.getPageByLine(pos.line);

		if (pos.line!==this.prevline) {
			if (this.prevline>-1) rule.markLine(this.prevline,true);
			if (this.state.pageid!==pageid) {
				var m=rule.getPDFPage(pageid,this.state.fn);
				if(m) this.updatepdfpage(pageid,m);
				else this.setState({pageid});
			}
		}
		var index=cm.indexFromPos(pos);
		var str=cm.getValue().substr(index-5,10);
		var footnote=rule.getFootnote(str,pageid);
		action("footnote",footnote);
		this.prevline=pos.line;
	}
	,onChange:function(){
		if (!this.state.dirty && this.doc.getValue()!==this.state.data) {//setcontent will trigger onchange
			this.setState({dirty:true});
		}

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
	      		onChange:this.onChange,
	      		onBeforeChange:this.onBeforeChange,
  	    		onCursorActivity:this.onCursorActivity});
		}
	}
  ,render: function() {
  	return E("div",{},E(Controls,{dirty:this.state.dirty,
  		preview:!!this.state.preview,
  		warnings:this.state.warningcount+" warnings"
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
