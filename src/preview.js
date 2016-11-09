/* kangxi preview*/
const React=require("react");
const ReactDOM=require("react-dom");
const E=React.createElement;
const PT=React.PropTypes;

const Preview=React.createClass({
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
			t=t.replace(/[─「」，、．；《》：。〈〉\n]/g,"");
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
			cls.className="preview_big";
			out.push(E("span",cls,text));
		} else if (type==="br") {
			out.push(E("br"));
		} else if (type==="shu") {
			cls.className="preview_shu";
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