/*global define, ace*/
/*jshint unused:strict, undef:true,trailing:true */
define("data/document", function () {
  "use strict";

  var editor = require('ui/editor');
  var modelist = ace.require('ace/ext/modelist');
  var binary = require('js-git/lib/binary');
  var modes = require('js-git/lib/modes');
  var whitespace = ace.require('ace/ext/whitespace');

  function Doc(path, mode, body) {
    var code = binary.toUnicode(body);
    this.path = path;
    this.mode = mode;
    this.code = code;
    this.session = ace.createEditSession(code);
    this.session.setTabSize(2);
    this.updateAceMode();
    whitespace.detectIndentation(this.session);
  }

  Doc.prototype.update = function (path, mode, body) {
    this.path = path;
    this.mode = mode;
    this.updateAceMode();
    if (body !== undefined) this.setBody(body);
  };

  Doc.prototype.updatePath = function (path) {
    this.path = path;
    this.updateAceMode();
    editor.updatePath(this);
  };

  Doc.prototype.updateAceMode = function () {
    var aceMode = this.mode === modes.sym ?
      "ace/mode/text" : modelist.getModeForPath(this.path).mode;
    if (this.aceMode === aceMode) return;
    this.aceMode = aceMode;
    this.session.setMode(aceMode);
  };
  Doc.prototype.setBody = function (body) {
    var code = binary.toUnicode(body);
    if (code === this.code) return;
    this.code = code;
    this.session.setValue(code, 1);
    whitespace.detectIndentation(this.session);
  };
  Doc.prototype.activate = function () {
    editor.setDoc(this);
  };
  Doc.prototype.save = function (text) {
    if (text === this.code) return;
    this.code = text;
    var body = binary.fromUnicode(text);
    this.updateTree(body);
  };

  return function newDoc(path, mode, body) {
    return new Doc(path, mode, body);
  };
});