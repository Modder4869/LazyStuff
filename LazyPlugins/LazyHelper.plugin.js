//META{"name":"LazyHelper"}*//

class LazyHelper {
	getName() { return 'LazyHelper'; }
	getShortName() { return 'LazyHelp'; }
	getDescription() { return 'allows you to inspect elements with Alt + RightClick , and adds shortcut in context menu'; }
	getVersion() { return '0.0.1'; }
	getAuthor() { return 'Modder4869'; }
	constructor() {
		this.initialized = false;
		this.remote = require('electron').remote;
		this.clipboard = require('electron').clipboard;
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
		else libraryScript.addEventListener('load', () => { this.initialize(); });
	}

	initialize() {
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion());
		this.pos = null;
		this.devMO = new MutationObserver((changes) => {
			changes.forEach(
				(change, i) => {
					if (change.addedNodes) {
						change.addedNodes.forEach((node) => {
							if (node.nodeType == 1 && node.classList.contains("contextMenu-uoJTbz")) {
								this.addctx(node);
							}
						});
					}
				}
			);
		})

		$(document).on('contextmenu.' + this.getName(), (e) => {
			this.pos = e;
			this.getCSS(e);
			this.checkKey(e);

			this.initialized = true;
		})
		this.devMO.observe(document.querySelector('#app-mount'), { subtree: false, childList: true })
	}

	stop() {
		this.initialized = false;
		$(document).off('contextmenu.' + this.getName())
		this.devMO.disconnect();
	}

	checkKey(e) {

		if (e.altKey)
			this.inspectElement(e);
	}

	inspectElement(e) {
		// calculate the zoom factor: compare the width and height propotion between window and app, if the devtools is open the app size is reduced in either height or width depending on the dock location, the smaller prop is the actual zoom level because that one didn't get reduced by the devtools
		let widthprop = Math.round((window.outerWidth / document.body.firstElementChild.clientWidth) * 10) / 10;
		let heightprop = Math.round((window.outerHeight / document.body.firstElementChild.clientHeight) * 10) / 10;
		let zoom = widthprop > heightprop ? heightprop : widthprop;
		//check which key 
		// hide contextMenu
		let contextmenu = document.querySelector(".contextMenu-uoJTbz");
		$(contextmenu).hide();
		this.remote.getCurrentWindow().inspectElement(Math.round(e.pageX * zoom), Math.round(e.pageY * zoom));


	}

	getCSS(e) {
		let allrules = null;
		allrules = (getMatchedCSSRules(e.toElement));
		this.devCSS = allrules.item(allrules.length - 1);
	}
	stopCtx(e) {
		return false;
	}
	addctx(context) {

		if (!context) return;
		let subMenu = new PluginContextMenu.SubMenuItem("LazyDev", new PluginContextMenu.Menu(false).addItems(
			new PluginContextMenu.TextItem("Debugger", {
				callback: () => {
					debugger;
				}
			}),
			new PluginContextMenu.TextItem("Copy CSS Rule", {
				callback: () => {
					this.clipboard.writeText(this.devCSS.selectorText);
					$(context).hide();
				}
			}),
			new PluginContextMenu.TextItem("Copy CSS Text", {
				callback: () => {
					this.clipboard.writeText(this.devCSS.cssText);
					$(context).hide();
				}
			}),
			new PluginContextMenu.TextItem("Inspect", {
				callback: () => {
					this.inspectElement(this.pos)
					$(context).hide();
				}
			})

		));

		let testGroup = new PluginContextMenu.ItemGroup().addItems(subMenu);
		$(context).find('.itemGroup-oViAgA').first().append(testGroup.element);


	}
}
