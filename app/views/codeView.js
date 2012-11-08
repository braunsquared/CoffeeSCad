// Generated by CoffeeScript 1.3.3
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var $, CodeEditorView, CodeMirror, codeEdit_template, marionette, _;
    $ = require('jquery');
    _ = require('underscore');
    marionette = require('marionette');
    CodeMirror = require('CodeMirror');
    require('foldcode');
    require('coffee_synhigh');
    codeEdit_template = require("text!templates/codeedit.tmpl");
    CodeEditorView = (function(_super) {

      __extends(CodeEditorView, _super);

      CodeEditorView.prototype.template = codeEdit_template;

      CodeEditorView.prototype.ui = {
        codeBlock: "#codeArea",
        errorBlock: "#errorConsole"
      };

      function CodeEditorView(options) {
        this.onRender = __bind(this.onRender, this);

        this.redo = __bind(this.redo, this);

        this.undo = __bind(this.undo, this);

        this.updateUndoRedo = __bind(this.updateUndoRedo, this);

        this.updateHints = __bind(this.updateHints, this);

        this.showError = __bind(this.showError, this);

        this.settingsChanged = __bind(this.settingsChanged, this);

        this.modelChanged = __bind(this.modelChanged, this);
        CodeEditorView.__super__.constructor.call(this, options);
        this.settings = options.settings;
        this.editor = null;
        this.app = require('app');
        this.bindTo(this.model, "change", this.modelChanged);
        this.bindTo(this.settings, "change", this.settingsChanged);
        this.app.vent.bind("csgParseError", this.showError);
      }

      CodeEditorView.prototype.switchModel = function(newModel) {
        this.model = newModel;
        this.editor.setValue(this.model.get("content"));
        this.app.vent.trigger("clearUndoRedo", this);
        this.editor.clearHistory();
        return this.bindTo(this.model, "change", this.modelChanged);
      };

      CodeEditorView.prototype.modelChanged = function(model, value) {
        $(this.ui.errorBlock).addClass("well");
        $(this.ui.errorBlock).removeClass("alert alert-error");
        $(this.ui.errorBlock).html("");
        return this.app.vent.trigger("modelChanged", this);
      };

      CodeEditorView.prototype.settingsChanged = function(settings, value) {
        var key, val, _ref, _results;
        console.log("Settings changed");
        _ref = this.settings.changedAttributes();
        _results = [];
        for (key in _ref) {
          val = _ref[key];
          switch (key) {
            case "startLine":
              this.editor.setOption("firstLineNumber", val);
              _results.push(this.render());
              break;
            default:
              _results.push(void 0);
          }
        }
        return _results;
      };

      CodeEditorView.prototype.showError = function(error) {
        var errLine, errMsg;
        try {
          $(this.ui.errorBlock).removeClass("well");
          $(this.ui.errorBlock).addClass("alert alert-error");
          $(this.ui.errorBlock).html("<div> <h4>" + error.name + ":</h4>  " + error.message + "</div>");
          errLine = error.message.split("line ");
          errLine = errLine[errLine.length - 1];
          return errMsg = error.message;
        } catch (err) {
          console.log("Inner err: " + err);
          return $(this.ui.errorBlock).text(error);
        }
      };

      CodeEditorView.prototype.updateHints = function() {
        var after, info;
        console.log("tutu");
        /*modified version of  codemirror.net/3/demo/widget.html
        */

        editor.operation(function() {
          var err, i, icon, msg, _i, _j, _ref, _ref1, _results;
          for (i = _i = 0, _ref = widgets.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
            editor.removeLineWidget(widgets[i]);
          }
          widgets.length = 0;
          JSHINT(editor.getValue());
          _results = [];
          for (i = _j = 0, _ref1 = JSHINT.errors.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
            err = JSHINT.errors[i];
            if (!err) {
              continue;
            }
            msg = document.createElement("div");
            icon = msg.appendChild(document.createElement("span"));
            icon.innerHTML = "!!";
            icon.className = "lint-error-icon";
            msg.appendChild(document.createTextNode(err.reason));
            msg.className = "lint-error";
            _results.push(widgets.push(editor.addLineWidget(err.line - 1, msg, {
              coverGutter: false,
              noHScroll: true
            })));
          }
          return _results;
        });
        info = editor.getScrollInfo();
        after = editor.charCoords({
          line: editor.getCursor().line + 1,
          ch: 0
        }, "local").top;
        if (info.top + info.clientHeight < after) {
          return editor.scrollTo(null, after - info.clientHeight + 3);
        }
      };

      CodeEditorView.prototype.updateUndoRedo = function() {
        var redos, undos;
        redos = this.editor.historySize().redo;
        undos = this.editor.historySize().undo;
        if (redos > 0) {
          this.app.vent.trigger("redoAvailable", this);
        } else {
          this.app.vent.trigger("redoUnAvailable", this);
        }
        if (undos > 0) {
          return this.app.vent.trigger("undoAvailable", this);
        } else {
          return this.app.vent.trigger("undoUnAvailable", this);
        }
      };

      CodeEditorView.prototype.undo = function() {
        var undoes;
        undoes = this.editor.historySize().undo;
        if (undoes > 0) {
          return this.editor.undo();
        }
      };

      CodeEditorView.prototype.redo = function() {
        var redoes;
        redoes = this.editor.historySize().redo;
        if (redoes > 0) {
          return this.editor.redo();
        }
      };

      CodeEditorView.prototype.onRender = function() {
        var _this = this;
        this.editor = CodeMirror.fromTextArea(this.ui.codeBlock.get(0), {
          mode: "coffeescript",
          lineNumbers: true,
          gutter: true,
          matchBrackets: true,
          firstLineNumber: this.settings.get("startLine"),
          onChange: function(arg, arg2) {
            _this.model.set("content", _this.editor.getValue());
            return _this.updateUndoRedo();
          }
        });
        setTimeout(this.editor.refresh, 0);
        this.app.vent.bind("undoRequest", this.undo);
        return this.app.vent.bind("redoRequest", this.redo);
      };

      return CodeEditorView;

    })(marionette.ItemView);
    return CodeEditorView;
  });

}).call(this);
