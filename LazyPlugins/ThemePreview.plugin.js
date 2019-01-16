//META{"name":"ThemePreview","source":"https://raw.githubusercontent.com/Modder4869/LazyStuff/master/LazyPlugins/ThemePreview.plugin.js","website":"https://www.github.com/Modder4869"}*//

class ThemePreview {
    getName() {
        return 'ThemePreview';
    }
    getShortName() {
        return 'ThemePreview';
    }
    getDescription() {
        return 'Preview themes posted in #Theme-repo , and  direct links that ends with CSS including directly uploaded files or [https://betterdiscord.net/ghdl?id=] link using context menu';
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
        this.request = require('request');
        this.initialized = false;
        this.default = {
            delay: false,
            ms: 3000
        };
        this.settings = {
            delay: false,
            ms: 3000
        };
        this.previewSheet;
        this.themeCSS;
        this.themeUrl;
    }
    load() { /*Borrowing from Zere here, b/c I made a mistake.*/
        if (!ZLibrary) {
            window.BdApi.alert("Library Missing",`The library plugin needed for ` + this.getName() + ` is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
        }
    }
    start() {
        let libraryScript = document.getElementById('ZeresPluginLibrary');
        let legacyLibScript = document.getElementById('ZeresLegacyPluginLibrary');
        this.previewSheet = document.getElementById('ThemePreview');
        if (!this.previewSheet) {
            this.previewSheet = document.createElement('style');
            this.previewSheet.setAttribute('id', 'ThemePreview');
            document.body.appendChild(this.previewSheet);
        }

        if (!legacyLibScript) {
            legacyLibScript = document.createElement('script');
            legacyLibScript.setAttribute('type', 'text/javascript');
            legacyLibScript.setAttribute('src', 'https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js');
            legacyLibScript.setAttribute('id', 'ZeresLegacyPluginLibrary');
            document.head.appendChild(legacyLibScript);
        }

        if (typeof window.ZeresPluginLibrary !== 'undefined') this.initialize();
        else libraryScript.addEventListener('load', () => this.initialize());
    }
    initialize() {
        ZLibrary.PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), this.getLink());
        ZLibrary.PluginUtilities.loadSettings(this.getName(), this.settings);
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
    generatePanel(panel) {
        new PluginSettings.ControlGroup('Preview Settings', () => PluginUtilities.saveSettings(this.getName(), this.settings)).appendTo(panel).append(
            new PluginSettings.Checkbox('Preview Reset', 'Automatically reset the Theme Preview after a delay.', this.settings.delay, (i) => {
                this.settings.delay = i;
                this.removeListeners();
                this.addListeners();
            }),
            new PluginSettings.Slider('Preview Reset Delay', 'How long to wait before resetting the Theme Preview. Default is 3000ms, 1000ms = 1 second.', 0, 10000, 500, this.settings.ms, (i) => {
                this.settings.ms = i;
                this.removeListeners();
                this.addListeners();
            })
            .setLabelUnit('ms')
        );

        const resetButton = $('<button>', {
            type: 'button',
            text: 'Reset To Default',
            style: 'float: right;'
        }).on('click.reset', () => {
            for (const key in this.default) {
                this.settings[key] = this.default[key];
            }
            PluginUtilities.saveSettings(this.getName(), this.settings);
            panel.empty();
            this.generatePanel(panel);
        });

        panel.append(resetButton);
    }
    stop() {
        if (document.contains(this.previewSheet)) {
            this.previewSheet.remove();
        }
        this.removeListeners();
        this.initialized = false;
    }
}
