//META{"name":"CSSCode"}*//
class CSSCode {
    getName() {
        return 'CSSCode';
    }
    getShortName() {
        return 'CSSCode';
    }
    getDescription() {
        return 'Preview CSS inside codeblock using context menu';
    }
    getVersion() {
        return '0.0.1';
    }
    getAuthor() {
        return 'Modder4869';
    }
    getLink() {
        return `https://raw.githubusercontent.com/Modder4869/LazyStuff/master/LazyPlugins/${this.getName()}.plugin.js`;
    }
    constructor() {
        this.initialized = false;
        this.previewSheet;
    }
    load() {

    }
    start() {
        let libraryScript = document.getElementById('zeresLibraryScript');
        this.previewSheet = document.getElementById('CSSCode');
        if (!this.previewSheet) {
            this.previewSheet = document.createElement('style');
            this.previewSheet.setAttribute('id', 'CSSCode');
            document.body.appendChild(this.previewSheet);
        }


        if (!libraryScript) {
            libraryScript = document.createElement('script');
            libraryScript.setAttribute('type', 'text/javascript');
            libraryScript.setAttribute('src', 'https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js');
            libraryScript.setAttribute('id', 'zeresLibraryScript');
            document.head.appendChild(libraryScript);
        }

        if (typeof window.ZeresLibrary !== 'undefined') this.initialize();
        else libraryScript.addEventListener('load', () => this.initialize());
    }
    initialize() {
        PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), this.getLink());
        this.addKeyListener()
        this.addContextMenuEvent()
        this.initialized = true;
    }
    addListeners() {
        $(document).on(`keydown.${this.getName()}`, (e) => {
            if (e.altKey && e.which === 82) {
                this.clearCSS();
            }
        });
        $(document).on(`contextmenu.${this.getName()}`, (e) => {
            if (e.toElement.tagName === "CODE" && e.toElement.className.toLowerCase().includes('css')) {
                this.addContextMenuItems(e);
            }
        });
    }
    removeListeners() {
        $(document).off(`contextmenu.${this.getName()}`);
        $(document).off(`keydown.${this.getName()}`);
    }
    clearCSS() {
        if(!document.contains(this.previewSheet)) return;
        this.previewSheet.innerHTML = '';
    }
    addContextMenuItems(e) {
        if(!document.contains(this.previewSheet)) return;
        let context = document.querySelector('.contextMenu-HLZMGh');
        let item;
        if (this.previewSheet.innerText.length === 0) {
            item = new PluginContextMenu.TextItem('Preview CSS', {
                callback: () => {
                    $(context).hide();
                    this.previewSheet.innerHTML = e.toElement.innerText;
                }
            });
        } else {
            item = new PluginContextMenu.TextItem('Disable CSS Preview', {
                callback: () => {
                    $(context).hide();
                    this.clearCSS();
                },
                hint: 'Alt+R'
            });
        }
        $(context).find('.itemGroup-1tL0uz').first().append(item.element);
    }
    stop() {
        if(document.contains(this.previewSheet)) {
            previewSheet.remove();
        }
        this.removeListeners();
        this.initialized = false;
    }
}
