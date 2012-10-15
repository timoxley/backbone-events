# backbone-events

### Backbone.Events API ported to a component.

  Events is a module that can be mixed in to any object, giving the object the ability to bind and trigger custom named events. Events do not have to be declared before they are bound, and may take passed arguments.

Note: Documentation is adapted directly from the [backbone
website](http://backbonejs.org/).

## Installation

    $ component install timoxley/backbone-events

## Example


```js

var BackboneEvents = require('timoxley/backbone-events')

var object = {};

_.extend(object, BackboneEvents);

object.on("alert", function(msg) {
  alert("Triggered " + msg);
});

object.trigger("alert", "an event");

```

## API

### on
#### object.on(event, callback, [context]) Alias: bind
Bind a callback function to an object. The callback will be invoked whenever the event is fired. If you have a large number of different events on a page, the convention is to use colons to namespace them: "poll:start", or "change:selection". The event string may also be a space-delimited list of several events...

```js
book.on("change:title change:author", ...);
```

To supply a context value for this when the callback is invoked, pass the optional third argument: 
```js
model.on('change', this.render, this)
```

Callbacks bound to the special "all" event will be triggered when any event occurs, and are passed the name of the event as the first argument. For example, to proxy all events from one object to another:
```js
proxy.on("all", function(eventName) {
  object.trigger(eventName);
});
```
### off
#### object.off([event], [callback], [context]) Alias: unbind 
Remove a previously-bound callback function from an object. If no context is specified, all of the versions of the callback with different contexts will be removed. If no callback is specified, all callbacks for the event will be removed. If no event is specified, all event callbacks on the object will be removed.

```js
// Removes just the `onChange` callback.
object.off("change", onChange);

// Removes all "change" callbacks.
object.off("change");

// Removes the `onChange` callback for all events.
object.off(null, onChange);

// Removes all callbacks for `context` for all events.
object.off(null, null, context);

// Removes all callbacks on `object`.
object.off();
```

### trigger
#### object.trigger(event, [*args])
Trigger callbacks for the given event, or space-delimited list of events. Subsequent arguments to trigger will be passed along to the event callbacks.

## License

[MIT](https://github.com/timoxley/backbone-events/blob/master/LICENSE)
