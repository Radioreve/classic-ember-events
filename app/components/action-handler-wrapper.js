import Component from '@ember/component';

export default Component.extend({

  actions: {
    actionModifierWrapperClick(e) {
      console.log('action modifier wrapper click event:' + e);
    }
  }
});
