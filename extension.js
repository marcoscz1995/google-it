const Clutter = imports.gi.Clutter;
const GLib = imports.gi.GLib;
const Lang = imports.lang;
const St = imports.gi.St;

const Main = imports.ui.main;
const Mainloop = imports.mainloop;

const Panel = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

var mySearcher = {
  _spawn: function(cmd, e) {
    try {
      // very important to spwan async
      GLib.spawn_command_line_async(cmd, null, null, null, e);
    } catch(e) {
      throw e;
    }
  }
};

const GoogleSearch = new Lang.Class({
   Name: 'GoogleSearch',
   Extends: PanelMenu.Button,

  _init: function(){
      this.parent(0.0, 'GoogleSearch');

      this.icon = new St.Icon({icon_name: 'gtk-find',
                                style_class: 'system-status-icon'});
      let box = new St.BoxLayout({vertical: false,
                                style_class: 'panel-status-menu-box'});

      box.add_child(this.icon);
      this.actor.add_actor(box);

      this.add_search_widget();
  },

  add_search_widget: function() {

    // create the actual entry object
    this.entryObject = new St.Entry({
      name: 'searchEntry',
      hint_text: 'Search...',
      track_hover: true,
      can_focus: true
    });

    let entry = this.entryObject.clutter_text;
    entry.connect('key-press-event', Lang.bind(this,
                                      this.pressed_enter_key));

    let popupSearch = new PopupMenu.PopupMenuSection();
    popupSearch.actor.add_actor(this.entryObject);
    popupSearch.actor.add_style_class_name('popupSearch');

    this.menu.addMenuItem(popupSearch);

    this.menu.connect('open-state-changed',
                      Lang.bind(this, this.focus));
  },

  // autofocus entry when opened
  focus: function() {
    Mainloop.timeout_add(20, Lang.bind(this, function() {
      global.stage.set_key_focus(this.entryObject);
    }));
  },

  // search when enter key is pressed
  pressed_enter_key: function(o, e) {
    let symbol = e.get_key_symbol();
      if ((symbol == Clutter.Return) || (symbol == Clutter.KP_Enter)) {
          var str = o.get_text();

          try {
            this.startBrowser(str);
          } catch(e) {
            throw e;
          }
          o.set_text('');
          this.menu.close();
      }
  },

  startBrowser: function(str) {
    str = str.split(' ').join('+');
    var command = "xdg-open https://www.google.com/#q=" + str;
    mySearcher._spawn(command, null);
  },
});

let searcher;

function init() {
}

function enable() {
   searcher = new GoogleSearch();
   Main.panel.addToStatusArea('GoogleSearch', searcher);
}

function disable() {
   searcher.destroy();
}