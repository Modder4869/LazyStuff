//META{"name":"DeveloperUtils","source":"https://github.com/Modder4869/LazyStuff/blob/master/LazyPlugins/DeveloperUtils.plugin.js","website":"https://www.github.com/Modder4869"}*//
class DeveloperUtils {
    getName() {
        return 'DeveloperUtilities';
    }
    getShortName() {
        return 'devutils';
    }
    getDescription() {
        return 'Allows you to inspect elements with alt + rightclick, and adds shortcut in context menu';
    }
    getVersion() {
        return '0.1.3';
    }
    getAuthor() {
        return 'Modder4869';
    }
    getLink() {
        return 'https://raw.githubusercontent.com/Modder4869/LazyStuff/master/LazyPlugins/DeveloperUtils.plugin.js'
    }
    constructor() {

        this.currentWindow = require('electron').remote.getCurrentWindow();
        this.initialized = false;
        this.remote = require('electron').remote;
        this.clipboard = require('electron').clipboard;
        this.defaultSettings = {
            DevUtils: {
                KeyCombinationEnabled: true,
                delay: 3000
            }
        };
        this.settings = this.defaultSettings;
    }
    loadSettings() {
        this.settings = ZLibrary.PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
    }

    saveSettings() {
        ZLibrary.PluginUtilities.saveSettings(this.getName(), this.settings);
    }
    load() {
		let libraryScript=document.getElementById('zeresLibraryScript');
		if(!libraryScript){
			libraryScript=document.createElement('script');
			libraryScript.setAttribute('type','text/javascript');
			/*In part borrowed from Zere, so it redirects the user to download the Lib if it does not load correctly and the user does not have the plugin version of the lib.*/
			libraryScript.addEventListener("error",function(){if(typeof ZLibrary==="undefined"){window.BdApi.alert("Library Missing",`The library plugin needed for ${this.getName()} is missing and could not be loaded.<br /><br /><a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);}}.bind(this));
			libraryScript.setAttribute('src','https://rauenzi.github.io/BDPluginLibrary/release/ZLibrary.js');
			libraryScript.setAttribute('id','zeresLibraryScript');
			document.head.appendChild(libraryScript);
		}
    }
    start() {
		let libraryScript=document.getElementById('zeresLibraryScript');
		if(typeof ZLibrary==="object")this.initialize();
		else libraryScript.addEventListener('load',()=>this.initialize());
    }

    initialize() {
        ZLibrary.PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), this.getLink());
        this.loadSettings();
        this.addContextMenuEvent()
        this.initialized = true;
    }
    addContextMenuEvent() {
        $(document).on('contextmenu.' + this.getName(), (e) => {process.nextTick(()=> {
            this.addContextMenuItems(e)});
            if (!this.settings.DevUtils.KeyCombinationEnabled) {
                return;
            }
            if (e.altKey) {
                let context = document.querySelector(".contextMenu-HLZMGh");
                $(context).hide();
                this.inspectAt(e);

            }

        })

    }
    stop() {
        this.initialized = false;
        $(document).off('contextmenu.' + this.getName());
    }

    inspectAt(e) {
        let x = parseInt(e.clientX * window.devicePixelRatio);
        let y = parseInt(e.clientY * window.devicePixelRatio);
        this.currentWindow.inspectElement(x, y);
    }


    addContextMenuItems(e) {
        let CSSRules = this.getMatchedCSSRules(e.toElement);
        let context = document.querySelector('.contextMenu-HLZMGh');
		if(!CSSRules.length)return;
        let CSSRule = CSSRules[CSSRules.length-1];
        let currentWin = this.currentWindow;
        let subMenu = new ZLibrary.ContextMenu.SubMenuItem("DevUtils", new ZLibrary.ContextMenu.Menu(false).addItems(

            new ZLibrary.ContextMenu.TextItem("Debugger", {
                callback: () => {
                    if (!currentWin.isDevToolsOpened()) {
                        currentWin.openDevTools()
                        setTimeout(() => {
                            debugger
                        }, 3e3)
                    }

                    debugger;
                }
            }),
            new ZLibrary.ContextMenu.TextItem("Copy Selector", {
                callback: () => {
                    this.clipboard.writeText(CSSRule.selectorText);
                    $(context).hide();
                }
            }),
            new ZLibrary.ContextMenu.TextItem("Copy Declaration", {
                callback: () => {
                    this.clipboard.writeText(CSSRule.style.cssText);
                    $(context).hide();
                }
            }),
            new ZLibrary.ContextMenu.TextItem("Copy Rule-Set", {
                callback: () => {
                    this.clipboard.writeText(CSSRule.cssText);
                    $(context).hide();
                }
            }),
            new ZLibrary.ContextMenu.TextItem("Inspect", {
                callback: () => {
                    this.inspectAt(e);
                    $(context).hide();
                }
            }),
            new ZLibrary.ContextMenu.TextItem("Debugger (timeout)", {
                callback: () => {
                    setTimeout(() => {
                        debugger
                    }, this.settings.DevUtils.delay)
                }
            })

        ));

        let testGroup = new ZLibrary.ContextMenu.ItemGroup().addItems(subMenu);
        let newMenu = new ZLibrary.ContextMenu.Menu();

        if (!context) {
            context = newMenu.element;
            newMenu.addGroup(testGroup);

            newMenu.show(e.clientX, e.clientY);
            return;
        }
        if (context.classList.contains("plugin-context-menu")) return;
        $(context).find('.itemGroup-1tL0uz').last().append(testGroup.element);
	}

	getMatchedCSSRules(element) {
		let matching=[],sheets=document.styleSheets;
		function loopRules(rules){
			for(let rule of rules){
				if(rule instanceof CSSMediaRule){
					if(window.matchMedia(rule.conditionText).matches){
						loopRules(rule.cssRules);
					}
				}else if(rule instanceof CSSStyleRule){
					if(element.matches(rule.selectorText)){
						matching.push(rule);
					}
				}
			}
		};
		for(let sheet of sheets){
			try{
				loopRules(sheet.cssRules);
			}catch(e){
				//Easiest way to fix an issue of a stylesheet not having a cssRules property. Unless you want to check every property name it has with object keys.
			}
		}
		//console.log(matching); //Debug.
		return matching;
	}//Modified, based on https://stackoverflow.com/questions/2952667/find-all-css-rules-that-apply-to-an-element

    getSettingsPanel() {
        var panel = $("<form>").addClass("form").css("width", "100%");
        if (this.initialized) this.generateSettings(panel);
        return panel[0];
    }

    generateSettings(panel) {
        new PluginSettings.ControlGroup("Settings", () => {
            this.saveSettings();
        }, {
            shown: true
        }).appendTo(panel).append(
            new PluginSettings.PillButton("Shortcut", "use shortcut for quick inspect", " Context Menu Only", " Key + rightClick",
                this.settings.DevUtils.KeyCombinationEnabled, (checked) => {
                    this.settings.DevUtils.KeyCombinationEnabled = checked;
                }),
            new PluginSettings.Slider("Timeout", "set value for the delay before it pauses , default is 3000 = 3 sec", 0, 10000, 500,
                this.settings.DevUtils.delay, (val) => {
                    this.settings.DevUtils.delay = val;
                }).setLabelUnit('ms')

        );
    }
}
