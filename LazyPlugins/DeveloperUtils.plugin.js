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
        return '0.1.0 ';
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
            this.modalHTML = `<div id="\${id}" class="theme-dark">
                            <div class="backdrop backdrop-1ocfXc" style="background-color: rgb(0, 0, 0); opacity: 0.85;"></div>
                            <div class="modal modal-1UGdnR" style="opacity: 1;">
                                <div class="inner-1JeGVc">
                                    <div class="modal-3HD5ck sizeMedium-1fwIF2" style="overflow: hidden;">
                                        <div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6 header-1R_AjF">
                                            <h4 class="title h4-AQvcAz title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi defaultColor-1_ajX0 defaultMarginh4-2vWMG5 marginReset-236NPn">\${modalTitle}</h4>
                                            <svg viewBox="0 0 12 12" name="Close" width="18" height="18" class="close-button close-18n9bP flexChild-faoVW3"><g fill="none" fill-rule="evenodd"><path d="M0 0h12v12H0"></path><path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg>
                                        </div>
                                        <div class="scrollerWrap-2lJEkd content-2BXhLs scrollerThemed-2oenus themeGhostHairline-DBD-2d">
                                            <div class="scroller-2FKFPG inner-3wn6Q5 selectable" style="">
                    
                                            </div>
                                        </div>
                                        <div class="flex-1xMQg5 flex-1O1GKY horizontalReverse-2eTKWD horizontalReverse-3tRjY7 flex-1O1GKY directionRowReverse-m8IjIq justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 footer-2yfCgX" style="flex: 0 0 auto;"><button type="button" class="done-button button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN"><div class="contents-18-Yxp">Done</div></button></div>
                                    </div>
                                </div>
                            </div>
                        </div>`;}
    loadSettings() {
        this.settings = ZLibrary.PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
    }

    saveSettings() {
        ZLibrary.PluginUtilities.saveSettings(this.getName(), this.settings);
    }
    load() {

    }
    start() {
        if (!global.ZeresPluginLibrary) return window.BdApi.alert("Library Missing",`The library plugin needed for ${this.getName()} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
      this.initialize()
    }

    initialize() {
        ZLibrary.PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), this.getLink());
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
        let CSSRules = getMatchedCSSRules(e.toElement);
        let context = document.querySelector('.contextMenu-HLZMGh');
        if (!CSSRules) return;
        let CSSRule = CSSRules.item(CSSRules.length - 1);
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
            }),
            new ZLibrary.ContextMenu.TextItem("Settings", {
                callback: () => {
                    let panel = this.getSettingsPanel();
                   let modal = $(PluginUtilities.formatString(this.modalHTML, {modalTitle: `${this.getName()} Settings`, id: "bd-settingspane-container"}));
        modal.find(".selectable").append(panel);
                            modal.find(".backdrop, .close-button, .done-button").on("click", () => {modal.remove();});
                            modal.appendTo("#app-mount");
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
    getSettingsPanel() {
        var panel = $("<form>").addClass("form").css("width", "100%");
        if (this.initialized) this.generateSettings(panel);
        return panel[0];
    }

    generateSettings(panel) {
        new ZLibrary.Settings.SettingGroup("Settings", () => {
            this.saveSettings();
        }, {
            shown: true
        }).appendTo(panel).append(
            new ZLibrary.Settings.Switch("Shortcut", "use shortcut for quick inspect", " Context Menu Only", " Key + rightClick",
                this.settings.DevUtils.KeyCombinationEnabled, (checked) => {
                    this.settings.DevUtils.KeyCombinationEnabled = checked;
                }),
            new ZLibrary.Settings.Slider("Timeout", "set value for the delay before it pauses , default is 3000 = 3 sec", 0, 10000, 500,
                this.settings.DevUtils.delay, (val) => {
                    this.settings.DevUtils.delay = val;
                })
            // .setLabelUnit('ms')

        );
    }
}
