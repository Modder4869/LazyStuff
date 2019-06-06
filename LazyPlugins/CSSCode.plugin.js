//META{"name":"CSSCode"}*//
class CSSCode{
    getName(){
        return 'CSSCode';
    }
    getShortName(){
        return 'CSSCode';
    }
    getDescription(){
        return 'Preview CSS inside codeblock using context menu';
    }
    getVersion(){
        return '0.0.5';
    }
    getAuthor(){
        return 'Modder4869';
    }
    getLink(){
        return `https://raw.githubusercontent.com/Modder4869/LazyStuff/master/LazyPlugins/${this.getName()}.plugin.js`;
    }
    constructor(){
        this.initialized=false;
        this.previewSheet;
		this.re;
		this.milliseconds={ //For easy modifiction for the settings panel.
			min:1000,
			max:10000,
		}
	}
	get default(){ //When regenerating settings, the settings panel likes to change the default settings for some reason. This is the fix.
		return{
            delay:false,
            ms:3000,
        }
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
    start(){
        this.previewSheet=document.getElementById('CSSCode');
        if(!this.previewSheet){
            this.previewSheet=document.createElement('style');
            this.previewSheet.setAttribute('id','CSSCode');
            document.body.appendChild(this.previewSheet);
        }
        let libraryScript=document.getElementById('ZLibraryScript');
		if(typeof window.ZLibrary==="object")this.initialize();
		else libraryScript.addEventListener('load',()=>this.initialize());
    }
    initialize(){
        window.ZLibrary.PluginUpdater.checkForUpdate(this.getName(),this.getVersion(),this.getLink());
        this.loadSettings();
        this.addListeners();
        this.initialized=true;
    }
    addListeners(){
       this.re=new RegExp('([#\.][a-z0-9]*?\.?.*?)\s?\{([^\{\}]*)\}','mgi');
        $(document).on(`keydown.${this.getName()}`,(e)=>{
            if(e.altKey&&e.which===82)this.clearCSS();
        });
        $(document).on(`contextmenu.${this.getName()}`,(e)=>{
            if(e.toElement.tagName==='CODE'&&e.toElement.className.toLowerCase().includes('css')||this.re.test(e.toElement.innerText))this.addContextMenuItems(e);
        });
    }
    removeListeners(){
        $(document).off(`contextmenu.${this.getName()}`);
        $(document).off(`keydown.${this.getName()}`);
    }
    clearCSS(){
        if (!document.contains(this.previewSheet))return;
        this.previewSheet.innerHTML='';
    }
    addContextMenuItems(e){
        if (!document.contains(this.previewSheet))return;
        const context=document.querySelector(`.${window.ZLibrary.DiscordClasses.ContextMenu.contextMenu.value.split(' ')[0]}`);
        let item;
        if (this.previewSheet.innerText.length===0) {
            item=new window.ZLibrary.ContextMenu.TextItem('Preview CSS',{
                callback:()=>{
                    if(context)$(context).hide();
					this.previewSheet.innerHTML=e.toElement.innerText;
					//Check for delay then set timeout for the delay.
                    if(this.settings.delay)setTimeout(()=>(this.previewSheet.innerHTML=''),this.settings.ms);
                }
            });
        }else{
            item=new window.ZLibrary.ContextMenu.TextItem('Disable CSS Preview',{
                callback:()=>{
                    if(context)$(context).hide();
                    this.clearCSS();
                },
                hint:'Alt+R'
            });
        }
        $(context).find('.itemGroup-1tL0uz').first().append(item.element);
	}
	loadSettings(){
        this.settings=window.ZLibrary.PluginUtilities.loadSettings(this.getName(),this.default);
    }
    saveSettings(){
        window.ZLibrary.PluginUtilities.saveSettings(this.getName(),this.settings);
	}
	getSettingsPanel(){
        const panel=$('<form>').addClass('form').css('width','100%');
        if(this.initialized)this.generateSettings(panel);
        return panel[0];
    }
	regeneratePanel(panel){
		if(panel!==undefined){
			panel.empty();
			this.generateSettings(panel);
		}
	}
    generateSettings(panel){
        new window.ZLibrary.Settings.SettingGroup('Preview Settings',{callback:()=>{this.saveSettings();},collapsible:false,shown:true}).appendTo(panel).append(
            new window.ZLibrary.Settings.Switch('Preview Reset','Automatically reset the CSS Preview after a delay.',this.settings.delay,(i)=>{
                this.settings.delay=i;
                this.removeListeners();
                this.addListeners();
            }),
            new window.ZLibrary.Settings.Textbox('Preview Reset Delay','How long to wait before resetting the CSS Preview in milliseconds.',this.settings.ms,(i)=>{
				let x=parseInt(i,10);
				//Restricts inputs to numbers and limits (min/max) the seconds the user can input.
				if (x!==NaN&&this.milliseconds.min<=x&&x<=this.milliseconds.max){this.settings.ms=i;}
				//Allows the textbox to be empty and below the minimum amount without regenerating the panel, removing a bit of irritation.
				else if(i===''||x<this.milliseconds.min){}
				//Regenerate the panel when on incorrect input, if you have got a better way go for it.
				else{this.regeneratePanel(panel);}
            })
        );

		const resetButton=$('<button>',{type:'button',text:'Reset To Default',style:'float:right;'})
		.click(function(){
			this.settings=this.default;
			this.saveSettings();
			this.regeneratePanel(panel);
		}.bind(this));
		panel.append(resetButton);
    }
    stop() {
        if(document.contains(this.previewSheet))this.previewSheet.remove();
        this.removeListeners();
        this.initialized=false;
    }
}
