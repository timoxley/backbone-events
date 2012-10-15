var _ = require('component-underscore')
var BackboneEvents = require('backbone-events')
var assert = require('timoxley-assert')
var ok = assert.ok
var equal = assert.equal
var strictEqual = assert.strictEqual

describe("BackboneEvents", function() {
  it("on and trigger", function() {
    var obj = { counter: 0 };
    _.extend(obj,BackboneEvents);
    obj.on('event', function() { obj.counter += 1; });
    obj.trigger('event');
    equal(obj.counter,1,'counter should be incremented.');
    obj.trigger('event');
    obj.trigger('event');
    obj.trigger('event');
    obj.trigger('event');
    equal(obj.counter, 5, 'counter should be incremented five times.');
  });

  it("binding and triggering multiple events", function() {
    var obj = { counter: 0 };
    _.extend(obj,BackboneEvents);

    obj.on('a b c', function() { obj.counter += 1; });

    obj.trigger('a');
    equal(obj.counter, 1);

    obj.trigger('a b');
    equal(obj.counter, 3);

    obj.trigger('c');
    equal(obj.counter, 4);

    obj.off('a c');
    obj.trigger('a b c');
    equal(obj.counter, 5);
  });

  it("trigger all for each event", function() {
    var a, b, obj = { counter: 0 };
    _.extend(obj, BackboneEvents);
    obj.on('all', function(event) {
      obj.counter++;
      if (event == 'a') a = true;
      if (event == 'b') b = true;
    })
    .trigger('a b');
    ok(a);
    ok(b);
    equal(obj.counter, 2);
  });

  it("on, then unbind all functions", function() {
    var obj = { counter: 0 };
    _.extend(obj,BackboneEvents);
    var callback = function() { obj.counter += 1; };
    obj.on('event', callback);
    obj.trigger('event');
    obj.off('event');
    obj.trigger('event');
    equal(obj.counter, 1, 'counter should have only been incremented once.');
  });

  it("bind two callbacks, unbind only one", function() {
    var obj = { counterA: 0, counterB: 0 };
    _.extend(obj,BackboneEvents);
    var callback = function() { obj.counterA += 1; };
    obj.on('event', callback);
    obj.on('event', function() { obj.counterB += 1; });
    obj.trigger('event');
    obj.off('event', callback);
    obj.trigger('event');
    equal(obj.counterA, 1, 'counterA should have only been incremented once.');
    equal(obj.counterB, 2, 'counterB should have been incremented twice.');
  });

  it("unbind a callback in the midst of it firing", function() {
    var obj = {counter: 0};
    _.extend(obj, BackboneEvents);
    var callback = function() {
      obj.counter += 1;
      obj.off('event', callback);
    };
    obj.on('event', callback);
    obj.trigger('event');
    obj.trigger('event');
    obj.trigger('event');
    equal(obj.counter, 1, 'the callback should have been unbound.');
  });

  it("two binds that unbind themeselves", function() {
    var obj = { counterA: 0, counterB: 0 };
    _.extend(obj,BackboneEvents);
    var incrA = function(){ obj.counterA += 1; obj.off('event', incrA); };
    var incrB = function(){ obj.counterB += 1; obj.off('event', incrB); };
    obj.on('event', incrA);
    obj.on('event', incrB);
    obj.trigger('event');
    obj.trigger('event');
    obj.trigger('event');
    equal(obj.counterA, 1, 'counterA should have only been incremented once.');
    equal(obj.counterB, 1, 'counterB should have only been incremented once.');
  });

  it("bind a callback with a supplied context", function () {
    var TestClass = function () {
      return this;
    };
    TestClass.prototype.assertTrue = function () {
      ok(true, '`this` was bound to the callback');
    };

    var obj = _.extend({},BackboneEvents);
    obj.on('event', function () { this.assertTrue(); }, (new TestClass));
    obj.trigger('event');
  });

  it("nested trigger with unbind", function () {
    var obj = { counter: 0 };
    _.extend(obj, BackboneEvents);
    var incr1 = function(){ obj.counter += 1; obj.off('event', incr1); obj.trigger('event'); };
    var incr2 = function(){ obj.counter += 1; };
    obj.on('event', incr1);
    obj.on('event', incr2);
    obj.trigger('event');
    equal(obj.counter, 3, 'counter should have been incremented three times');
  });

  it("callback list is not altered during trigger", function () {
    var counter = 0, obj = _.extend({}, BackboneEvents);
    var incr = function(){ counter++; };
    obj.on('event', function(){ obj.on('event', incr).on('all', incr); })
    .trigger('event');
    equal(counter, 0, 'bind does not alter callback list');
    obj.off()
    .on('event', function(){ obj.off('event', incr).off('all', incr); })
    .on('event', incr)
    .on('all', incr)
    .trigger('event');
    equal(counter, 2, 'unbind does not alter callback list');
  });

  it("#1282 - 'all' callback list is retrieved after each event.", function() {
    var counter = 0;
    var obj = _.extend({}, BackboneEvents);
    var incr = function(){ counter++; };
    obj.on('x', function() {
      obj.on('y', incr).on('all', incr);
    })
    .trigger('x y');
    strictEqual(counter, 2);
  });

  it("if no callback is provided, `on` is a noop", function() {
    _.extend({}, BackboneEvents).on('test').trigger('test');
  });

  it("remove all events for a specific context", function() {
    var obj = _.extend({}, BackboneEvents);
    obj.on('x y all', function() { ok(true); });
    obj.on('x y all', function() { ok(false); }, obj);
    obj.off(null, null, obj);
    obj.trigger('x y');
  });

  it("remove all events for a specific callback", function() {
    var obj = _.extend({}, BackboneEvents);
    var success = function() { ok(true); };
    var fail = function() { ok(false); };
    obj.on('x y all', success);
    obj.on('x y all', fail);
    obj.off(null, fail);
    obj.trigger('x y');
  });

  it("off is chainable", function() {
    var obj = _.extend({}, BackboneEvents);
    // With no events
    ok(obj.off() === obj);
    // When removing all events
    obj.on('event', function(){}, obj);
    ok(obj.off() === obj);
    // When removing some events
    obj.on('event', function(){}, obj);
    ok(obj.off('event') === obj);
  });

  it("#1310 - off does not skip consecutive events", function() {
    var obj = _.extend({}, BackboneEvents);
    obj.on('event', function() { ok(false); }, obj);
    obj.on('event', function() { ok(false); }, obj);
    obj.off(null, null, obj);
    obj.trigger('event');
  });
});
