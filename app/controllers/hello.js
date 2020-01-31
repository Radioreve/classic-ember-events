import Controller from '@ember/controller';

export default Controller.extend({

  actions: {
    actionPropertyClick(e) {
      console.log('action property on controller click event:' + e);
    },
  }
});
