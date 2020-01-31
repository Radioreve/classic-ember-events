import Component from '@ember/component';

export default Component.extend({

  /*
    This does not really have a name in the
    Ember world. It could be called an action
    property. It has the weakest form of precedence
    and is basically overriden by everything.
    It can be overriden also by a property directly
    pass on the component when called. Then, the
    implementation will often refer to the caller's
    context (controller or component) and this impplementation
    will never be called anyway.
  */
  click(e){
    console.log('action property click event:' + e);
    e.stopPropagation();
  },

  /*
    Unquoted actions are possible but are dangerous
    because they are subject to naming colleisions
    with properties coming from the caller.

    Usually, they are set by the caller (and therefore
    are not called action, just properties functions)
    and invoked inside the actual actions. This is the
    spirit of the DDAU pattern (Data Down Actions Up).
  */
  unquotedActionModifierClick(e) {
    console.log('action modifier unquoted click event:' + e);
  },
  actions: {
    /*
      Here, the Modifier is just a function reacting to
      real DOM event. Hence, it receives a real MouseEvent
      object. If you call e.stopPropagation() here, then no
      other handlers will be executed !!
    */
    actionModifierClick(e){
      console.log('action modifier click event:' + e);
    },
    actionHelperClick(e){
      console.log('action helper click event:' + e);
    },
  },
});
