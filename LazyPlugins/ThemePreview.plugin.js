//META{"name":"ThemePreview","source":"https://github.com/Modder4869/LazyStuff/blob/master/LazyPlugins/ThemePreview.plugin.js","website":"https://www.github.com/Modder4869"}*//

class ThemePreview{
	getName(){
		return 'ThemePreview';
	}
	getDescription(){
		return 'Preview themes posted in #Theme-repo, and direct links that ends with CSS including directly uploaded files or [https://betterdiscord.net/ghdl?id=] link using context menu.';
	}
	getVersion(){
		return '0.0.5';
	}
	getAuthor(){
		return 'Modder#4869';
	}
    load(){
		let libraryScript=document.getElementById('ZLibraryScript');
		if(!window.ZLibrary&&!libraryScript){
			libraryScript=document.createElement('script');
			libraryScript.setAttribute('type','text/javascript');
			libraryScript.addEventListener("error",function(){if(typeof window.ZLibrary==="undefined"){window.BdApi.alert("Library Missing",`The library plugin needed for ${this.getName()} is missing and could not be loaded.<br /><br /><a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);}}.bind(this));
			libraryScript.setAttribute('src','https://rauenzi.github.io/BDPluginLibrary/release/ZLibrary.js');
			libraryScript.setAttribute('id','ZLibraryScript');
			document.head.appendChild(libraryScript);
		}
    }
	constructor(){
		this.initialized=false;
		this.contextMenu={
			closeContextMenu:BdApi.findModuleByProps('closeContextMenu','openContextMenu').closeContextMenu,
			getContextMenu:BdApi.findModuleByProps('getContextMenu').getContextMenu,
		};
		this.CSSCode={
        	previewSheet:``,
			regex:new RegExp('([#\.][a-z0-9]*?\.?.*?)\s?\{([^\{\}]*)\}','mgi'),
			milliseconds:{ //For easy modification for the settings panel.
				min:1000,
				max:10000,
			}
		};
		this.themePreview={
			request:require('request'),
			previewSheet:``,
			themeCSS:``,
			themeUrl:``,
			milliseconds:{ //For easy modification for the settings panel.
				min:1000,
				max:10000,
			},
		};
	}
	get default(){ //When regenerating settings, the settings panel likes to change the default settings for some reason. This is the fix.
		return{
			themePreview:{
				delay:false,
				ms:3000,
				showBodyLog:false,
			},
            CSSCode:{
				delay:false,
				ms:3000,
			},
        }
	}
	start() {
		this.AppendStyleElements();
        let libraryScript=document.getElementById('ZLibraryScript');
		if(typeof window.ZLibrary==="object")this.initialize();
		else libraryScript.addEventListener('load',()=>this.initialize());
	}
	AppendStyleElements(){
		this.CSSCode.previewSheet=document.getElementById('CSSCode');
        if(!this.CSSCode.previewSheet){
            this.CSSCode.previewSheet=document.createElement('style');
            this.CSSCode.previewSheet.setAttribute('id','CSSCode');
            document.body.appendChild(this.CSSCode.previewSheet);
		}
		this.themePreview.previewSheet=document.getElementById('themePreview');
        if(!this.themePreview.previewSheet){
            this.themePreview.previewSheet=document.createElement('style');
            this.themePreview.previewSheet.setAttribute('id','themePreview');
            document.body.appendChild(this.themePreview.previewSheet);
        }
	}
    initialize(){
        window.ZLibrary.PluginUpdater.checkForUpdate(this.getName(),this.getVersion(),this.getLink());
        this.loadSettings();
        this.addListeners();
        this.initialized=true;
    }
	stop(){
		if(document.contains(this.CSSCode.previewSheet))this.CSSCode.previewSheet.remove();
		if(document.contains(this.themePreview.previewSheet))this.themePreview.previewSheet.remove();
        this.removeListeners();
        this.initialized=false;
	}
	getSettingsPanel(){
        const panel=$('<form>').addClass('form').css('width','100%');
        if(this.initialized)this.generateSettings(panel);
        return panel[0];
	}
	loadSettings(){
        this.settings=window.ZLibrary.PluginUtilities.loadSettings(this.getName(),this.default);
    }
    saveSettings(){
        window.ZLibrary.PluginUtilities.saveSettings(this.getName(),this.settings);
	}
	getLink(){
		return `https://raw.githubusercontent.com/Modder4869/LazyStuff/master/LazyPlugins/${this.getName()}.plugin.js`;
	}
	addListeners(){
		$(document).on(`keydown.${this.getName()}`,(e)=>{
			if(e.altKey){
				if(e.which===82)this.clearCSSPreview();
				else if(e.which===84)this.clearThemePreview();
			}
		});
		$(document).on(`contextmenu.${this.getName()}`,this.addContextMenuItems.bind(this));
	 }
	 addContextMenuItems(e){
		if(!document.contains(this.CSSCode.previewSheet)||!document.contains(this.themePreview.previewSheet))this.AppendStyleElements();
		//context is the context menu element, this.contextMenu is the internal instance of the contextMenu and it seems to help with inconsistant contextMenu detection.
		const context=document.getElementsByClassName(window.ZLibrary.DiscordClasses.ContextMenu.contextMenu.value.split(' ')[0])[0],contextMenu=this.contextMenu,target=this.contextMenu.getContextMenu().target;
		let item,element=(target.className.includes(`hljs`)&&!target.classList.contains(`hljs`)&&target.closest(`code`)!==null)?target.closest(`code`):target;
		//CSSCodeBlock
		if(element.tagName==='CODE'&&element.className.toLowerCase().includes('css')&&this.CSSCode.regex.test(element.innerText)){
        	if(this.CSSCode.previewSheet.innerText.length===0){
				console.log(element.innerText.split('\n')[0].toLowerCase());
        		item=new window.ZLibrary.ContextMenu.TextItem('Preview CSS',{
        			callback:function(){
						if(context)contextMenu.closeContextMenu();
						this.CSSCode.previewSheet.innerHTML=this.checkForMeta(element.innerText);
						window.ZLibrary.Toasts.show('Loaded CSS Preview',{type:"success"});
						//Check for delay then set timeout for the delay.
						if(this.settings.CSSCode.delay)setTimeout(this.clearCSSPreview.bind(this),this.settings.CSSCode.ms);
					}.bind(this)
				});
			//Disable preview of CSSCodeBlock
			}else{
           		item=new window.ZLibrary.ContextMenu.TextItem('Disable Preview',{
            		callback:function(){
            			if(context)contextMenu.closeContextMenu();
						this.clearCSSPreview();
            		}.bind(this),
            		hint:'Alt+R'
				});
			}
		}
		//Theme Preview
		if(element.tagName==='A'&&(element.href.endsWith('.css')||element.href.includes('betterdiscord.net/ghdl?id'))){
			if(this.themePreview.previewSheet.innerText.length===0){
				item=new window.ZLibrary.ContextMenu.TextItem('Preview Theme',{
					callback:function(){
						if(context)contextMenu.closeContextMenu();
						this.themePreview.themeUrl=element.href;
						this.getThemeCSS();
						this.themePreview.previewSheet.innerHTML=this.themePreview.themeCSS;
						//Check for delay then set timeout for the delay.
						if(this.settings.themePreview.delay)setTimeout(this.clearThemePreview.bind(this),this.settings.themePreview.ms);
					}.bind(this)
				});
			//Disable preview of Theme Preview
			}else{
				item=new window.ZLibrary.ContextMenu.TextItem('Disable Preview',{
					callback:function(){
						if(context)contextMenu.closeContextMenu();
						this.clearThemePreview();
					}.bind(this),
					hint:'Alt+T'
				});
			}
		}
		if(item&&context)context.getElementsByClassName(window.ZLibrary.DiscordClasses.ContextMenu.itemGroup.value.split(' ')[0])[0].append(item.element);
	}
	getThemeCSS(){
		if(this.themePreview.themeUrl.includes('github.com'))this.themePreview.themeUrl=this.themePreview.themeUrl.replace('github.com','raw.githubusercontent.com').replace('/blob/','/');
		let url=this.themePreview.themeUrl;
		this.themePreview.request({url:url},(error,response,body)=>{
			this.themePreview.themeCSS=this.checkForMeta(body);

			//Log the full contents of the file if the setting is enabled.
			if(this.settings.themePreview.showBodyLog===true){console.log(body);}

			if(!error){
				window.ZLibrary.Toasts.show('Loaded Theme Preview',{type:"success"});
				this.themePreview.previewSheet.innerHTML=this.themePreview.themeCSS;
			}

			if(error){
				window.ZLibrary.Toasts.show(error,{type:"danger"});
				return;
			}
		});
	}
	checkForMeta(styles){
		if(styles&&styles.constructor===String){
			//grab the first line of the file for checking later, make it lowercase so it is effectively case insensitive.
			let firstLine=styles.split('\n')[0].toLowerCase();
			//If it has meta, then it's a theme file, so remove the first line containing the meta.
			if(firstLine.includes('meta{'))styles=styles.substring(styles.indexOf("\n")+1);//Should really replace this with a regex, but this works for now.
			//If it has no meta, then it's not a theme file, so don't remove the first line.
			return styles;
		}
		return null;
	}
	removeListeners(){
		$(document).off(`contextmenu.${this.getName()}`);
		$(document).off(`keydown.${this.getName()}`);
	}
	clearCSSPreview(){
		if(document.contains(this.CSSCode.previewSheet)&&this.CSSCode.previewSheet.innerText.length!==0){
			this.CSSCode.previewSheet.innerHTML='';
			window.ZLibrary.Toasts.show('Disabled Preview',{type:"success"});
		}
	}
	clearThemePreview(){
		if(document.contains(this.themePreview.previewSheet)&&this.themePreview.previewSheet.innerText.length!==0){
			this.themePreview.previewSheet.innerHTML='';
			this.themePreview.themeUrl='';
			this.themePreview.themeCSS='';
			window.ZLibrary.Toasts.show('Disabled Preview',{type:"success"});
		}
	}
	 generateSettings(panel){
		//CSSCode
        new window.ZLibrary.Settings.SettingGroup('Theme Preview Settings',{callback:()=>{this.saveSettings();this.removeListeners();this.addListeners();},collapsible:true,shown:true}).appendTo(panel).append(
			new window.ZLibrary.Settings.Switch('Theme Preview Reset','Automatically reset the Theme Preview after a delay.',this.settings.themePreview.delay,(i)=>{
				this.settings.themePreview.delay=i;
			}),
			new window.ZLibrary.Settings.Textbox('Theme Preview Reset Delay','How many milliseconds to wait before resetting the Theme Preview. 1000ms = 1 second, for a minimum of 1 second and a maximum of 10 seconds.',this.settings.themePreview.ms,(i)=>{
				let x=parseInt(i,10);
				//Restricts inputs to numbers and limits (min/max) the seconds the user can input.
				if (x!==NaN&&this.themePreview.milliseconds.min<=x&&x<=this.themePreview.milliseconds.max){this.settings.themePreview.ms=i;}
				//Allows the textbox to be empty and below the minimum amount without regenerating the panel, removing a bit of irritation.
				else if(i===''||x<this.themePreview.milliseconds.min){}
				//Regenerate the panel when on incorrect input, if you have got a better way go for it.
				else{this.regeneratePanel(panel);}
			}),
			new window.ZLibrary.Settings.Switch('Log Theme File In Console','Logs the theme file that is previewed in the developer tools console.',this.settings.themePreview.showBodyLog,(i)=>{
				this.settings.themePreview.showBodyLog=i;
			}),
		);
		new window.ZLibrary.Settings.SettingGroup('CodeBlock Preview Settings',{callback:()=>{this.saveSettings();this.removeListeners();this.addListeners();},collapsible:true,shown:false}).appendTo(panel).append(
			new window.ZLibrary.Settings.Switch('CSS Preview Reset','Automatically reset the CSS Preview after a delay.',this.settings.CSSCode.delay,(i)=>{
                this.settings.CSSCode.delay=i;
            }),
            new window.ZLibrary.Settings.Textbox('CSS Preview Reset Delay','How long to wait before resetting the CSS Preview in milliseconds.',this.settings.CSSCode.ms,(i)=>{
				let x=parseInt(i,10);
				//Restricts inputs to numbers and limits (min/max) the seconds the user can input.
				if(x!==NaN&&this.CSSCode.milliseconds.min<=x&&x<=this.CSSCode.milliseconds.max)this.settings.CSSCode.ms=i;
				//Allows the textbox to be empty and below the minimum amount without regenerating the panel, removing a bit of irritation.
				else if(i===''||x<this.CSSCode.milliseconds.min){}
				//Regenerate the panel when on incorrect input, if you have got a better way go for it.
				else this.regeneratePanel(panel);
            }),
		);
		//ProTip box.
		let ProTip='The previews are made seperate so that means you can try a theme or the styles in a codeblock and even at the same time. Previews have a hotkey for disabling them, to stop previewing a theme press Alt+T and to stop previewing a codeblock press Alt+R.';
		panel.append($('<div>',{class:`protip-12obwm inline-136HKr`,style:`float:left;width:80%;margin:10px 0;`})
			.append($('<div>',{text:'Protip: ',style:`text-transform:uppercase;`,class:`pro-1T8RK7 small-29zrCQ size12-3R0845 height16-2Lv3qA statusGreen-pvYWjA weightBold-2yjlgw`})
				.append($('<div>',{text:ProTip,style:`text-transform:none;`,class:`tip-2ab612 primary-jw0I4K`})
				)
			)
		);
		const resetButton=$('<button>',{type:'button',text:'Reset Settings',style:'margin:10px 0;float:right;',class:'button-38aScr lookOutlined-3sRXeN colorRed-1TFJan sizeMedium-1AC_Sl grow-q77ONN'})
		.click(function(){
			this.settings=this.default;
			this.saveSettings();
			this.regeneratePanel(panel);
		}.bind(this));
		panel.append(resetButton);
    }
	regeneratePanel(panel){
		if(panel!==undefined){
			panel.empty();
			this.generateSettings(panel);
		}
	}
}
