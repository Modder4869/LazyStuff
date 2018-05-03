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
        return 'https://raw.githubusercontent.com/Modder4869/LazyStuff/master/LazyPlugins/CSSCode.plugin.js'
    }
    constructor() {
        this.initialized = false;
    }
    load() {

    }
    start() {
        var libraryScript = document.getElementById('zeresLibraryScript');
        var previewSheet = document.getElementById('CSSCode')
        if (!previewSheet) {
            previewSheet = document.createElement('style')
            previewSheet.setAttribute('id', 'CSSCode')
            document.body.appendChild(previewSheet);
        }


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
        this.addKeyListener()
        this.addContextMenuEvent()
        this.initialized = true;

    }
    addKeyListener() {
        $(document).on("keydown." + this.getName(), (e) => {
            if (e.altKey && e.which == '82') {
                this.clearCSS()
            }
        })

    }
    addContextMenuEvent() {
        $(document).on('contextmenu.' + this.getName(), (e) => {
            if (e.toElement.tagName === "CODE" && e.toElement.className.toLowerCase().includes('css')) {

                this.addContextMenuItems(e)
            }

        })
    }
    clearCSS() {
        let previewSheet = document.getElementById('CSSCode')
        if (!previewSheet) return
        previewSheet.innerHTML = ''
    }
    addContextMenuItems(e) {
        let previewSheet = document.getElementById('CSSCode')
        if (!previewSheet) return;
        let context = document.querySelector('.contextMenu-HLZMGh');
        let CSSRule = e.toElement.innerText;
        let item
        if (previewSheet.innerText.length === 0) {

            this.item = new PluginContextMenu.TextItem("Preview CSS", {
                callback: () => {

                    previewSheet.innerHTML = CSSRule
                    $(context).hide();
                }
            });
        } else {
            this.item = new PluginContextMenu.TextItem("Disable CSS Preview", {
                callback: () => {
                    $(context).hide();
                    this.clearCSS()
                },
                'hint': "Alt+R"
            });
        }
        $(context).find('.itemGroup-1tL0uz').first().append(this.item.element);
    }
    stop() {
        let previewSheet = document.getElementById('CSSCode')
        this.initialized = false;
        $(document).off('contextmenu.' + this.getName());
        $(document).off('keydown.' + this.getName());
        previewSheet.remove();
    }
}
