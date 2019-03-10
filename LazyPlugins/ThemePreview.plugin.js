//META{"name":"ThemePreview","source":"https://github.com/Modder4869/LazyStuff/blob/master/LazyPlugins/ThemePreview.plugin.js","website":"https://www.github.com/Modder4869"}*//

class ThemePreview {
    getName() {
        return 'ThemePreview';
    }
    getShortName() {
        return 'ThemePreview';
    }
    getDescription() {
        return 'Preview themes posted in #Theme-repo, and direct links that ends with CSS including directly uploaded files or [https://betterdiscord.net/ghdl?id=] link using context menu.';
    }
    getSettingsPanel() {
		const panel = $('<form>').addClass('form').css('width', '100%');
        if (this.initialized) this.generatePanel(panel);
        return panel[0];
    }
    getVersion() {
        return '0.0.4';
    }
    getAuthor() {
        return 'Modder4869';
    }
    getLink() {
        return `https://raw.githubusercontent.com/Modder4869/LazyStuff/master/LazyPlugins/${this.getName()}.plugin.js`;
    }
    constructor() {
        this.request=require('request');
		this.initialized=false;
		this.milliseconds={ //For easy modifiction for the settings panel.
			min:1000,
			max:10000
		}
        this.previewSheet;
        this.themeCSS;
        this.themeUrl;
	}
	get default(){ //when regenerating settings, the settings panel likes to change the default settings for some reason. This is the fix.
		return{
			delay:false,
			ms:3000,
			showBodyLog:false
		}
	}
	load() {
		let libraryScript=document.getElementById('zeresLibraryScript'),self=this;
		if (!libraryScript){
			libraryScript = document.createElement('script');
			libraryScript.setAttribute('type', 'text/javascript');
			/*In part borrowed from Zere, so it redirects the user to download the Lib if it does not load correctly and the user does not have it.*/
			libraryScript.onload = function() {if(typeof ZLibrary === "undefined") {window.BdApi.alert("Library Missing",`The library plugin needed for ${self.getName()} is missing and could not be loaded.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);}};
			libraryScript.setAttribute('src', 'https://rauenzi.github.io/BDPluginLibrary/release/ZLibrary.js');
			libraryScript.setAttribute('id', 'zeresLibraryScript');
			document.head.appendChild(libraryScript);
		}
	}
    start() {
        let libraryScript = document.getElementById('zeresLibraryScript');
        this.previewSheet = document.getElementById('ThemePreview');

        if (!this.previewSheet) {
            this.previewSheet = document.createElement('style');
            this.previewSheet.setAttribute('id', 'ThemePreview');
            document.body.appendChild(this.previewSheet);
        }

        if (typeof window.ZLibrary !== "undefined") this.initialize();
        else libraryScript.addEventListener('load', () => this.initialize());
    }
    initialize() {
		ZLibrary.PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), this.getLink());
		this.loadSettings();
        this.addListeners();
        this.initialized = true;
    }
    addListeners() {
        $(document).on(`keydown.${this.getName()}`, (e) => {
            if (e.altKey && e.which === 84) {
                this.clearTheme();
            }
        });
        $(document).on(`contextmenu.${this.getName()}`, (e) => {
            if (e.toElement.tagName === 'A' && e.toElement.href.endsWith('.css') || e.toElement.tagName === 'A' && e.toElement.href.includes('betterdiscord.net/ghdl?id')) {
                this.addContextMenuItems(e)
            }

        });
    }
    getThemeCSS() {

        if (this.themeUrl.includes('github.com')) {
            this.themeUrl = this.themeUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');

        }
        let url = this.themeUrl;
        this.request({
            url: url
        }, (error, response, body) => {
            this.themeCSS = body.substring(body.indexOf("\n") + 1);
            if(this.settings.showBodyLog === true){console.log(body);}
            ZLibrary.Toasts.show('loaded', {
                type: "success"
            });
            this.previewSheet.innerHTML = this.themeCSS;
            if (error) {
                ZLibrary.Toasts.show(error, {
                    type: "danger"
                });
                return;
            }

        })

    }
    removeListeners() {
        $(document).off(`contextmenu.${this.getName()}`);
        $(document).off(`keydown.${this.getName()}`);
    }
    clearTheme() {
        if (!document.contains(this.previewSheet)) return;
        this.previewSheet.innerHTML = '';
        this.themeUrl = '';
        this.themeCSS = '';
    }
    addContextMenuItems(e) {
        if (!document.contains(this.previewSheet)) return;
        const context = document.querySelector('.contextMenu-HLZMGh');
        let item;
        if (this.previewSheet.innerHTML.length === 0) {
            item = new ZLibrary.ContextMenu.TextItem('Preview Theme', {
                callback: () => {
                    if (context) {
                        $(context).hide();
                    }
                    this.themeUrl = e.toElement.href;
                    this.getThemeCSS();
                    this.previewSheet.innerHTML = this.themeCSS;
                    if (this.settings.delay) {
                        setTimeout(() => (this.clearTheme()), this.settings.ms);
                    }
                }
            });
        } else {
            item = new ZLibrary.ContextMenu.TextItem('Disable Preview', {
                callback: () => {
                    if (context) {
                        $(context).hide();
                    }
                    this.clearTheme();
                },
                hint: 'Alt+T'
            });
        }
        $(context).find('.itemGroup-1tL0uz').first().append(item.element);
	}
	saveSettings() {
		ZLibrary.PluginUtilities.saveSettings(this.getName(), this.settings);
	}
	loadSettings() {
		this.settings=ZLibrary.PluginUtilities.loadSettings(this.getName(), this.default);
	}
    generatePanel(panel) { //does not use the SettingGroup callback so it can check/limit inputs.
        new ZLibrary.Settings.SettingGroup('Preview Settings',{collapsible:true,shown:true}).appendTo(panel).append(
            new ZLibrary.Settings.Switch('Preview Reset','Automatically reset the Theme Preview after a delay.',this.settings.delay,(i)=>{
				this.settings.delay = i;
				this.saveSettings();
                this.removeListeners();
                this.addListeners();
			}),
			new ZLibrary.Settings.Textbox('Preview Reset Delay','How long to wait before resetting the Theme Preview. 1000ms = 1 second, for a minimum of 1 second and a maximum of 10 seconds.',this.settings.ms,(i)=>{
				let x = parseInt(i, 10);
				if (x!==NaN&&this.milliseconds.min<=x&&x<=this.milliseconds.max) { //Restricts inputs to numbers and limits (min/max) the seconds the user can input.
					this.settings.ms = i;
					this.saveSettings();
					this.removeListeners();
					this.addListeners();
				}else if(i===''||x<this.milliseconds.min) {//Allows the textbox to be empty and below the minimum amount without regenerating the panel, removing a bit of irritation.
				}else{ //Regenerate the panel when on incorrect input, if you have got a better way go for it.
					this.regeneratePanel(panel);
				}
			}),
			new ZLibrary.Settings.Switch('Log Theme File In Console','Logs the theme file that is previewed in the developer tools console.',this.settings.showBodyLog,(i)=>{
				this.settings.showBodyLog = i;
				this.saveSettings();
			})
		);

		const resetButton=$('<button>',{type:'button',text:'Reset To Default',style:'float: right;'})
		.click(function(){
			this.settings=this.default;
			this.saveSettings();
			this.regeneratePanel(panel);
		}.bind(this));
        panel.append(resetButton);
    }
    stop() {
        if (document.contains(this.previewSheet)) {
            this.previewSheet.remove();
        }
        this.removeListeners();
        this.initialized = false;
	}
	regeneratePanel(panel) {
		if (panel !== undefined) {
			this.saveSettings();
			panel.empty();
			this.generatePanel(panel);
		}
	}
}
