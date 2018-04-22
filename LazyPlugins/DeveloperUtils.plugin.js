//META{"name":"DeveloperUtils"}*//
class DeveloperUtils {
    getName() {
        return 'DeveloperUtilities';
    }
    getShortName() {
        return 'devutils';
    }
    getDescription() {
        return 'allows you to inspect elements with alt + rightclick , and adds shortcut in context menu';
    }
    getVersion() {
        return '0.0.5';
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
                KeyCombinationEnabled: true
            }
        };
        this.settings = this.defaultSettings;
    }
    loadSettings() {
        this.settings = PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
    }

    saveSettings() {
        PluginUtilities.saveSettings(this.getName(), this.settings);
    }
    load() {

    }
    start() {
        var libraryScript = document.getElementById('zeresLibraryScript');
        if (!libraryScript) {
            libraryScript = document.createElement('script');
            libraryScript.setAttribute('type', 'text/javascript');
            libraryScript.setAttribute('src', 'https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js');
            libraryScript.setAttribute('id', 'zeresLibraryScript');
            document.head.appendChild(libraryScript);
        }

        if (typeof window.ZeresLibrary !== 'undefined') this.initialize();
        else libraryScript.addEventListener('load', () => {
            this.initialize();
        });
    }

    initialize() {
        PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), this.getLink());
        this.loadSettings();
        this.addContextMenuEvent()
        this.initialized = true;
    }
    addContextMenuEvent() {
        $(document).on('contextmenu.' + this.getName(), (e) => {
            this.addContextMenuItems(e);
            if (!this.settings.DevUtils.KeyCombinationEnabled) {
                return;
            }
            if (e.altKey) {
                let context = document.querySelector(".contextMenu-uoJTbz");
                $(context).hide()
                this.inspectAt(e)

            }

        })

    }
    stop() {
        this.initialized = false;
        $(document).off('contextmenu.' + this.getName())
    }

    inspectAt(e) {
        let x = parseInt(e.clientX * window.devicePixelRatio);
        let y = parseInt(e.clientY * window.devicePixelRatio);
        this.currentWindow.inspectElement(x, y);
    }

    getCSS(e) {
        let CSSRules = null;
        CSSRules = (getMatchedCSSRules(e.toElement))
        this.CSSRule = CSSRules.item(CSSRules.length - 1)
    }

    addContextMenuItems(e) {
        let context = document.querySelector(".contextMenu-uoJTbz");
        if (!context) return;
        this.getCSS(e);
        let currentWin = this.currentWindow;
        let subMenu = new PluginContextMenu.SubMenuItem("DevUtils", new PluginContextMenu.Menu(false).addItems(

            new PluginContextMenu.TextItem("Debugger", {
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
            new PluginContextMenu.TextItem("Copy CSS Rule", {
                callback: () => {
                    this.clipboard.writeText(this.CSSRule.selectorText);
                    $(context).hide();
                }
            }),
            new PluginContextMenu.TextItem("Copy CSS Text", {
                callback: () => {
                    this.clipboard.writeText(this.CSSRule.cssText);
                    $(context).hide();
                }
            }),
            new PluginContextMenu.TextItem("Inspect", {
                callback: () => {
                    this.inspectAt(e)
                    $(context).hide();
                }
            })

        ));

        let testGroup = new PluginContextMenu.ItemGroup().addItems(subMenu);
        $(context).find('.itemGroup-oViAgA').first().append(testGroup.element);
    }
    getSettingsPanel() {
        var panel = $("<form>").addClass("form").css("width", "100%");
        if (this.initialized) this.generateSettings(panel);
        return panel[0];
    }

    generateSettings(panel) {

        new PluginSettings.ControlGroup("DevUtilites Options", () => {
            this.saveSettings();
        }, {
            shown: true
        }).appendTo(panel).append(
            new PluginSettings.PillButton("Use Shortcut Key", "enable / disable the inspect element shorcut [Alt + Right Click]", " context menu only", "use alt key + right click",
                this.settings.DevUtils.KeyCombinationEnabled, (checked) => {
                    this.settings.DevUtils.KeyCombinationEnabled = checked;
                }
            )
        );
    }
}
